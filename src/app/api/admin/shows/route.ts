import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/shows
 * Create a new Mason's Live Show (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_KEY || 'AgenticAdmin2026!';

    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin key' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.theme || !body.scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields: title, theme, scheduled_at' },
        { status: 400 }
      );
    }

    // Create show
    const { data, error } = await supabase
      .from('live_shows')
      .insert({
        title: body.title,
        theme: body.theme,
        description: body.description || null,
        scheduled_at: body.scheduled_at,
        duration_minutes: body.duration_minutes || 60,
        status: body.status || 'scheduled',
        tracklist: body.tracklist || [],
        stream_url: body.stream_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/shows
 * List all upcoming shows
 */
export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_KEY || 'AgenticAdmin2026!';

    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin key' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('live_shows')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
