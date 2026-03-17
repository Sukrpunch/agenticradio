import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_user_id } = body;

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

    const followerId = data.user.id;

    // Insert follow relationship
    const { error: followError } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: target_user_id,
    });

    if (followError) {
      return NextResponse.json({ error: followError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const target_user_id = url.searchParams.get('target_user_id');

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

    const followerId = data.user.id;

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', target_user_id);

    if (unfollowError) {
      return NextResponse.json({ error: unfollowError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
