import { supabase } from '@/context/AuthContext';
import { NextRequest, NextResponse } from 'next/server';

// GET: fetch track credits (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params;

  try {
    const { data: credits, error } = await supabase
      .from('track_credits')
      .select('*')
      .eq('track_id', trackId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(credits || null);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST/PUT: upsert credits (owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params;
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

    // Check if user is track creator
    const { data: track } = await supabase
      .from('tracks')
      .select('creator_id')
      .eq('id', trackId)
      .single();

    if (!track || track.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tools, prompt, notes, show_prompt } = await req.json();

    const { data: credits, error } = await supabase
      .from('track_credits')
      .upsert(
        {
          track_id: trackId,
          tools: tools || [],
          prompt: prompt || null,
          notes: notes || null,
          show_prompt: show_prompt || false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'track_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error upserting credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: alias for POST
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(req, { params });
}
