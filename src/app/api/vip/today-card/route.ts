import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkVIPStatus } from "@/lib/vipUtils";
import { getTodayDate } from "@/lib/dateUtils";

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
    const isVip = await checkVIPStatus(user.id);
    if (!isVip) {
      // Log detailed error for debugging
      const { data: vipData, error: vipError } = await supabaseAdmin
        .from("vip_users")
        .select("is_vip, vip_expires_at")
        .eq("user_id", user.id)
        .single();
      
      console.error("VIP check failed for user:", user.id, {
        vipData,
        vipError,
        isVip,
        userEmail: user.email,
      });
      
      return NextResponse.json({ 
        error: "VIP access required",
        details: vipError ? vipError.message : "User is not VIP or VIP has expired"
      }, { status: 403 });
    }

    // Get today's card using Vietnam timezone (UTC+7)
    // This ensures the date matches the user's local date
    const today = getTodayDate("Asia/Ho_Chi_Minh");
    
    console.log("Fetching card for date:", today, {
      serverTime: new Date().toISOString(),
      localDate: getTodayDate("Asia/Ho_Chi_Minh"),
    });
    
    const { data, error } = await supabaseAdmin
      .from("daily_cards")
      .select("*")
      .eq("card_date", today)
      .single();

    if (error || !data) {
      // Return a default card if no card exists for today
      return NextResponse.json({
        card: {
          id: null,
          card_name: "Chưa có bài cho hôm nay",
          card_image_url: null,
          card_meaning: "Vui lòng quay lại sau",
          card_description: "Bài Tarot cho hôm nay sẽ được cập nhật sớm.",
          card_date: today,
        },
        message: "No card available for today",
      });
    }

    // Check if user has already viewed this card (save progress)
    const { data: progress } = await supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("card_id", data.id)
      .eq("progress_type", "card")
      .single();

    // If not viewed, mark as viewed
    if (!progress) {
      await supabaseAdmin
        .from("user_progress")
        .insert({
          user_id: user.id,
          card_id: data.id,
          progress_type: "card",
          completed: true,
          progress_data: { viewed_at: new Date().toISOString() },
        });
    }

    return NextResponse.json({ card: data });
  } catch (err: any) {
    console.error("API /api/vip/today-card GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

