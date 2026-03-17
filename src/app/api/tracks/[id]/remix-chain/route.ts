import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

interface RemixChain {
  ancestors: any[];
  children: any[];
  siblings: any[];
}

async function fetchAncestors(trackId: string, depth = 0, maxDepth = 5): Promise<any[]> {
  if (depth >= maxDepth) return [];

  const { data: track } = await supabase
    .from('tracks')
    .select('id, title, creator_id, cover_url, parent_track_id')
    .eq('id', trackId)
    .single();

  if (!track || !track.parent_track_id) return [];

  const ancestors: any[] = [track];
  const nextAncestors = await fetchAncestors(track.parent_track_id, depth + 1, maxDepth);
  return [...ancestors, ...nextAncestors];
}

async function fetchChildren(trackId: string): Promise<any[]> {
  const { data: children } = await supabase
    .from('tracks')
    .select('id, title, creator_id, cover_url, is_remix')
    .eq('parent_track_id', trackId)
    .eq('status', 'published');

  return children || [];
}

async function fetchSiblings(trackId: string): Promise<any[]> {
  // Get the parent track
  const { data: track } = await supabase
    .from('tracks')
    .select('parent_track_id')
    .eq('id', trackId)
    .single();

  if (!track?.parent_track_id) return [];

  // Get all remixes of the same parent
  const { data: siblings } = await supabase
    .from('tracks')
    .select('id, title, creator_id, cover_url, is_remix')
    .eq('parent_track_id', track.parent_track_id)
    .neq('id', trackId)
    .eq('status', 'published');

  return siblings || [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;

    // Verify track exists
    const { data: track } = await supabase
      .from('tracks')
      .select('id, parent_track_id, is_remix')
      .eq('id', trackId)
      .single();

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    let ancestors: any[] = [];
    let children: any[] = [];
    let siblings: any[] = [];

    if (track.is_remix && track.parent_track_id) {
      ancestors = await fetchAncestors(track.parent_track_id);
    }

    children = await fetchChildren(trackId);
    siblings = await fetchSiblings(trackId);

    const chain: RemixChain = {
      ancestors,
      children,
      siblings,
    };

    return NextResponse.json(chain);
  } catch (error) {
    console.error('Remix chain error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remix chain' },
      { status: 500 }
    );
  }
}
