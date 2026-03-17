import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/dashboard/analytics
 * Get comprehensive analytics for current authenticated creator
 * Query params: ?period=7d|30d|90d|all (default: 30d)
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date ranges
    const getDaysFromPeriod = (p: string) => {
      if (p === '7d') return 7;
      if (p === '30d') return 30;
      if (p === '90d') return 90;
      return 365; // 'all' defaults to 1 year
    };

    const days = getDaysFromPeriod(period);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    // 1. Get user's tracks
    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, title, genre, play_count, like_count, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    const trackIds = (tracks || []).map(t => t.id);

    // 2. Get plays (from listen_history)
    const { data: currentPlays } = await supabase
      .from('listen_history')
      .select('track_id, created_at, user_id')
      .in('track_id', trackIds.length > 0 ? trackIds : ['null'])
      .gte('created_at', startDate.toISOString());

    const { data: prevPlays } = await supabase
      .from('listen_history')
      .select('track_id, created_at, user_id')
      .in('track_id', trackIds.length > 0 ? trackIds : ['null'])
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // 3. Get likes (from track_likes)
    const { data: currentLikes } = await supabase
      .from('track_likes')
      .select('track_id, created_at, user_id')
      .in('track_id', trackIds.length > 0 ? trackIds : ['null'])
      .gte('created_at', startDate.toISOString());

    const { data: prevLikes } = await supabase
      .from('track_likes')
      .select('track_id, created_at, user_id')
      .in('track_id', trackIds.length > 0 ? trackIds : ['null'])
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // 4. Get followers (from follows)
    const { data: currentFollows } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', user.id)
      .gte('created_at', startDate.toISOString());

    const { data: prevFollows } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', user.id)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Get all follows for cumulative count
    const { data: allFollows } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', user.id)
      .order('created_at', { ascending: true });

    // 5. Get tips (from agnt_tips)
    const { data: currentTips } = await supabase
      .from('agnt_tips')
      .select('amount, created_at')
      .eq('creator_id', user.id)
      .gte('created_at', startDate.toISOString());

    const { data: prevTips } = await supabase
      .from('agnt_tips')
      .select('amount, created_at')
      .eq('creator_id', user.id)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // 6. Get comments (for recent activity)
    const { data: currentComments } = await supabase
      .from('comments')
      .select('track_id, created_at, user_id, body, profiles!user_id(username), tracks!track_id(title)')
      .in('track_id', trackIds.length > 0 ? trackIds : ['null'])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate metrics
    const totalPlays = (currentPlays || []).length;
    const prevTotalPlays = (prevPlays || []).length;
    const totalLikes = (currentLikes || []).length;
    const prevTotalLikes = (prevLikes || []).length;
    const totalFollowers = (allFollows || []).length;
    const totalTips = (currentTips || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    const prevTotalTips = (prevTips || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    const uniqueListeners = new Set((currentPlays || []).map(p => p.user_id)).size;
    const prevUniqueListeners = new Set((prevPlays || []).map(p => p.user_id)).size;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const playsChange = calculateChange(totalPlays, prevTotalPlays);
    const listenersChange = calculateChange(uniqueListeners, prevUniqueListeners);
    const likesChange = calculateChange(totalLikes, prevTotalLikes);
    const followersChange = calculateChange(
      (currentFollows || []).length,
      (prevFollows || []).length
    );
    const tipsChange = calculateChange(totalTips, prevTotalTips);

    // Build plays over time (daily)
    const playsOverTime = buildDailyData(currentPlays || [], startDate);

    // Build follower growth (cumulative)
    const followerGrowth = buildFollowerGrowth(allFollows || [], startDate, days);

    // Get top 5 tracks
    const topTracks = buildTopTracks(tracks || [], currentPlays || [], currentLikes || [], currentTips || []);

    // Genre breakdown
    const genreBreakdown = buildGenreBreakdown(tracks || [], currentPlays || []);

    // Recent activity
    const recentActivity = buildRecentActivity(
      currentPlays || [],
      currentLikes || [],
      currentFollows || [],
      currentTips || [],
      currentComments || [],
      tracks || []
    );

    const response = {
      overview: {
        total_plays: totalPlays,
        total_plays_change: playsChange,
        total_listeners: uniqueListeners,
        total_listeners_change: listenersChange,
        total_likes: totalLikes,
        total_likes_change: likesChange,
        total_followers: totalFollowers,
        total_followers_change: followersChange,
        total_tips: totalTips,
        total_tips_change: tipsChange,
        total_tracks: (tracks || []).length,
      },
      plays_over_time: playsOverTime,
      top_tracks: topTracks,
      follower_growth: followerGrowth,
      genre_breakdown: genreBreakdown,
      recent_activity: recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions

function buildDailyData(plays: any[], startDate: Date) {
  const daily: { [key: string]: number } = {};

  plays.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0];
    daily[date] = (daily[date] || 0) + 1;
  });

  // Fill in missing days
  const result = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      plays: daily[dateStr] || 0,
    });
  }

  return result;
}

function buildFollowerGrowth(follows: any[], startDate: Date, days: number) {
  // Get cumulative followers over time
  const dailyCounts: { [key: string]: number } = {};
  let cumulative = 0;

  // Count all followers up to startDate
  const beforeCount = follows.filter(f => new Date(f.created_at) < startDate).length;
  cumulative = beforeCount;

  // Add followers during period
  follows.forEach(f => {
    const date = new Date(f.created_at);
    if (date >= startDate) {
      const dateStr = date.toISOString().split('T')[0];
      if (!dailyCounts[dateStr]) {
        dailyCounts[dateStr] = 0;
      }
      dailyCounts[dateStr]++;
    }
  });

  // Build result with cumulative counts
  const result = [];
  const maxDays = Math.min(days, 30);
  
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    cumulative += dailyCounts[dateStr] || 0;
    result.push({
      date: dateStr,
      followers: cumulative,
    });
  }

  return result;
}

function buildTopTracks(tracks: any[], plays: any[], likes: any[], tips: any[]) {
  const trackStats: { [key: string]: any } = {};

  // Initialize
  tracks.forEach(t => {
    trackStats[t.id] = {
      id: t.id,
      title: t.title,
      genre: t.genre,
      plays: 0,
      listeners: new Set(),
      likes: 0,
      tips: 0,
    };
  });

  // Count plays
  plays.forEach(p => {
    if (trackStats[p.track_id]) {
      trackStats[p.track_id].plays++;
      trackStats[p.track_id].listeners.add(p.user_id);
    }
  });

  // Count likes
  likes.forEach(l => {
    if (trackStats[l.track_id]) {
      trackStats[l.track_id].likes++;
    }
  });

  // Count tips
  tips.forEach(t => {
    if (trackStats[t.track_id]) {
      trackStats[t.track_id].tips += t.amount || 0;
    }
  });

  // Convert to array and sort by plays
  return Object.values(trackStats)
    .map(t => ({
      ...t,
      listeners: t.listeners.size,
    }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 5);
}

function buildGenreBreakdown(tracks: any[], plays: any[]) {
  const genreStats: { [key: string]: { count: number; plays: number } } = {};

  // Count tracks by genre
  tracks.forEach(t => {
    if (!genreStats[t.genre]) {
      genreStats[t.genre] = { count: 0, plays: 0 };
    }
    genreStats[t.genre].count++;
  });

  // Count plays by genre
  plays.forEach(p => {
    const track = tracks.find(t => t.id === p.track_id);
    if (track && genreStats[track.genre]) {
      genreStats[track.genre].plays++;
    }
  });

  return Object.entries(genreStats)
    .map(([genre, stats]) => ({
      genre,
      ...stats,
    }))
    .sort((a, b) => b.plays - a.plays);
}

function buildRecentActivity(
  plays: any[],
  likes: any[],
  follows: any[],
  tips: any[],
  comments: any[],
  tracks: any[]
) {
  const activities: any[] = [];

  // Add plays
  plays.forEach(p => {
    const track = tracks.find(t => t.id === p.track_id);
    activities.push({
      type: 'play',
      created_at: p.created_at,
      track_title: track?.title,
    });
  });

  // Add likes
  likes.forEach(l => {
    const track = tracks.find(t => t.id === l.track_id);
    activities.push({
      type: 'like',
      created_at: l.created_at,
      track_title: track?.title,
    });
  });

  // Add follows
  follows.forEach(f => {
    activities.push({
      type: 'follow',
      created_at: f.created_at,
    });
  });

  // Add tips
  tips.forEach(t => {
    activities.push({
      type: 'tip',
      created_at: t.created_at,
      amount: t.amount,
    });
  });

  // Add comments
  comments.forEach(c => {
    activities.push({
      type: 'comment',
      created_at: c.created_at,
      actor_username: (c.profiles as any)?.username,
      track_title: (c.tracks as any)?.title,
    });
  });

  // Sort by most recent and limit to 20
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);
}
