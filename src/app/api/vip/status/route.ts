import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/vipUtils";

export async function GET(req: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check VIP status
    const { data, error } = await supabaseAdmin
      .from("vip_users")
      .select("is_vip, vip_expires_at")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ isVip: false });
    }

    // Check if VIP is active and not expired
    let isVip = data.is_vip;
    if (isVip && data.vip_expires_at) {
      isVip = new Date(data.vip_expires_at) > new Date();
    }

    return NextResponse.json({
      isVip,
      expiresAt: data.vip_expires_at,
    });
  } catch (err: any) {
    console.error("API /api/vip/status GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

