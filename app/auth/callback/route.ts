import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { RECOVERY_COOKIE, RECOVERY_MAX_AGE } from "@/lib/auth/remember";
import { appPathForUser } from "@/lib/auth/routing";
import { getCurrentUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = new Set(["/home", "/onboarding", "/reset-password"]);

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
      if (next === "/reset-password") {
        const cookieStore = await cookies();
        cookieStore.set(RECOVERY_COOKIE, "1", {
          path: "/",
          maxAge: RECOVERY_MAX_AGE,
          sameSite: "lax",
          httpOnly: true,
          secure: origin.startsWith("https"),
        });
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // `next` from Google/email confirm is only a hint. Completed users always
      // go to /home even if the OAuth start URL said /onboarding.
      const user = await getCurrentUser();
      const destination = user ? appPathForUser(user) : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }

    if (next === "/reset-password") {
      return NextResponse.redirect(`${origin}/forgot-password?error=auth`);
    }

    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
