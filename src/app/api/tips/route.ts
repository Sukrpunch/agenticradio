import { supabase } from '@/context/AuthContext';
import { NextRequest, NextResponse } from 'next/server';

// POST: send a tip
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { track_id } = await req.json();
    if (!track_id) {
      return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
    }

    // Get track and creator info
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('id, creator_id')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Fraud check 1: No self-tipping
    if (track.creator_id === user.id) {
      return NextResponse.json({ error: 'Cannot tip your own track' }, { status: 400 });
    }

    // Fraud check 2: Account age gate (7+ days)
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single();

    if (senderProfile?.created_at) {
      const accountAgeMs = Date.now() - new Date(senderProfile.created_at).getTime();
      const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
      if (accountAgeDays < 7) {
        return NextResponse.json({ error: 'Account must be 7+ days old to tip' }, { status: 400 });
      }
    }

    // Fraud check 3: One tip per user per track per day
    const today = new Date().toISOString().split('T')[0];
    const { data: existingTip } = await supabase
      .from('agnt_tips')
      .select('id')
      .eq('sender_id', user.id)
      .eq('track_id', track_id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existingTip) {
      return NextResponse.json({ error: 'Already tipped this track today' }, { status: 400 });
    }

    // Fraud check 4: Daily earn cap (500 AGNT max)
    const { data: tipsToday } = await supabase
      .from('agnt_tips')
      .select('id')
      .eq('recipient_id', track.creator_id)
      .gte('created_at', `${today}T00:00:00.000Z`);

    const tipsCount = tipsToday?.length || 0;
    if (tipsCount * 10 + 10 > 500) {
      return NextResponse.json({ error: 'Creator daily tip limit reached' }, { status: 400 });
    }

    // Insert tip
    const { data: tipData, error: tipError } = await supabase
      .from('agnt_tips')
      .insert({
        sender_id: user.id,
        recipient_id: track.creator_id,
        track_id: track_id,
        amount: 10,
      })
      .select('id')
      .single();

    if (tipError) {
      return NextResponse.json({ error: tipError.message }, { status: 400 });
    }

    // Get recipient email for balance update
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('id', track.creator_id)
      .single();

    // Update recipient balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ agnt_balance: supabase.rpc('increment_agnt', { x: 10, user_id: track.creator_id }) })
      .eq('id', track.creator_id);

    // Insert transaction
    const { error: txError } = await supabase
      .from('agnt_transactions')
      .insert({
        user_id: track.creator_id,
        amount: 10,
        reason: 'tip',
        type: 'tip',
        reference_id: tipData?.id,
      });

    // Fraud check 5: Velocity tracking
    if (recipientProfile?.created_at) {
      const creatorAgeMs = Date.now() - new Date(recipientProfile.created_at).getTime();
      const creatorAgeDays = creatorAgeMs / (1000 * 60 * 60 * 24);

      if (creatorAgeDays < 7) {
        const hourBucket = new Date(Math.floor(Date.now() / (60 * 60 * 1000)) * 60 * 60 * 1000).toISOString();
        
        const { data: velocityLog } = await supabase
          .from('tip_velocity_log')
          .select('new_account_tip_count')
          .eq('creator_id', track.creator_id)
          .eq('hour_bucket', hourBucket)
          .single();

        const newCount = (velocityLog?.new_account_tip_count || 0) + 1;

        if (newCount > 20) {
          console.warn(`Potential fraud: Creator ${track.creator_id} received ${newCount} tips from new accounts in 1 hour`);
        }

        await supabase
          .from('tip_velocity_log')
          .upsert({
            creator_id: track.creator_id,
            hour_bucket: hourBucket,
            new_account_tip_count: newCount,
          });
      }
    }

    // Get new balance
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('agnt_balance')
      .eq('id', track.creator_id)
      .single();

    return NextResponse.json({
      success: true,
      newBalance: updatedProfile?.agnt_balance || 0,
    });
  } catch (error) {
    console.error('Tip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: check tip status for a track
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get('track_id');

  if (!trackId) {
    return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
  }

  try {
    // Get tip count for track
    const { data: tips } = await supabase
      .from('agnt_tips')
      .select('id')
      .eq('track_id', trackId);

    const tipCount = tips?.length || 0;

    // Check if current user has tipped today
    const authHeader = req.headers.get('authorization');
    let hasTipped = false;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existingTip } = await supabase
          .from('agnt_tips')
          .select('id')
          .eq('sender_id', user.id)
          .eq('track_id', trackId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .single();

        hasTipped = !!existingTip;
      }
    }

    return NextResponse.json({
      tipCount,
      hasTipped,
    });
  } catch (error) {
    console.error('Get tips error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
