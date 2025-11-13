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

  return { supabaseAdmin };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const meetingId = params.meetingId;

    const { data, error } = await supabaseAdmin
      .from("meetings")
      .select("*, spread_cards(*)")
      .eq("id", meetingId)
      .order("position", { ascending: true, foreignTable: "spread_cards", nullsFirst: false })
      .single();

    if (error) {
      console.error("Error fetching meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({ meeting: data });
  } catch (err: any) {
    console.error("API /api/admin/meetings/[meetingId] GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const meetingId = params.meetingId;
    const body = await req.json();
    const {
      title,
      scheduledFor,
      platform,
      meetingLink,
      notes,
    }: {
      title?: string;
      scheduledFor?: string | null;
      platform?: string | null;
      meetingLink?: string | null;
      notes?: string | null;
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title?.trim() || null;
    if (scheduledFor !== undefined) {
      updates.scheduled_for = scheduledFor ? new Date(scheduledFor).toISOString() : null;
    }
    if (platform !== undefined) updates.platform = platform?.trim() || null;
    if (meetingLink !== undefined) updates.meeting_link = meetingLink?.trim() || null;
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    const { data, error } = await supabaseAdmin
      .from("meetings")
      .update(updates)
      .eq("id", meetingId)
      .select("*, spread_cards(*)")
      .single();

    if (error) {
      console.error("Error updating meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, meeting: data });
  } catch (err: any) {
    console.error("API /api/admin/meetings/[meetingId] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const meetingId = params.meetingId;

    const { error } = await supabaseAdmin.from("meetings").delete().eq("id", meetingId);

    if (error) {
      console.error("Error deleting meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/admin/meetings/[meetingId] DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}


