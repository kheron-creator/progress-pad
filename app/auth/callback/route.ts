import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = new Set(["/home", "/reset-password"]);

function safeNextPath(next: string | null) {
  if (!next) {
    return "/home";
  }

  return allowedNextPaths.has(next) ? next : "/home";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const next = safeNextPath(searchParams.get("next"));

  if (oauthError === "access_denied") {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
