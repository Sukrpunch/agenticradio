import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function checkAdminKey(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key");
  return adminKey === "AgenticAdmin2026!";
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // Get query params for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let query = supabase
      .from("creator_applications")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching creator applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error("Error in admin creators list route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
