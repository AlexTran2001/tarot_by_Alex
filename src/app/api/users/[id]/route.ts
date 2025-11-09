import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// PUT - Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await req.json();
    const { email, password, user_metadata, email_confirm } = body;

    // Build update object
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (user_metadata !== undefined) updateData.user_metadata = user_metadata;
    if (email_confirm !== undefined) updateData.email_confirm = email_confirm;

    // Update user using Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);

    if (error) {
      console.error("Supabase update user error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("API /api/users/[id] PUT error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;

    // Delete user using Admin API
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("Supabase delete user error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/users/[id] DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

