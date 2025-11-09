import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

// GET - Get single daily card (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    
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
      .from("daily_cards")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching daily card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Daily card not found" }, { status: 404 });
    }

    return NextResponse.json({ card: data });
  } catch (err: any) {
    console.error("API /api/admin/daily-cards/[id] GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update daily card (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    
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

    const updateData: any = {};
    if (card_name !== undefined) updateData.card_name = card_name;
    if (card_image_url !== undefined) updateData.card_image_url = card_image_url || null;
    if (card_meaning !== undefined) updateData.card_meaning = card_meaning;
    if (card_description !== undefined) updateData.card_description = card_description;
    if (card_date !== undefined) updateData.card_date = card_date;

    const { data, error } = await supabaseAdmin
      .from("daily_cards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating daily card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card: data });
  } catch (err: any) {
    console.error("API /api/admin/daily-cards/[id] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete daily card (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    
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
      .from("daily_cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting daily card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/admin/daily-cards/[id] DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
