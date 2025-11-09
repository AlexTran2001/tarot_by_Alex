import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkVIPStatus } from "@/lib/vipUtils";

// POST - Save user progress
export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "VIP access required" }, { status: 403 });
    }

    const body = await req.json();
    const { lesson_id, card_id, progress_type, completed, progress_data } = body;

    if (!progress_type) {
      return NextResponse.json(
        { error: "progress_type is required" },
        { status: 400 }
      );
    }

    if (progress_type === "lesson" && !lesson_id) {
      return NextResponse.json(
        { error: "lesson_id is required for lesson progress" },
        { status: 400 }
      );
    }

    if (progress_type === "card" && !card_id) {
      return NextResponse.json(
        { error: "card_id is required for card progress" },
        { status: 400 }
      );
    }

    // Upsert progress
    const progressPayload: any = {
      user_id: user.id,
      progress_type,
      completed: completed || false,
      progress_data: progress_data || {},
    };

    if (lesson_id) progressPayload.lesson_id = lesson_id;
    if (card_id) progressPayload.card_id = card_id;

    // First, try to find existing progress
    let query = supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("progress_type", progress_type);

    if (lesson_id) {
      query = query.eq("lesson_id", lesson_id);
    }
    if (card_id) {
      query = query.eq("card_id", card_id);
    }

    const { data: existing, error: existingError } = await query.maybeSingle();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("user_progress")
        .update(progressPayload)
        .eq("id", existing.id)
        .select()
        .single();
      result = { data, error };
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from("user_progress")
        .insert(progressPayload)
        .select()
        .single();
      result = { data, error };
    }

    const { data, error } = result;

    if (error) {
      console.error("Error saving progress:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: data });
  } catch (err: any) {
    console.error("API /api/vip/progress POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get user progress
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const progressType = searchParams.get("type");

    // Build query
    let query = supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id);

    if (progressType) {
      query = query.eq("progress_type", progressType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching progress:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data || [] });
  } catch (err: any) {
    console.error("API /api/vip/progress GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

