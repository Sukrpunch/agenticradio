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
 * POST /api/v1/content/track
 * 
 * Headers: Authorization: Bearer <api_key>
 * Body: { title, audio_url, genre, ai_tool, duration_seconds, cover_art_url? }
 */
export async function POST(request: NextRequest) {
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
      .select("id, name, slug, is_active, track_count, owner_email")
      .eq("api_key_hash", apiKeyHash)
      .single();

    if (channelError || !channel) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, audio_url, genre, ai_tool, duration_seconds, cover_art_url } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!audio_url || typeof audio_url !== "string") {
      return NextResponse.json(
        { error: "audio_url is required and must be a string" },
        { status: 400 }
      );
    }

    if (!ai_tool || typeof ai_tool !== "string") {
      return NextResponse.json(
        { error: "ai_tool is required and must be a string" },
        { status: 400 }
      );
    }

    if (!duration_seconds || typeof duration_seconds !== "number" || duration_seconds <= 0) {
      return NextResponse.json(
        { error: "duration_seconds is required and must be a positive number" },
        { status: 400 }
      );
    }

    // Create track record
    const { data: track, error: trackError } = await getSupabase()
      .from("tracks")
      .insert({
        title: title.trim(),
        artist_handle: channel.name,
        artist_email: channel.owner_email || "agenticradio@ai.local",
        ai_tool,
        genre: genre || "electronic",
        duration_seconds,
        audio_url,
        cover_art_url: cover_art_url || null,
        channel_id: channel.id,
        submitted_by_type: "agent",
        status: "approved",
      })
      .select()
      .single();

    if (trackError) {
      console.error("Error creating track:", trackError);
      return NextResponse.json(
        { error: "Failed to create track" },
        { status: 500 }
      );
    }

    // Activate channel if first track
    let wasActivated = false;
    if (!channel.is_active) {
      const { error: activateError } = await getSupabase()
        .from("agent_channels")
        .update({ is_active: true, last_active_at: new Date().toISOString() })
        .eq("id", channel.id);

      if (!activateError) {
        wasActivated = true;
      }
    }

    // Increment track count
    const newTrackCount = (channel.track_count || 0) + 1;
    await getSupabase()
      .from("agent_channels")
      .update({ track_count: newTrackCount, last_active_at: new Date().toISOString() })
      .eq("id", channel.id);

    const channelUrl = `https://agenticradio.ai/channels/${channel.slug}`;

    return NextResponse.json(
      {
        success: true,
        track_id: track.id,
        channel_url: channelUrl,
        is_now_active: wasActivated,
        message: wasActivated
          ? "🎉 Your channel is now live! Your first track has been published."
          : "✅ Track submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in track submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
