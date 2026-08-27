import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isPersistentSession, REMEMBER_COOKIE, withoutCookieLifetime } from "@/lib/auth/remember";

import type { Database } from "./database";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  const cookieStore = await cookies();
  const persistSession = isPersistentSession(cookieStore.get(REMEMBER_COOKIE)?.value);

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(
              name,
              value,
              persistSession ? options : withoutCookieLifetime(options),
            ),
          );
        } catch {
          // Called from a Server Component, which cannot write cookies.
          // proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
