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

export async function PUT(
  req: NextRequest,
  { params }: { params: { spreadCardId: string } }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const spreadCardId = params.spreadCardId;
    const body = await req.json();
    const {
      question,
      answer,
      imageUrls,
      position,
    }: {
      question?: string;
      answer?: string;
      imageUrls?: string[];
      position?: number | null;
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (question !== undefined) updates.question = question?.trim() || null;
    if (answer !== undefined) updates.answer = answer?.trim() || null;
    if (imageUrls !== undefined) {
      updates.image_urls = imageUrls.map((url) => url.trim()).filter(Boolean);
    }
    if (position !== undefined) {
      updates.position =
        typeof position === "number" ? position : position === null ? null : null;
    }

    const { data, error } = await supabaseAdmin
      .from("spread_cards")
      .update(updates)
      .eq("id", spreadCardId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating spread card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, spreadCard: data });
  } catch (err: any) {
    console.error("API /api/admin/spread-cards/[spreadCardId] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { spreadCardId: string } }
) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const spreadCardId = params.spreadCardId;

    const { error } = await supabaseAdmin
      .from("spread_cards")
      .delete()
      .eq("id", spreadCardId);

    if (error) {
      console.error("Error deleting spread card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/admin/spread-cards/[spreadCardId] DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}


