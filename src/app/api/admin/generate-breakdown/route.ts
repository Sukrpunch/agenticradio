import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

function getLastMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(today.setDate(diff));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export async function POST(request: NextRequest) {
  try {
    // Check admin key
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate week dates
    const weekStart = getLastMonday();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Get top track of the week
    const { data: topTracks } = await supabase
      .from('listen_history')
      .select('track_id, tracks(id, title, creator_id, play_count)')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());

    const trackPlayCounts = new Map<string, { count: number; track: any }>();
    topTracks?.forEach(entry => {
      const track = (entry.tracks as any);
      const trackId = track.id;
      if (!trackPlayCounts.has(trackId)) {
        trackPlayCounts.set(trackId, { count: 0, track });
      }
      trackPlayCounts.get(trackId)!.count++;
    });

    let topTrackId: string | null = null;
    let topTrackTitle: string | null = null;
    if (trackPlayCounts.size > 0) {
      const topTrackEntry = Array.from(trackPlayCounts.values()).sort((a, b) => b.count - a.count)[0];
      topTrackId = topTrackEntry.track.id;
      topTrackTitle = topTrackEntry.track.title;
    }

    // Get top creator of the week
    const { data: creatorPlays } = await supabase
      .from('listen_history')
      .select('tracks(creator_id), profiles(username, display_name)')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());

    const creatorPlayCounts = new Map<string, { count: number; creator: any }>();
    creatorPlays?.forEach(entry => {
      const creatorId = (entry.tracks as any)?.creator_id;
      const creator = (entry.profiles as any);
      if (creatorId && creator) {
        if (!creatorPlayCounts.has(creatorId)) {
          creatorPlayCounts.set(creatorId, { count: 0, creator });
        }
        creatorPlayCounts.get(creatorId)!.count++;
      }
    });

    let topCreatorId: string | null = null;
    let topCreatorUsername: string | null = null;
    if (creatorPlayCounts.size > 0) {
      const topCreatorEntry = Array.from(creatorPlayCounts.values()).sort((a, b) => b.count - a.count)[0];
      topCreatorId = topCreatorEntry.creator.id;
      topCreatorUsername = topCreatorEntry.creator.username;
    }

    // Count new creators in the week
    const { data: newCreators } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());
    const newCreatorsCount = newCreators?.length || 0;

    // Total plays this week
    const totalPlaysWeek = topTracks?.length || 0;

    // Trending genre
    const { data: topTracks2 } = await supabase
      .from('listen_history')
      .select('tracks(genre)')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString())
      .limit(200);

    const genreCounts = new Map<string, number>();
    topTracks2?.forEach(entry => {
      const genre = (entry.tracks as any)?.genre;
      if (genre) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    });

    let trendingGenre = 'Lo-Fi';
    if (genreCounts.size > 0) {
      const topGenre = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1])[0];
      trendingGenre = topGenre[0];
    }

    // Build highlight text
    const dateStr = formatDate(weekStart);
    const highlightText = `Week of ${dateStr}. "${topTrackTitle || 'Unknown'}" by @${topCreatorUsername || 'creator'} led the charts with ${topTracks?.length || 0} plays. ${newCreatorsCount} new creators joined the platform. ${trendingGenre} dominated the airwaves. Another week in the books.`;

    // Upsert breakdown
    const { data, error } = await supabase
      .from('weekly_breakdowns')
      .upsert({
        week_start: weekStartStr,
        top_track_id: topTrackId,
        top_creator_id: topCreatorId,
        new_creators_count: newCreatorsCount,
        total_plays_week: totalPlaysWeek,
        trending_genre: trendingGenre,
        highlight_text: highlightText,
      }, {
        onConflict: 'week_start'
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, breakdown: data?.[0] });
  } catch (error: any) {
    console.error('Generate breakdown error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate breakdown' },
      { status: 500 }
    );
  }
}
