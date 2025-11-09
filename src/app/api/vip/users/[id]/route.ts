import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, setVIPStatus } from "@/lib/vipUtils";

// PUT - Set VIP status for a user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isVip, expiresAt } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (typeof isVip !== "boolean") {
      return NextResponse.json(
        { error: "isVip must be a boolean" },
        { status: 400 }
      );
    }

    const success = await setVIPStatus(id, isVip, expiresAt);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update VIP status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/vip/users/[id] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get VIP status for a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vip_users")
      .select("is_vip, vip_expires_at")
      .eq("user_id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned
      console.error("Error fetching VIP status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      isVip: data?.is_vip || false,
      expiresAt: data?.vip_expires_at || null,
    });
  } catch (err: any) {
    console.error("API /api/vip/users/[id] GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

