import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/stations/[slug]/tracks
 * Add a track to a station (owner only)
 */
export async function POST(
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

    const body = await request.json();

    if (!body.track_id) {
      return NextResponse.json(
        { error: 'Missing required field: track_id' },
        { status: 400 }
      );
    }

    // Get station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    if (station.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if track already exists in station
    const trackIds = station.track_ids || [];
    if (trackIds.includes(body.track_id)) {
      return NextResponse.json(
        { error: 'Track already in station' },
        { status: 400 }
      );
    }

    // Add track to station
    const updatedTrackIds = [...trackIds, body.track_id];

    const { data, error } = await supabase
      .from('stations')
      .update({
        track_ids: updatedTrackIds,
        track_count: updatedTrackIds.length,
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
 * DELETE /api/stations/[slug]/tracks
 * Remove a track from a station
 * Query param: track_id
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

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('track_id');

    if (!trackId) {
      return NextResponse.json(
        { error: 'Missing query param: track_id' },
        { status: 400 }
      );
    }

    // Get station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    if (station.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Remove track from station
    const trackIds = station.track_ids || [];
    const updatedTrackIds = trackIds.filter((id: string) => id !== trackId);

    const { data, error } = await supabase
      .from('stations')
      .update({
        track_ids: updatedTrackIds,
        track_count: updatedTrackIds.length,
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
