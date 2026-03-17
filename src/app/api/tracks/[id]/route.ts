import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/tracks/[id]
 * Fetch a single track
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('tracks')
      .select('*, profiles:creator_id(username, display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
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
 * PATCH /api/tracks/[id]
 * Update a track (auth required, must be owner)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this track
    const { data: track, error: fetchError } = await supabase
      .from('tracks')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (track.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Update only allowed fields
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.genre !== undefined) updateData.genre = body.genre;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.cover_url !== undefined) updateData.cover_url = body.cover_url;

    const { data, error } = await supabase
      .from('tracks')
      .update(updateData)
      .eq('id', id)
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
 * DELETE /api/tracks/[id]
 * Delete a track + storage files (auth required, must be owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this track
    const { data: track, error: fetchError } = await supabase
      .from('tracks')
      .select('creator_id, audio_url, cover_url')
      .eq('id', id)
      .single();

    if (fetchError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (track.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from storage (optional - just attempt, don't fail if unsuccessful)
    if (track.audio_url) {
      try {
        const audioPath = track.audio_url.split('/tracks/')[1];
        if (audioPath) {
          await supabase.storage.from('tracks').remove([audioPath]);
        }
      } catch (err) {
        console.error('Error deleting audio file:', err);
      }
    }

    if (track.cover_url) {
      try {
        const coverPath = track.cover_url.split('/covers/')[1];
        if (coverPath) {
          await supabase.storage.from('covers').remove([coverPath]);
        }
      } catch (err) {
        console.error('Error deleting cover file:', err);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
