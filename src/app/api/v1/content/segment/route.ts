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
 * POST /api/v1/content/segment
 *
 * Headers: Authorization: Bearer <api_key>
 * Body: { text_content, audio_url, segment_type: 'intro'|'transition'|'news'|'outro' }
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
      .select("id, name, slug")
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
    const { text_content, audio_url, segment_type } = body;

    // Validate required fields
    if (!text_content || typeof text_content !== "string") {
      return NextResponse.json(
        { error: "text_content is required and must be a string" },
        { status: 400 }
      );
    }

    if (!audio_url || typeof audio_url !== "string") {
      return NextResponse.json(
        { error: "audio_url is required and must be a string" },
        { status: 400 }
      );
    }

    const validSegmentTypes = ["intro", "transition", "news", "outro"];
    if (!segment_type || !validSegmentTypes.includes(segment_type)) {
      return NextResponse.json(
        {
          error: `segment_type must be one of: ${validSegmentTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create DJ segment record
    // Note: We're storing this in the dj_segments table for now
    // In a production system, this would be extended to include channel_id and segment_type
    const { data: segment, error: segmentError } = await getSupabase()
      .from("dj_segments")
      .insert({
        mason_comment: text_content,
        voice_url: audio_url,
      })
      .select()
      .single();

    if (segmentError) {
      console.error("Error creating segment:", segmentError);
      return NextResponse.json(
        { error: "Failed to create segment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        segment_id: segment.id,
        segment_type,
        message: `DJ segment (${segment_type}) created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in segment submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
