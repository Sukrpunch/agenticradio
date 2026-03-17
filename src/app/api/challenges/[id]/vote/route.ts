import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/challenges/[id]/vote
 * Vote for an entry in a challenge
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

    if (!body.entry_id) {
      return NextResponse.json({ error: 'entry_id is required' }, { status: 400 });
    }

    // Check if challenge exists and is in 'voting' status
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
    const votingEndsAt = new Date(challenge.voting_ends_at);

    if (now < endsAt) {
      return NextResponse.json(
        { error: 'Voting has not started yet' },
        { status: 400 }
      );
    }

    if (now > votingEndsAt) {
      return NextResponse.json(
        { error: 'Voting period has ended' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('challenge_votes')
      .select('*')
      .eq('challenge_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this challenge' },
        { status: 400 }
      );
    }

    // Record the vote
    const { data: vote, error: voteError } = await supabase
      .from('challenge_votes')
      .insert({
        user_id: user.id,
        challenge_id: id,
        entry_id: body.entry_id,
      })
      .select('*')
      .single();

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }

    // Increment vote count on entry
    const { data: entry } = await supabase
      .from('challenge_entries')
      .select('vote_count')
      .eq('id', body.entry_id)
      .single();

    if (entry) {
      await supabase
        .from('challenge_entries')
        .update({ vote_count: (entry.vote_count || 0) + 1 })
        .eq('id', body.entry_id);
    }

    // Award 5 AGNT to voter (would need to implement AGNT system)
    // For now, just return success

    return NextResponse.json(vote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
