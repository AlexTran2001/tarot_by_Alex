import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkVIPStatus } from "@/lib/vipUtils";

// GET - Get a specific lesson
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get lesson
    const { data, error } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get user progress for this lesson
    const { data: progressData } = await supabaseAdmin
      .from("user_progress")
      .select("completed, progress_data")
      .eq("user_id", user.id)
      .eq("lesson_id", id)
      .eq("progress_type", "lesson")
      .single();

    return NextResponse.json({
      lesson: {
        ...data,
        progress: progressData || null,
        isCompleted: progressData?.completed || false,
      },
    });
  } catch (err: any) {
    console.error("API /api/vip/lessons/[id] GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

