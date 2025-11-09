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

// GET - List all users
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get all users using Admin API with pagination
    // Fetch all users by paginating through results
    let allUsers: any[] = [];
    let page = 1;
    const perPage = 1000; // Fetch up to 1000 users per request
    
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Supabase list users error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data.users || data.users.length === 0) {
        break;
      }

      allUsers = allUsers.concat(data.users);

      // If we got fewer users than perPage, we've reached the end
      if (data.users.length < perPage) {
        break;
      }

      page++;
    }

    // Format user data
    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.role,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (err: any) {
    console.error("API /api/users GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { email, password, user_metadata } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create user using Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: user_metadata || {},
    });

    if (error) {
      console.error("Supabase create user error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("API /api/users POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

