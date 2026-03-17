import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function GET(request: NextRequest) {
  try {
    // Get the latest weekly breakdown
    const { data: breakdowns } = await supabase
      .from('weekly_breakdowns')
      .select(`
        *,
        top_track:top_track_id(id, title, cover_url, play_count),
        top_creator:top_creator_id(id, username, display_name, avatar_url)
      `)
      .order('week_start', { ascending: false })
      .limit(1);

    if (!breakdowns || breakdowns.length === 0) {
      return NextResponse.json({ breakdown: null });
    }

    const breakdown = breakdowns[0];
    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Breakdown fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breakdown' },
      { status: 500 }
    );
  }
}
