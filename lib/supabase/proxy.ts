import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  isPersistentSession,
  REMEMBER_COOKIE,
  withoutCookieLifetime,
} from "@/lib/auth/remember";

const publicPaths = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/password-reset-success",
  "/design-system",
]);

function isProtectedPath(pathname: string) {
  if (publicPaths.has(pathname) || pathname.startsWith("/auth/") || pathname.startsWith("/design-system")) {
    return false;
  }

  return true;
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const pathname = request.nextUrl.pathname;

  if (!url || !key) {
    if (isProtectedPath(pathname)) {
      return redirectToPath(request, "/login");
    }

    return nextWithPath(request);
  }

  const persistSession = isPersistentSession(request.cookies.get(REMEMBER_COOKIE)?.value);
  let supabaseResponse = nextWithPath(request);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = nextWithPath(request);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            persistSession ? options : withoutCookieLifetime(options),
          ),
        );
        Object.entries(headers).forEach(([headerName, value]) =>
          supabaseResponse.headers.set(headerName, value),
        );
      },
    },
  });

  // Do not put other logic between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  function finish(response: NextResponse) {
    if (!persistSession) {
      writeSessionAuthCookies(request, response);
    }
    return response;
  }

  function redirectTo(path: string) {
    const redirectResponse = redirectToPath(request, path);
    copySetCookies(supabaseResponse, redirectResponse);
    return finish(redirectResponse);
  }

  // Send signed-in users away from "/" only. Guest auth pages decide with
  // getUser() so a claims/user mismatch cannot bounce /login ↔ /home.
  if (isSignedIn && pathname === "/") {
    return redirectTo("/home");
  }

  if (!isSignedIn && pathname === "/reset-password") {
    return redirectTo("/forgot-password");
  }

  if (!isSignedIn && isProtectedPath(pathname)) {
    return redirectTo("/login");
  }

  return finish(supabaseResponse);
}

function nextWithPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-pp-redirected",
    request.nextUrl.searchParams.get("redirected") === "1" ? "1" : "0",
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function redirectToPath(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

function copySetCookies(from: NextResponse, to: NextResponse) {
  const setCookies = from.headers.getSetCookie();
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      to.headers.append("Set-Cookie", cookie);
    }
    return;
  }

  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie.name, cookie.value);
  }
}

function hasSetAuthCookies(response: NextResponse) {
  if (response.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"))) {
    return true;
  }

  return response.headers.getSetCookie().some((header) => header.startsWith("sb-"));
}

function writeSessionAuthCookies(request: NextRequest, response: NextResponse) {
  if (hasSetAuthCookies(response)) {
    return;
  }

  const secure = request.nextUrl.protocol === "https:";

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith("sb-")) {
      continue;
    }

    response.cookies.set(cookie.name, cookie.value, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure,
    });
  }
}
