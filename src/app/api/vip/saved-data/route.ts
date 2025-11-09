import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkVIPStatus } from "@/lib/vipUtils";

// POST - Save user data
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
    const { data_type, data_content, expires_at } = body;

    if (!data_type || !data_content) {
      return NextResponse.json(
        { error: "data_type and data_content are required" },
        { status: 400 }
      );
    }

    // Upsert saved data (update if exists for same type, or create new)
    const { data, error } = await supabaseAdmin
      .from("user_saved_data")
      .upsert({
        user_id: user.id,
        data_type,
        data_content,
        expires_at: expires_at || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,data_type",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, savedData: data });
  } catch (err: any) {
    console.error("API /api/vip/saved-data POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get user saved data
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
    const dataType = searchParams.get("type");

    // Build query
    let query = supabaseAdmin
      .from("user_saved_data")
      .select("*")
      .eq("user_id", user.id);

    if (dataType) {
      query = query.eq("data_type", dataType);
    }

    // Filter out expired data
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching saved data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ savedData: data || [] });
  } catch (err: any) {
    console.error("API /api/vip/saved-data GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user saved data
export async function DELETE(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const dataType = searchParams.get("type");
    const id = searchParams.get("id");

    if (!dataType && !id) {
      return NextResponse.json(
        { error: "type or id is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from("user_saved_data")
      .delete()
      .eq("user_id", user.id);

    if (id) {
      query = query.eq("id", id);
    } else if (dataType) {
      query = query.eq("data_type", dataType);
    }

    const { error } = await query;

    if (error) {
      console.error("Error deleting saved data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/vip/saved-data DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

