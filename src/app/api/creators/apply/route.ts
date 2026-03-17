import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { awardAGNT, AGNT_REWARDS } from "@/lib/agnt";
import { sendCreatorApplicationConfirmation } from "@/lib/email";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

interface CreatorApplicationBody {
  name: string;
  email: string;
  tools: string;
  style: string;
  sample_url?: string;
  acknowledges_terms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatorApplicationBody = await request.json();
    const { name, email, tools, style, sample_url, acknowledges_terms } = body;

    // Validate required fields
    if (!name || !email || !tools || !style || !acknowledges_terms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if email already applied
    const { data: existing, error: queryError } = await supabase
      .from("creator_applications")
      .select("*")
      .eq("email", email)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      console.error("Database query error:", queryError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Email already has an active application" },
        { status: 409 }
      );
    }

    // Insert into creator_applications
    const { error: insertError } = await supabase
      .from("creator_applications")
      .insert({
        name,
        email,
        platform: "agenticradio",
        tools,
        style,
        sample_url: sample_url || null,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    // Award Founding Creator bonus AGNT (user_id is null since pre-auth)
    // Store email in reason for later reference
    await awardAGNT(
      null,
      AGNT_REWARDS.FOUNDING_CREATOR,
      `FOUNDING_CREATOR_SIGNUP_${email}`
    );

    // Send confirmation email (non-blocking, don't break API on failure)
    await sendCreatorApplicationConfirmation(name, email);

    return NextResponse.json(
      {
        success: true,
        message: "Application received! We'll be in touch within 48 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
