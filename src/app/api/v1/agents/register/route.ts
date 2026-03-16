import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  generateApiKey,
  hashApiKey,
  generateSlug,
  isValidEmail,
  checkRateLimit,
} from "@/lib/api-keys";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      channel_type = "agent",
      genre,
      personality,
      voice_id,
      owner_name,
      owner_email,
    } = body;

    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Validate rate limit
    if (!checkRateLimit(ip, 3, 3600)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Max 3 registrations per hour per IP.",
        },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!["agent", "human", "hybrid"].includes(channel_type)) {
      return NextResponse.json(
        { error: "channel_type must be 'agent', 'human', or 'hybrid'" },
        { status: 400 }
      );
    }

    if (owner_email && !isValidEmail(owner_email)) {
      return NextResponse.json(
        { error: "owner_email must be a valid email address" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let slugExists = true;
    let counter = 1;

    while (slugExists) {
      const { data, error } = await getSupabase()
        .from("agent_channels")
        .select("id")
        .eq("slug", slug)
        .single();

      if (error && error.code === "PGRST116") {
        // No results found, slug is unique
        slugExists = false;
      } else if (error && error.code !== "PGRST116") {
        // Different error
        console.error("Error checking slug uniqueness:", error);
        return NextResponse.json(
          { error: "Failed to register channel" },
          { status: 500 }
        );
      }

      if (slugExists) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Generate API key and hash it
    const plainApiKey = generateApiKey();
    const apiKeyHash = hashApiKey(plainApiKey);

    // Create channel record
    const streamMount = `/${slug}`;
    const { data: channel, error: channelError } = await getSupabase()
      .from("agent_channels")
      .insert({
        slug,
        name: name.trim(),
        description: description || null,
        channel_type,
        genre: genre || null,
        personality: personality || null,
        voice_id: voice_id || null,
        owner_name: owner_name || null,
        owner_email: owner_email || null,
        api_key_hash: apiKeyHash,
        stream_mount: streamMount,
        is_active: false,
        is_verified: false,
      })
      .select()
      .single();

    if (channelError) {
      console.error("Error creating channel:", channelError);
      return NextResponse.json(
        { error: "Failed to create channel" },
        { status: 500 }
      );
    }

    // Return response with plaintext API key (shown ONCE)
    const channelUrl = `https://agenticradio.ai/channels/${slug}`;
    const streamUrl = `https://stream.agenticradio.ai${streamMount}`;

    return NextResponse.json(
      {
        success: true,
        channel_id: channel.id,
        channel_slug: channel.slug,
        api_key: plainApiKey,
        stream_mount: streamMount,
        channel_url: channelUrl,
        stream_url: streamUrl,
        note: "Your API key is displayed here for the first and last time. Store it securely.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in agent registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
