import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_type, content_id, reason, reporter_email } = body;

    // Validate input
    if (!content_type || !["track", "channel", "playlist"].includes(content_type)) {
      return NextResponse.json(
        { error: "Invalid content_type" },
        { status: 400 }
      );
    }

    if (!content_id || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: content_id, reason" },
        { status: 400 }
      );
    }

    // Insert report into Supabase
    const supabase = getSupabase();
    const { error } = await supabase.from("content_reports").insert({
      content_type,
      content_id,
      reason,
      reporter_email: reporter_email || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Report submitted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
