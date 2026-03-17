import { supabase } from '@/context/AuthContext';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: tracks, error } = await supabase
      .from('playlist_tracks')
      .select('track_id, position, tracks(*)')
      .eq('playlist_id', id)
      .order('position');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(tracks?.map(t => ({ ...t.tracks, position: t.position })) || []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: playlistId } = await params;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: playlist } = await supabase
      .from('playlists')
      .select('creator_id')
      .eq('id', playlistId)
      .single();

    if (!playlist || playlist.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { track_id } = await req.json();

    if (!track_id) {
      return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
    }

    // Get max position
    const { data: maxPos } = await supabase
      .from('playlist_tracks')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const position = (maxPos?.[0]?.position ?? -1) + 1;

    const { data, error } = await supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id,
        position,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: playlistId } = await params;
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get('track_id');

  if (!trackId) {
    return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: playlist } = await supabase
      .from('playlists')
      .select('creator_id')
      .eq('id', playlistId)
      .single();

    if (!playlist || playlist.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
