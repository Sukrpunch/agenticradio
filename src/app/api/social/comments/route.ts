import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/push/sendPush';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET comments for a track
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const track_id = url.searchParams.get('track_id');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!track_id) {
      return NextResponse.json({ error: 'Missing track_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*, profile:user_id(username, avatar_url)')
      .eq('track_id', track_id)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { track_id, body: comment_body, timestamp_ms, parent_id } = body;

    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    if (!track_id || !comment_body || comment_body.length > 500) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Insert comment
    const { data: commentData, error: insertError } = await supabase
      .from('comments')
      .insert({
        track_id,
        user_id: data.user.id,
        body: comment_body,
        timestamp_ms: timestamp_ms || null,
        parent_id: parent_id || null,
      })
      .select('*, profile:user_id(username, avatar_url)')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Increment comment count on track
    await supabase
      .from('tracks')
      .update({ comment_count: supabase.raw('comment_count + 1') })
      .eq('id', track_id);

    // Send push notification to track owner (async, don't wait)
    const { data: track } = await supabase
      .from('tracks')
      .select('creator_id')
      .eq('id', track_id)
      .single();

    if (track && track.creator_id && track.creator_id !== data.user.id) {
      const { data: commenterProfile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', data.user.id)
        .single();

      const commenterName = commenterProfile?.display_name || 'Someone';
      sendPushToUser(track.creator_id, {
        title: 'AgenticRadio',
        body: `${commenterName} commented on your track`,
        url: `/listen?track=${track_id}`
      }).catch(err => console.error('Failed to send push notification:', err));
    }

    return NextResponse.json({ data: commentData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE comment
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const comment_id = url.searchParams.get('comment_id');

    if (!comment_id) {
      return NextResponse.json({ error: 'Missing comment_id' }, { status: 400 });
    }

    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comment to verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, track_id')
      .eq('id', comment_id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Decrement comment count on track
    await supabase
      .from('tracks')
      .update({ comment_count: supabase.raw('GREATEST(0, comment_count - 1)') })
      .eq('id', comment.track_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
