import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

// GET - Get single tarot card (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id, cardId } = await params;
    const deckId = id; // id is the deck ID, cardId is the card ID
    
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

    const { data, error } = await supabaseAdmin
      .from("tarot_cards")
      .select("*")
      .eq("id", cardId)
      .eq("deck_id", deckId)
      .single();

    if (error) {
      console.error("Error fetching tarot card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Tarot card not found" }, { status: 404 });
    }

    return NextResponse.json({ card: data });
  } catch (err: any) {
    console.error("API /api/admin/tarot-decks/[id]/cards/[cardId] GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update tarot card (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id, cardId } = await params;
    const deckId = id; // id is the deck ID, cardId is the card ID
    
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
    const { name, image_url, meaning } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (meaning !== undefined) updateData.meaning = meaning;

    const { data, error } = await supabaseAdmin
      .from("tarot_cards")
      .update(updateData)
      .eq("id", cardId)
      .eq("deck_id", deckId)
      .select()
      .single();

    if (error) {
      console.error("Error updating tarot card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card: data });
  } catch (err: any) {
    console.error("API /api/admin/tarot-decks/[id]/cards/[cardId] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete tarot card (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id, cardId } = await params;
    const deckId = id; // id is the deck ID, cardId is the card ID
    
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

    const { error } = await supabaseAdmin
      .from("tarot_cards")
      .delete()
      .eq("id", cardId)
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error deleting tarot card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/admin/tarot-decks/[id]/cards/[cardId] DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

