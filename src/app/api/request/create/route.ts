import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { analyzeVibe } from "@/lib/mason/brain";
import { NextRequest, NextResponse } from "next/server";

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Helper: Generate URL slug from playlist name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + `-${Date.now().toString(36)}`;
}

// Helper: Generate a random creator handle
function generateCreatorHandle(): string {
  const adjectives = ["Cosmic", "Vibe", "Echo", "Neon", "Sonic", "Solar", "Lunar", "Pixel"];
  const nouns = ["Voyager", "Dreamer", "Listener", "Collector", "Explorer", "Curator"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 10000);
  return `${adj}${noun}${num}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vibe_description, genre_hint, playlist_name, email } = body;

    // Validate required fields
    if (!vibe_description) {
      return NextResponse.json(
        { error: "vibe_description is required" },
        { status: 400 }
      );
    }

    // Step 1: Save vibe request to database
    const { data: vibeRequest, error: vibeError } = await getSupabase()
      .from("vibe_requests")
      .insert({
        vibe_input: vibe_description,
        genre_hint: genre_hint || null,
      })
      .select()
      .single();

    if (vibeError) {
      console.error("Error saving vibe request:", vibeError);
      return NextResponse.json(
        { error: "Failed to save vibe request" },
        { status: 500 }
      );
    }

    // Step 2: MASON VIBE ANALYSIS (Claude)
    console.log("Analyzing vibe with Mason...");
    const analysis = await analyzeVibe(vibe_description, genre_hint);

    // Update vibe request with Mason's analysis
    const { error: updateError } = await getSupabase()
      .from("vibe_requests")
      .update({
        mason_analysis: analysis,
      })
      .eq("id", vibeRequest.id);

    if (updateError) {
      console.error("Error updating vibe request with analysis:", updateError);
    }

    // Step 3: Create playlist
    const finalPlaylistName = playlist_name || analysis.playlistName;
    const slug = generateSlug(finalPlaylistName);
    const creatorHandle = generateCreatorHandle();

    const { data: playlist, error: playlistError } = await getSupabase()
      .from("playlists")
      .insert({
        name: finalPlaylistName,
        slug: slug,
        creator_email: email || null,
        creator_handle: creatorHandle,
        vibe_description: vibe_description,
        vibe_request_id: vibeRequest.id,
        is_public: true,
      })
      .select()
      .single();

    if (playlistError) {
      console.error("Error creating playlist:", playlistError);
      return NextResponse.json(
        { error: "Failed to create playlist" },
        { status: 500 }
      );
    }

    // Step 4: SUNO GENERATION (TODO - Stubbed for now)
    // TODO: Call Suno API with analysis.sunoPrompt to generate 5 tracks
    // For now, we'll create placeholder track records
    console.log("TODO: Generate tracks with Suno API using prompt:", analysis.sunoPrompt);

    const placeholderTracks = [
      {
        title: `${analysis.playlistName} - Track 1`,
        artist_handle: creatorHandle,
        artist_email: email || "generated@agenticradio.ai",
        ai_tool: "Suno",
        genre: genre_hint || "electronic",
        duration_seconds: 180,
        audio_url: "", // TODO: Get from Suno API
        cover_art_url: "", // TODO: Generate or get from Suno
        status: "approved",
        playlist_id: playlist.id,
      },
      {
        title: `${analysis.playlistName} - Track 2`,
        artist_handle: creatorHandle,
        artist_email: email || "generated@agenticradio.ai",
        ai_tool: "Suno",
        genre: genre_hint || "electronic",
        duration_seconds: 200,
        audio_url: "",
        cover_art_url: "",
        status: "approved",
        playlist_id: playlist.id,
      },
      {
        title: `${analysis.playlistName} - Track 3`,
        artist_handle: creatorHandle,
        artist_email: email || "generated@agenticradio.ai",
        ai_tool: "Suno",
        genre: genre_hint || "electronic",
        duration_seconds: 175,
        audio_url: "",
        cover_art_url: "",
        status: "approved",
        playlist_id: playlist.id,
      },
      {
        title: `${analysis.playlistName} - Track 4`,
        artist_handle: creatorHandle,
        artist_email: email || "generated@agenticradio.ai",
        ai_tool: "Suno",
        genre: genre_hint || "electronic",
        duration_seconds: 190,
        audio_url: "",
        cover_art_url: "",
        status: "approved",
        playlist_id: playlist.id,
      },
      {
        title: `${analysis.playlistName} - Track 5`,
        artist_handle: creatorHandle,
        artist_email: email || "generated@agenticradio.ai",
        ai_tool: "Suno",
        genre: genre_hint || "electronic",
        duration_seconds: 185,
        audio_url: "",
        cover_art_url: "",
        status: "approved",
        playlist_id: playlist.id,
      },
    ];

    const { data: tracks, error: tracksError } = await getSupabase()
      .from("tracks")
      .insert(placeholderTracks)
      .select();

    if (tracksError) {
      console.error("Error creating placeholder tracks:", tracksError);
      // Don't fail here - we can still return the playlist
    }

    // Update playlist with track IDs
    const trackIds = tracks?.map((t: { id: string }) => t.id) || [];
    if (trackIds.length > 0) {
      await getSupabase()
        .from("playlists")
        .update({
          track_ids: trackIds,
        })
        .eq("id", playlist.id);
    }

    // Step 5: Return playlist ID for redirect
    return NextResponse.json(
      {
        success: true,
        playlistId: playlist.id,
        playlistSlug: playlist.slug,
        analysis: analysis,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in create request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
