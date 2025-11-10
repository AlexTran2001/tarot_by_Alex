import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

// GET - List all cards in a deck (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const deckId = id; // id is the deck ID in this route
    
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
    const sortField = searchParams.get("sortField") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    let query = supabaseAdmin
      .from("tarot_cards")
      .select("*", { count: "exact" })
      .eq("deck_id", deckId);

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,meaning.ilike.%${search}%`);
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
      console.error("Error fetching tarot cards:", error);
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
    console.error("API /api/admin/tarot-decks/[id]/cards GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new tarot card in a deck (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const deckId = id; // id is the deck ID in this route
    
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

    // Verify deck exists
    const { data: deck, error: deckError } = await supabaseAdmin
      .from("tarot_decks")
      .select("id")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, image_url, meaning } = body;

    if (!name || !meaning) {
      return NextResponse.json(
        { error: "Card name and meaning are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tarot_cards")
      .insert({
        deck_id: deckId,
        name,
        image_url: image_url || null,
        meaning,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating tarot card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card: data });
  } catch (err: any) {
    console.error("API /api/admin/tarot-decks/[id]/cards POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

