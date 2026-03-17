import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_KEY = process.env.ADMIN_KEY || 'AgenticAdmin2026!';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

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
 * GET /api/challenges
 * List challenges, optionally filtered by status
 * Query params: ?status=upcoming|open|voting|complete
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const { data: challenges, error } = await supabaseService
      .from('challenges')
      .select('*')
      .order('starts_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update status dynamically and filter
    let results = (challenges || []).map((c) => ({
      ...c,
      status: getStatusForChallenge(c),
    }));

    if (statusFilter) {
      results = results.filter((c) => c.status === statusFilter);
    }

    // Get entry counts for each challenge
    const enriched = await Promise.all(
      results.map(async (challenge) => {
        const { count: entryCount } = await supabaseService
          .from('challenge_entries')
          .select('*', { count: 'exact' })
          .eq('challenge_id', challenge.id);

        const { count: voteCount } = await supabaseService
          .from('challenge_votes')
          .select('*', { count: 'exact' })
          .eq('challenge_id', challenge.id);

        return {
          ...challenge,
          entry_count: entryCount || 0,
          vote_count: voteCount || 0,
        };
      })
    );

    return NextResponse.json({ challenges: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges
 * Admin-only: Create a new challenge
 */
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.description || !body.theme || !body.starts_at || !body.ends_at || !body.voting_ends_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseService
      .from('challenges')
      .insert({
        title: body.title,
        description: body.description,
        theme: body.theme,
        rules: body.rules || null,
        prize_agnt: body.prize_agnt || 500,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        voting_ends_at: body.voting_ends_at,
        created_by: body.created_by || 'Mason',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ...data,
        status: getStatusForChallenge(data),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
