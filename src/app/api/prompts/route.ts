import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/prompts
 * Create a new prompt archive entry
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

    if (!body.prompt || !body.tool) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, tool' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prompt_archive')
      .insert({
        creator_id: user.id,
        track_id: body.track_id || null,
        tool: body.tool,
        tool_version: body.tool_version || null,
        prompt: body.prompt,
        settings: body.settings || {},
        genre: body.genre || null,
        tags: body.tags || [],
        use_count: 0,
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
 * GET /api/prompts
 * Search and list prompts from archive
 * Query params: tool, q (search query), genre, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('prompt_archive')
      .select('*, profiles:creator_id(username)', { count: 'exact' });

    if (tool) {
      query = query.eq('tool', tool);
    }

    if (genre) {
      query = query.eq('genre', genre);
    }

    if (q) {
      query = query.ilike('prompt', `%${q}%`);
    }

    const { data, count, error } = await query
      .order('use_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      prompts: data || [],
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
