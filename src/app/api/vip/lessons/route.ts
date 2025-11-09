import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkVIPStatus } from "@/lib/vipUtils";

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
      return NextResponse.json({ error: "VIP access required" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const lessonType = searchParams.get("type");

    // Build query
    let query = supabaseAdmin
      .from("lessons")
      .select("*")
      .order("order_number", { ascending: true });

    if (lessonType) {
      query = query.eq("lesson_type", lessonType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching lessons:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user progress for lessons
    const { data: progressData } = await supabaseAdmin
      .from("user_progress")
      .select("lesson_id, completed, progress_data")
      .eq("user_id", user.id)
      .eq("progress_type", "lesson");

    // Map progress to lessons
    const lessonsWithProgress = (data || []).map((lesson) => {
      const progress = progressData?.find((p) => p.lesson_id === lesson.id);
      return {
        ...lesson,
        progress: progress || null,
        isCompleted: progress?.completed || false,
      };
    });

    return NextResponse.json({ lessons: lessonsWithProgress });
  } catch (err: any) {
    console.error("API /api/vip/lessons GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new lesson (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { title, content, video_url, image_url, order_number, lesson_type } = body;

    if (!title || !content || order_number === undefined) {
      return NextResponse.json(
        { error: "Title, content, and order_number are required" },
        { status: 400 }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        title,
        content,
        video_url: video_url || null,
        image_url: image_url || null,
        order_number,
        lesson_type: lesson_type || "general",
        author_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lesson:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lesson: data });
  } catch (err: any) {
    console.error("API /api/vip/lessons POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

