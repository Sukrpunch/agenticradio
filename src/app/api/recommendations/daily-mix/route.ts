import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

interface TrackScore {
  track: any;
  score: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's last 30 listened tracks
    const { data: listenHistory } = await supabase
      .from('listen_history')
      .select('track_id, tracks(genre)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    // Get user's liked tracks
    const { data: likedTracks } = await supabase
      .from('likes')
      .select('track_id, tracks(genre, creator_id)')
      .eq('user_id', user.id)
      .limit(20);

    // Get user's search history
    const { data: searchHistory } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's followed creators
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followedCreatorIds = new Set(follows?.map(f => f.following_id) || []);

    // Extract genres from listened tracks
    const listenedGenres = listenHistory?.map(h => (h.tracks as any)?.genre).filter(Boolean) || [];
    const topListenedGenre = listenedGenres.length > 0
      ? listenedGenres.sort((a, b) => 
          listenedGenres.filter(g => g === a).length - 
          listenedGenres.filter(g => g === b).length
        )[listenedGenres.length - 1]
      : null;

    // Extract followed creator IDs from liked tracks
    const likedCreatorIds = new Set(
      likedTracks?.map(t => (t.tracks as any)?.creator_id).filter(Boolean) || []
    );

    // Extract search keywords
    const searchKeywords = new Set(
      searchHistory?.flatMap(s => s.query.toLowerCase().split(' ')) || []
    );

    // Get all published tracks
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('status', 'published')
      .limit(1000);

    if (!allTracks || allTracks.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get user's recent listen history for filtering
    const { data: recentListens } = await supabase
      .from('listen_history')
      .select('track_id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const recentListenedIds = new Set(recentListens?.map(l => l.track_id) || []);

    // Score all tracks
    const scoredTracks: TrackScore[] = allTracks
      .filter(t => t.creator_id !== user.id) // Don't recommend own tracks
      .map(track => {
        let score = 0;

        // Genre match
        if (topListenedGenre && track.genre === topListenedGenre) score += 3;

        // Creator followed
        if (followedCreatorIds.has(track.creator_id)) score += 2;

        // Title/tags match search terms
        const trackText = `${track.title} ${(track.tags || []).join(' ')}`.toLowerCase();
        for (const keyword of searchKeywords) {
          if (trackText.includes(keyword)) score += 2;
        }

        // Trending (high play count in last 7 days)
        const recentPlayThreshold = 50;
        if ((track.play_count || 0) > recentPlayThreshold) score += 1;

        // Avoid recent repeats
        if (recentListenedIds.has(track.id)) score -= 5;

        return { track, score };
      })
      .sort((a, b) => b.score - a.score);

    // For cold start (no history), return top by play_count
    if (listenHistory?.length === 0 || scoredTracks.length === 0) {
      const topTracks = allTracks
        .filter(t => t.creator_id !== user.id)
        .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        .slice(0, 10);
      return NextResponse.json({ recommendations: topTracks });
    }

    // Shuffle top 20 for variety, take top 10
    const top20 = scoredTracks.slice(0, 20);
    for (let i = top20.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top20[i], top20[j]] = [top20[j], top20[i]];
    }

    const recommendations = top20.slice(0, 10).map(st => st.track);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Daily mix error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
