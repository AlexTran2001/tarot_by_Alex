// app/api/ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, image_url, expire_at, author_id } = body;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("ads")
      .insert({
        title,
        content,
        image_url,
        expire_at: expire_at ? new Date(expire_at).toISOString() : null,
        author_id: author_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ad: data });
  } catch (err: any) {
    console.error("API /api/ads error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}
