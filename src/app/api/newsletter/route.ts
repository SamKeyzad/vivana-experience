import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("Newsletter: missing Supabase env vars");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // Server-side client — disable all browser-specific auth features
    const sb = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { error } = await sb
      .from("newsletter_subscribers")
      .insert({ email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true }); // already subscribed → success
      }
      console.error(`Newsletter DB error [${error.code}]: ${error.message}`);
      return NextResponse.json(
        { error: error.code, detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter route exception:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
