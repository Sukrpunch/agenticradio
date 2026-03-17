import { supabase } from '@/context/AuthContext';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's playlists + playlists they follow
    const { data: ownPlaylists } = await supabase
      .from('playlists')
      .select('*')
      .eq('creator_id', user.id);

    const { data: followedPlaylists } = await supabase
      .from('playlist_follows')
      .select('playlist_id')
      .eq('user_id', user.id);

    const followedIds = followedPlaylists?.map(p => p.playlist_id) || [];

    let allPlaylists = ownPlaylists || [];

    if (followedIds.length > 0) {
      const { data: followed } = await supabase
        .from('playlists')
        .select('*')
        .in('id', followedIds);
      allPlaylists = [...allPlaylists, ...(followed || [])];
    }

    return NextResponse.json(allPlaylists);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, is_public } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        creator_id: user.id,
        title,
        description: description || null,
        is_public: is_public ?? true,
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
