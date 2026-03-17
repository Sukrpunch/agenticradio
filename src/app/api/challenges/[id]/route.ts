import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getStatusForChallenge(challenge: any): string {
  const now = new Date();
  const startsAt = new Date(challenge.starts_at);
  const endsAt = new Date(challenge.ends_at);
  const votingEndsAt = new Date(challenge.voting_ends_at);

  if (now < startsAt) return 'upcoming';
  if (now < endsAt) return 'open';
  if (now < votingEndsAt) return 'voting';
  return 'complete';
}

/**
 * GET /api/challenges/[id]
 * Get challenge details with entries and votes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Get entries with track and creator info
    const { data: entries, error: entriesError } = await supabase
      .from('challenge_entries')
      .select(`
        *,
        track:tracks(id, title, cover_url, audio_url, duration_ms),
        creator:profiles(id, username)
      `)
      .eq('challenge_id', id)
      .order('vote_count', { ascending: false });

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    // Get vote counts
    const { count: voteCount } = await supabase
      .from('challenge_votes')
      .select('*', { count: 'exact' })
      .eq('challenge_id', id);

    // Get winner if complete
    let winner = null;
    if (challenge.winner_track_id) {
      const { data: winnerTrack } = await supabase
        .from('tracks')
        .select('id, title, cover_url, audio_url, creator_id, profiles!tracks_creator_id_fkey(username)')
        .eq('id', challenge.winner_track_id)
        .single();

      winner = winnerTrack;
    }

    return NextResponse.json({
      ...challenge,
      status: getStatusForChallenge(challenge),
      entries: entries || [],
      vote_count: voteCount || 0,
      winner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
