import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { awardAGNT, AGNT_REWARDS } from "@/lib/agnt";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/tracks/[id]/play
 * Increment plays counter for a track and award AGNT if plays hit multiples of 100
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;

    if (!trackId) {
      return NextResponse.json(
        { error: "Missing track ID" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Fetch current plays count and track owner
    const { data: track, error: fetchError } = await supabase
      .from("tracks")
      .select("plays, creator_id")
      .eq("id", trackId)
      .single();

    if (fetchError || !track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Increment plays counter
    const oldPlays = track.plays || 0;
    const newPlays = oldPlays + 1;
    const { error: updateError } = await supabase
      .from("tracks")
      .update({ plays: newPlays })
      .eq("id", trackId);

    if (updateError) {
      console.error("Error updating plays:", updateError);
      return NextResponse.json(
        { error: "Failed to update play count" },
        { status: 500 }
      );
    }

    // Award AGNT if plays hit a multiple of 100
    if (newPlays % 100 === 0 && track.creator_id) {
      await awardAGNT(
        track.creator_id,
        AGNT_REWARDS.PLAY_100,
        `PLAY_100_MILESTONE_${newPlays}`
      );
    }

    return NextResponse.json(
      {
        plays: newPlays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in play route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
