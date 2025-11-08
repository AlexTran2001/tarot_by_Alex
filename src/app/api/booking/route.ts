import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, datetime, type, note } = body;

    // Validate required fields
    if (!name || !email || !datetime || !type) {
      return NextResponse.json(
        { error: "Name, email, datetime, and type are required" },
        { status: 400 }
      );
    }

    // Parse datetime to separate date and time
    const dateTimeObj = new Date(datetime);
    const date = dateTimeObj.toISOString().split("T")[0]; // YYYY-MM-DD format
    const time = dateTimeObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM format

    // Insert booking into database
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        name,
        email,
        date,
        time,
        type,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (err: any) {
    console.error("API /api/booking error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

