import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface LikeRequest {
  fingerprint: string;
  action: "like" | "unlike";
}

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/tracks/[id]/like
 * Body: { fingerprint: string, action: 'like' | 'unlike' }
 *
 * Handles like/unlike with idempotent behavior and per-session deduplication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;
    const body: LikeRequest = await request.json();
    const { fingerprint, action } = body;

    // Validate input
    if (!trackId || !fingerprint || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Check if fingerprint already liked this track
    const { data: existingLike, error: checkError } = await supabase
      .from("track_likes")
      .select("id")
      .eq("track_id", trackId)
      .eq("session_fingerprint", fingerprint)
      .single();

    const alreadyLiked = !checkError && existingLike;

    if (action === "like") {
      if (alreadyLiked) {
        // Already liked — idempotent, just return current state
        const { data: track } = await supabase
          .from("tracks")
          .select("likes")
          .eq("id", trackId)
          .single();

        return NextResponse.json(
          {
            liked: true,
            likes: track?.likes ?? 0,
          },
          { status: 200 }
        );
      }

      // Not liked yet — insert like and increment counter
      const insertError = await supabase.from("track_likes").insert({
        track_id: trackId,
        session_fingerprint: fingerprint,
      });

      if (insertError.error) {
        console.error("Error inserting like:", insertError.error);
        return NextResponse.json(
          { error: "Failed to add like" },
          { status: 500 }
        );
      }

      // Increment likes counter
      const { error: updateError } = await supabase.rpc(
        "increment_likes",
        { track_id: trackId }
      );

      if (updateError) {
        // If RPC doesn't exist, do it manually
        const { data: track, error: fetchError } = await supabase
          .from("tracks")
          .select("likes")
          .eq("id", trackId)
          .single();

        if (!fetchError && track) {
          const newLikes = (track.likes || 0) + 1;
          await supabase
            .from("tracks")
            .update({ likes: newLikes })
            .eq("id", trackId);

          return NextResponse.json(
            {
              liked: true,
              likes: newLikes,
            },
            { status: 200 }
          );
        }
      }

      // Get updated likes count
      const { data: updatedTrack } = await supabase
        .from("tracks")
        .select("likes")
        .eq("id", trackId)
        .single();

      return NextResponse.json(
        {
          liked: true,
          likes: updatedTrack?.likes ?? 0,
        },
        { status: 200 }
      );
    } else {
      // action === "unlike"
      if (!alreadyLiked) {
        // Not liked — idempotent, just return current state
        const { data: track } = await supabase
          .from("tracks")
          .select("likes")
          .eq("id", trackId)
          .single();

        return NextResponse.json(
          {
            liked: false,
            likes: track?.likes ?? 0,
          },
          { status: 200 }
        );
      }

      // Already liked — delete and decrement
      const { error: deleteError } = await supabase
        .from("track_likes")
        .delete()
        .eq("track_id", trackId)
        .eq("session_fingerprint", fingerprint);

      if (deleteError) {
        console.error("Error deleting like:", deleteError);
        return NextResponse.json(
          { error: "Failed to remove like" },
          { status: 500 }
        );
      }

      // Decrement likes counter
      const { data: track, error: fetchError } = await supabase
        .from("tracks")
        .select("likes")
        .eq("id", trackId)
        .single();

      if (!fetchError && track) {
        const newLikes = Math.max(0, (track.likes || 1) - 1);
        await supabase
          .from("tracks")
          .update({ likes: newLikes })
          .eq("id", trackId);

        return NextResponse.json(
          {
            liked: false,
            likes: newLikes,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          liked: false,
          likes: 0,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in like route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
