import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET /api/activity
 * Fetch global activity feed
 * Query params:
 *   - limit: number (default 20, max 100)
 *   - before: ISO timestamp cursor for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const before = searchParams.get('before');

    let query = supabase
      .from('activity_feed')
      .select(`
        id,
        type,
        metadata,
        created_at,
        actor_id,
        track_id,
        challenge_id,
        actor:actor_id(id, username, display_name, avatar_url),
        track:track_id(id, title, genre, cover_url),
        challenge:challenge_id(id, name, prize)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        limit,
        count: (data || []).length,
        cursor: data && data.length > 0 ? data[data.length - 1].created_at : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
