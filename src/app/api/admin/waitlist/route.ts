import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function checkAdminKey(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key");
  return adminKey === "AgenticAdmin2026!";
}

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("listener_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "notify_waitlist");

    if (error) {
      throw error;
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error("Error fetching waitlist count:", err);
    return NextResponse.json(
      { error: "Failed to fetch waitlist count" },
      { status: 500 }
    );
  }
}
