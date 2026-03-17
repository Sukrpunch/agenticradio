import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/stations/[slug]/follow
 * Follow a station
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

    // Get station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('id, follower_count')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('station_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('station_id', station.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already following this station' },
        { status: 400 }
      );
    }

    // Add follow
    const { error: followError } = await supabase
      .from('station_follows')
      .insert({
        user_id: user.id,
        station_id: station.id,
      });

    if (followError) {
      return NextResponse.json({ error: followError.message }, { status: 500 });
    }

    // Update follower count
    const { data, error } = await supabase
      .from('stations')
      .update({
        follower_count: (station.follower_count || 0) + 1,
      })
      .eq('id', station.id)
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
 * DELETE /api/stations/[slug]/follow
 * Unfollow a station
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

    // Get station
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('id, follower_count')
      .eq('slug', params.slug)
      .single();

    if (stationError) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Remove follow
    const { error: followError } = await supabase
      .from('station_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('station_id', station.id);

    if (followError) {
      return NextResponse.json({ error: followError.message }, { status: 500 });
    }

    // Update follower count
    const { data, error } = await supabase
      .from('stations')
      .update({
        follower_count: Math.max(0, (station.follower_count || 1) - 1),
      })
      .eq('id', station.id)
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
