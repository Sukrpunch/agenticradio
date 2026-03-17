import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * POST /api/stations
 * Create a new community station
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || !body.theme) {
      return NextResponse.json(
        { error: 'Missing required fields: name, theme' },
        { status: 400 }
      );
    }

    const slug = generateSlug(body.name);

    // Check if slug already exists
    const { data: existingStation } = await supabase
      .from('stations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStation) {
      return NextResponse.json(
        { error: 'A station with this name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('stations')
      .insert({
        name: body.name,
        slug,
        theme: body.theme,
        description: body.description || null,
        owner_id: user.id,
        is_public: body.is_public !== false,
        cover_url: body.cover_url || null,
        track_ids: [],
        track_count: 0,
        follower_count: 0,
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
 * GET /api/stations
 * List public stations sorted by follower count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('stations')
      .select('*, profiles:owner_id(username)', { count: 'exact' })
      .eq('is_public', true)
      .order('follower_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      stations: data || [],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
