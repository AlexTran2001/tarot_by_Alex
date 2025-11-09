import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

// GET - List all daily cards (admin only)
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
    const sortField = searchParams.get("sortField") || "card_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    let query = supabaseAdmin
      .from("daily_cards")
      .select("*", { count: "exact" });

    // Search filter
    if (search) {
      query = query.or(`card_name.ilike.%${search}%,card_meaning.ilike.%${search}%,card_description.ilike.%${search}%`);
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
      console.error("Error fetching daily cards:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      cards: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error("API /api/admin/daily-cards GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new daily card (admin only)
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
    const { card_name, card_image_url, card_meaning, card_description, card_date } = body;

    if (!card_name || !card_meaning || !card_description || !card_date) {
      return NextResponse.json(
        { error: "Card name, meaning, description, and date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("daily_cards")
      .insert({
        card_name,
        card_image_url: card_image_url || null,
        card_meaning,
        card_description,
        card_date,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating daily card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card: data });
  } catch (err: any) {
    console.error("API /api/admin/daily-cards POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
