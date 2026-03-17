import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function masonCommentary(entry: any, track: any): string {
  if (entry.position === 1 && entry.weeks_on_chart === 1) {
    return `New at number one. ${track.title} hit different this week.`;
  }
  if (entry.position === 1) {
    return `${entry.weeks_on_chart} weeks at the top. ${track.title} won't let go.`;
  }
  if (entry.is_new_entry) {
    return `New entry at #${entry.position}. Keep an eye on this one.`;
  }
  if (entry.is_bullet && entry.prev_position) {
    return `The bullet this week — up ${entry.prev_position - entry.position} spots to #${entry.position}. ${track.title} is on a mission.`;
  }
  if (entry.prev_position && entry.prev_position < entry.position) {
    return `Sliding from #${entry.prev_position} to #${entry.position} this week. Still in the game.`;
  }
  if (entry.prev_position && entry.prev_position > entry.position) {
    return `Up ${entry.prev_position - entry.position} from last week. #${entry.position} and climbing.`;
  }
  return `Holding at #${entry.position} for ${entry.weeks_on_chart} weeks.`;
}

/**
 * GET /api/charts
 * Fetch chart entries for a specific week (defaults to latest)
 * Query params: ?week=YYYY-MM-DD (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let weekStr = searchParams.get('week');

    // If no week specified, use most recent Monday
    if (!weekStr) {
      const weekStart = getMondayOfWeek(new Date());
      weekStr = formatDate(weekStart);
    }

    // Fetch chart entries with track details
    const { data: chartEntries, error: chartError } = await supabase
      .from('chart_entries')
      .select(`
        *,
        track:tracks(id, title, cover_url, audio_url, duration_ms, creator_id, profiles!tracks_creator_id_fkey(username))
      `)
      .eq('week_start', weekStr)
      .order('position', { ascending: true });

    if (chartError) {
      return NextResponse.json({ error: chartError.message }, { status: 500 });
    }

    // Add Mason commentary to each entry
    const enrichedEntries = chartEntries?.map((entry) => ({
      ...entry,
      mason_commentary: masonCommentary(entry, entry.track),
    })) || [];

    // Get featured dedications
    const { data: dedications } = await supabase
      .from('chart_dedications')
      .select('*')
      .eq('week_start', weekStr)
      .eq('is_featured', true)
      .limit(3);

    // Get list of available weeks for selector
    const { data: weeks } = await supabase
      .from('chart_entries')
      .select('week_start')
      .order('week_start', { ascending: false })
      .limit(12);

    // Deduplicate weeks
    const uniqueWeeks = Array.from(new Set((weeks || []).map((w: any) => w.week_start)));

    return NextResponse.json({
      week: weekStr,
      entries: enrichedEntries,
      featured_dedications: dedications || [],
      available_weeks: uniqueWeeks || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charts/dedications
 * Submit a dedication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sender_name || !body.recipient_name || !body.message || !body.track_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.message.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Get current week
    const weekStart = getMondayOfWeek(new Date());
    const weekStr = formatDate(weekStart);

    const { data, error } = await supabase
      .from('chart_dedications')
      .insert({
        track_id: body.track_id,
        sender_name: body.sender_name,
        recipient_name: body.recipient_name,
        message: body.message,
        week_start: weekStr,
        is_featured: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
