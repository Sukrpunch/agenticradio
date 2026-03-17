import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET /api/shows
 * Get upcoming shows (next 7 days) + current live show
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: upcomingShows, error: upcomingError } = await supabase
      .from('live_shows')
      .select('*')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', sevenDaysLater.toISOString())
      .order('scheduled_at', { ascending: true });

    if (upcomingError) {
      return NextResponse.json({ error: upcomingError.message }, { status: 500 });
    }

    // Check for current live show
    const { data: liveShows, error: liveError } = await supabase
      .from('live_shows')
      .select('*')
      .eq('status', 'live')
      .single();

    if (liveError && liveError.code !== 'PGRST116') {
      return NextResponse.json({ error: liveError.message }, { status: 500 });
    }

    // Get past shows
    const { data: pastShows, error: pastError } = await supabase
      .from('live_shows')
      .select('*')
      .lt('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: false })
      .limit(10);

    if (pastError) {
      return NextResponse.json({ error: pastError.message }, { status: 500 });
    }

    return NextResponse.json({
      upcoming: upcomingShows || [],
      current: liveShows || null,
      past: pastShows || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
