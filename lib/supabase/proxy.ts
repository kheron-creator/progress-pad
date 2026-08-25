import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Do not fake a connection if credentials are not configured yet.
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
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
  const pathname = request.nextUrl.pathname;

  function redirectTo(path: string) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  if (isSignedIn && (isGuestOnlyPath(pathname) || pathname === "/")) {
    return redirectTo("/home");
  }

  if (!isSignedIn && pathname === "/reset-password") {
    return redirectTo("/forgot-password");
  }

  if (!isSignedIn && isProtectedPath(pathname)) {
    return redirectTo("/login");
  }

  return supabaseResponse;
}

const guestOnlyPaths = new Set(["/login", "/signup", "/forgot-password"]);

const publicPaths = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/password-reset-success",
  "/design-system",
]);

function isGuestOnlyPath(pathname: string) {
  return guestOnlyPaths.has(pathname);
}

function isProtectedPath(pathname: string) {
  if (publicPaths.has(pathname) || pathname.startsWith("/auth/") || pathname.startsWith("/design-system")) {
    return false;
  }

  return true;
}
