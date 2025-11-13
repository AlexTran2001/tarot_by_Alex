"use server";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

async function getAuthorizedAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!checkIsAdmin(user)) {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { supabaseAdmin, user };
}

export async function GET(req: NextRequest) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const searchParams = req.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");
    const withCards = searchParams.get("withCards") === "true";

    let query = supabaseAdmin
      .from("meetings")
      .select(
        withCards
          ? "*, spread_cards(*), bookings:booking_id(*)"
          : "*, bookings:booking_id(*)"
      );

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    query = query.order("created_at", { ascending: false });

    if (withCards) {
      query = query.order("position", {
        ascending: true,
        nullsFirst: false,
        foreignTable: "spread_cards",
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching meetings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meetings: data ?? [] });
  } catch (err: any) {
    console.error("API /api/admin/meetings GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const body = await req.json();
    const {
      bookingId,
      title,
      scheduledFor,
      platform,
      meetingLink,
      notes,
    }: {
      bookingId: string;
      title?: string;
      scheduledFor?: string;
      platform?: string;
      meetingLink?: string;
      notes?: string;
    } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Ensure the booking exists
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("meetings")
      .insert({
        booking_id: bookingId,
        title: title?.trim() || null,
        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        platform: platform?.trim() || null,
        meeting_link: meetingLink?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select("*, spread_cards(*)")
      .single();

    if (error) {
      console.error("Error creating meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, meeting: data });
  } catch (err: any) {
    console.error("API /api/admin/meetings POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}


