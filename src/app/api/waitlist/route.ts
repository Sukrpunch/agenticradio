import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendWaitlistConfirmation } from "@/lib/email";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("listener_events")
      .select("*")
      .eq("listener_email", email)
      .eq("event_type", "notify_waitlist")
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "Email already on waitlist" },
        { status: 200 }
      );
    }

    // Insert into listener_events
    const { error: insertError } = await supabase
      .from("listener_events")
      .insert({
        event_type: "notify_waitlist",
        listener_email: email,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    // Send confirmation email
    const emailSent = await sendWaitlistConfirmation(email);

    return NextResponse.json(
      {
        success: true,
        message: "Added to waitlist",
        emailSent,
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
