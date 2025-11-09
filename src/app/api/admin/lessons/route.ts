import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

// GET - List all lessons (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
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

    // Check if user is admin
    if (!checkIsAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "order_number";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build query
    let query = supabaseAdmin
      .from("lessons")
      .select("*", { count: "exact" });

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Sort
    query = query.order(sortField, { 
      ascending: sortOrder === "asc",
      nullsFirst: false 
    });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching lessons:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      lessons: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error("API /api/admin/lessons GET error:", err);
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

    // Check if user is admin
    if (!checkIsAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, video_url, image_url, order_number, lesson_type } = body;

    if (!title || !content || order_number === undefined) {
      return NextResponse.json(
        { error: "Title, content, and order_number are required" },
        { status: 400 }
      );
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
    console.error("API /api/admin/lessons POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
