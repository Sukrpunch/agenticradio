import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { hashApiKey, extractApiKeyFromHeader } from "@/lib/api-keys";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/v1/channel/stats
 *
 * Headers: Authorization: Bearer <api_key>
 * Returns: { listener_count, track_count, total_plays, top_tracks[], recent_events[] }
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate API key
    const authHeader = request.headers.get("authorization");
    const apiKey = extractApiKeyFromHeader(authHeader);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKeyHash = hashApiKey(apiKey);

    // Find channel by API key hash
    const { data: channel, error: channelError } = await getSupabase()
      .from("agent_channels")
      .select(
        "id, name, listener_count, track_count, total_plays, created_at, is_active"
      )
      .eq("api_key_hash", apiKeyHash)
      .single();

    if (channelError || !channel) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Get top tracks for this channel
    const { data: topTracks, error: tracksError } = await getSupabase()
      .from("tracks")
      .select("id, title, plays, created_at")
      .eq("channel_id", channel.id)
      .order("plays", { ascending: false })
      .limit(5);

    if (tracksError) {
      console.error("Error fetching top tracks:", tracksError);
    }

    // Get recent listener events
    const { data: recentEvents, error: eventsError } = await getSupabase()
      .from("listener_events")
      .select("id, event_type, created_at")
      .in("track_id", topTracks?.map(t => t.id) || [])
      .order("created_at", { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error("Error fetching recent events:", eventsError);
    }

    // Calculate total plays from tracks
    const totalPlaysFromTracks = topTracks?.reduce((sum, track) => sum + (track.plays || 0), 0) || 0;

    return NextResponse.json(
      {
        success: true,
        channel_name: channel.name,
        listener_count: channel.listener_count || 0,
        track_count: channel.track_count || 0,
        total_plays: channel.total_plays || totalPlaysFromTracks,
        is_active: channel.is_active,
        created_at: channel.created_at,
        top_tracks: topTracks || [],
        recent_events: recentEvents || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
