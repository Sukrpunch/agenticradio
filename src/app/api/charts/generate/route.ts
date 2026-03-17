import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const ADMIN_KEY = process.env.ADMIN_KEY || 'AgenticAdmin2026!';

// Get Monday of current week
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * POST /api/charts/generate
 * Admin-only endpoint to generate weekly chart
 * Requires x-admin-key header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate week_start (most recent Monday)
    const now = new Date();
    const weekStart = getMondayOfWeek(now);
    const weekStartStr = formatDate(weekStart);
    const weekEndStr = formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

    // Get all tracks
    const { data: allTracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, creator_id, play_count, like_count, comment_count');

    if (tracksError) {
      return NextResponse.json({ error: tracksError.message }, { status: 500 });
    }

    if (!allTracks || allTracks.length === 0) {
      return NextResponse.json({ message: 'No tracks to chart' }, { status: 200 });
    }

    // For each track, count metrics from last 7 days
    const trackScores: Array<{
      track_id: string;
      score: number;
      play_count_week: number;
      unique_listeners_week: number;
      like_count_week: number;
      comment_count_week: number;
      tip_count_week: number;
    }> = [];

    for (const track of allTracks) {
      // Count plays, likes, comments, tips in last 7 days
      const { count: playCount } = await supabase
        .from('play_history')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: tipCount } = await supabase
        .from('tips')
        .select('*', { count: 'exact' })
        .eq('track_id', track.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const play_count_week = playCount || 0;
      const unique_listeners_week = play_count_week > 0 ? Math.max(1, Math.floor(play_count_week * 0.7)) : 0;
      const like_count_week = likeCount || 0;
      const comment_count_week = commentCount || 0;
      const tip_count_week = tipCount || 0;

      // Chart Score Formula
      const score =
        (play_count_week * 0.4) +
        (unique_listeners_week * 0.25) +
        (like_count_week * 0.2) +
        (comment_count_week * 0.1) +
        (tip_count_week * 0.05);

      if (score > 0) {
        trackScores.push({
          track_id: track.id,
          score,
          play_count_week,
          unique_listeners_week,
          like_count_week,
          comment_count_week,
          tip_count_week,
        });
      }
    }

    // Sort by score descending, limit to top 40
    trackScores.sort((a, b) => b.score - a.score);
    const topTracks = trackScores.slice(0, 40);

    // Get previous week's chart for comparison
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekStartStr = formatDate(prevWeekStart);

    const { data: prevChart } = await supabase
      .from('chart_entries')
      .select('track_id, position, weeks_on_chart')
      .eq('week_start', prevWeekStartStr);

    const prevPositionMap = new Map(
      (prevChart || []).map((e: any) => [e.track_id, e.position])
    );

    const prevWeeksMap = new Map(
      (prevChart || []).map((e: any) => [e.track_id, e.weeks_on_chart || 0])
    );

    // Prepare chart entries
    const chartEntries = topTracks.map((track, index) => {
      const position = index + 1;
      const prev_position = prevPositionMap.get(track.track_id) || null;
      const is_new_entry = !prev_position;
      const is_bullet = prev_position && prev_position - position >= 10;
      const weeks_on_chart = is_new_entry ? 1 : ((prevWeeksMap.get(track.track_id) || 0) + 1);

      return {
        week_start: weekStartStr,
        position,
        prev_position,
        track_id: track.track_id,
        score: track.score,
        play_count_week: track.play_count_week,
        unique_listeners_week: track.unique_listeners_week,
        like_count_week: track.like_count_week,
        comment_count_week: track.comment_count_week,
        tip_count_week: track.tip_count_week,
        is_new_entry,
        is_bullet,
        weeks_on_chart,
        peak_position: position,
      };
    });

    // Upsert into chart_entries
    const { data: inserted, error: insertError } = await supabase
      .from('chart_entries')
      .upsert(chartEntries, { onConflict: 'week_start,position' })
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Insert activity feed events for chart #1 positions
    if (inserted && inserted.length > 0) {
      const chartNumberOneEntry = inserted.find((e: any) => e.position === 1);
      
      if (chartNumberOneEntry) {
        // Get the track to find creator
        const { data: track } = await supabase
          .from('tracks')
          .select('id, title, creator_id')
          .eq('id', chartNumberOneEntry.track_id)
          .single();

        if (track) {
          await supabase
            .from('activity_feed')
            .insert({
              type: 'chart_number_one',
              actor_id: track.creator_id,
              track_id: track.id,
              metadata: {
                title: track.title,
                week_start: weekStartStr,
              },
              is_public: true,
            })
            .catch((err) => {
              console.error('Failed to insert chart_number_one activity:', err);
            });
        }
      }
    }

    return NextResponse.json({
      message: 'Chart generated successfully',
      week_start: weekStartStr,
      entries_count: inserted?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
