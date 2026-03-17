import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/challenges/[id]/enter
 * Submit a track to a challenge
 * Requires auth token in Authorization header
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();

    if (!body.track_id) {
      return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
    }

    // Check if challenge exists and is in 'open' status
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const now = new Date();
    const endsAt = new Date(challenge.ends_at);

    if (now > endsAt) {
      return NextResponse.json(
        { error: 'Challenge submission period has ended' },
        { status: 400 }
      );
    }

    // Check if user has already entered this challenge
    const { data: existing } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('challenge_id', id)
      .eq('creator_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted an entry to this challenge' },
        { status: 400 }
      );
    }

    // Create entry
    const { data: entry, error: entryError } = await supabase
      .from('challenge_entries')
      .insert({
        challenge_id: id,
        track_id: body.track_id,
        creator_id: user.id,
      })
      .select('*')
      .single();

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
