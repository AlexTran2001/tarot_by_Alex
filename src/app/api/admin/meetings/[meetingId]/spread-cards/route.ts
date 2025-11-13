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
  context: { params: Promise<{ meetingId: string }> }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const { meetingId } = await context.params;

    const { data, error } = await supabaseAdmin
      .from("spread_cards")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("position", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching spread cards:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ spreadCards: data ?? [] });
  } catch (err: any) {
    console.error("API /api/admin/meetings/[meetingId]/spread-cards GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ meetingId: string }> }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const { meetingId } = await context.params;
    const body = await req.json();
    const {
      question,
      answer,
      imageUrls,
      position,
    }: {
      question: string;
      answer: string;
      imageUrls?: string[];
      position?: number;
    } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const payload = {
      meeting_id: meetingId,
      question: question.trim(),
      answer: answer.trim(),
      image_urls: (imageUrls || []).map((url) => url.trim()).filter(Boolean),
      position: typeof position === "number" ? position : null,
    };

    const { data, error } = await supabaseAdmin
      .from("spread_cards")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating spread card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, spreadCard: data });
  } catch (err: any) {
    console.error("API /api/admin/meetings/[meetingId]/spread-cards POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}


