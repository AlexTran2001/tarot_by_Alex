"use server";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/vipUtils";
import { checkIsAdmin } from "@/lib/adminUtils";

async function getAuthorizedAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!checkIsAdmin(user)) {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { supabaseAdmin };
}

export async function GET(req: NextRequest) {
  try {
    const authorized = await getAuthorizedAdmin(req);
    if ("error" in authorized) {
      return authorized.error;
    }
    const { supabaseAdmin } = authorized;

    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const perPage = 200;
    let page = 1;
    let foundUser: any = null;

    while (!foundUser) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Error searching user by email:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const users = data?.users ?? [];
      foundUser =
        users.find((user) => user.email?.toLowerCase() === normalizedEmail) ?? null;

      if (foundUser || users.length < perPage) {
        break;
      }

      page += 1;

      if (page > 50) {
        // safety break for very large user bases
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json({ user: null });
    }

    const user = foundUser;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
    });
  } catch (err: any) {
    console.error("API /api/admin/users/search GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}


