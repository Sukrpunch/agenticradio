import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/stations/[slug]
 * Get a station with its tracks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('*, profiles:owner_id(username, id)')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Get full track details if track_ids exist
    let tracks = [];
    if (station.track_ids && station.track_ids.length > 0) {
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*, profiles:creator_id(username)')
        .in('id', station.track_ids);

      if (!tracksError) {
        tracks = tracksData || [];
      }
    }

    return NextResponse.json({
      ...station,
      tracks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stations/[slug]
 * Update a station (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Check if user owns the station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    if (station.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('stations')
      .update({
        name: body.name,
        description: body.description,
        theme: body.theme,
        is_public: body.is_public,
        cover_url: body.cover_url,
      })
      .eq('slug', params.slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stations/[slug]
 * Delete a station (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Check if user owns the station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    if (station.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('slug', params.slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
