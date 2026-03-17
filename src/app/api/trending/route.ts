import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/trending
 * Get trending tracks by period
 * Query params: ?period=day|week|month (default: week)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Calculate time range
    let daysBack = 7; // week
    if (period === 'day') daysBack = 1;
    if (period === 'month') daysBack = 30;

    const startTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    // Get all tracks with recent activity
    const { data: allTracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, cover_url, audio_url, duration_ms, creator_id, play_count');

    if (tracksError) {
      return NextResponse.json({ error: tracksError.message }, { status: 500 });
    }

    if (!allTracks || allTracks.length === 0) {
      return NextResponse.json({ tracks: [], rising_fast: [] });
    }

    // For each track, calculate trending score based on recent activity
    const trendingScores: Array<{
      track_id: string;
      plays_period: number;
      likes_period: number;
      plays_prev: number;
      title: string;
      cover_url: string;
      audio_url: string;
      duration_ms: number;
      creator_id: string;
      play_count: number;
    }> = [];

    for (const track of allTracks) {
      const { count: playsThisPeriod } = await supabase
        .from('play_history')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', startTime);

      const { count: likesThisPeriod } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', startTime);

      // Calculate previous period for growth
      const prevStartTime = new Date(
        Date.now() - (daysBack * 2) * 24 * 60 * 60 * 1000
      ).toISOString();
      const prevEndTime = startTime;

      const { count: playsPrevPeriod } = await supabase
        .from('play_history')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', prevStartTime)
        .lt('created_at', prevEndTime);

      const plays_period = playsThisPeriod || 0;
      const likes_period = likesThisPeriod || 0;
      const plays_prev = playsPrevPeriod || 0;

      if (plays_period > 0 || likes_period > 0) {
        trendingScores.push({
          track_id: track.id,
          plays_period,
          likes_period,
          plays_prev,
          title: track.title,
          cover_url: track.cover_url,
          audio_url: track.audio_url,
          duration_ms: track.duration_ms,
          creator_id: track.creator_id,
          play_count: track.play_count,
        });
      }
    }

    // Sort by trending score (plays + likes)
    trendingScores.sort((a, b) => {
      const scoreA = a.plays_period * 0.7 + a.likes_period * 0.3;
      const scoreB = b.plays_period * 0.7 + b.likes_period * 0.3;
      return scoreB - scoreA;
    });

    // Get top 20 for main trending
    const topTrending = trendingScores.slice(0, 20);

    // Calculate rising fast (biggest percentage growth)
    const risingFast = trendingScores
      .filter((t) => t.plays_prev > 0) // Must have had activity before
      .map((t) => ({
        ...t,
        growth_percent:
          t.plays_prev > 0 ? ((t.plays_period - t.plays_prev) / t.plays_prev) * 100 : 0,
      }))
      .sort((a, b) => b.growth_percent - a.growth_percent)
      .slice(0, 3);

    // Fetch creator info for trending tracks
    const creatorIds = Array.from(new Set(topTrending.map((t) => t.creator_id)));
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', creatorIds);

    const creatorMap = new Map(creators?.map((c) => [c.id, c]) || []);

    const enrichedTrending = topTrending.map((track) => ({
      ...track,
      creator: creatorMap.get(track.creator_id),
    }));

    const enrichedRisingFast = risingFast.map((track) => ({
      ...track,
      creator: creatorMap.get(track.creator_id),
    }));

    return NextResponse.json({
      period,
      tracks: enrichedTrending,
      rising_fast: enrichedRisingFast,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
