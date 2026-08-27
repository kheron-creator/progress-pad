import { createBrowserClient } from "@supabase/ssr";

import {
  persistentMaxAge,
  readRememberPreference,
  withoutCookieLifetime,
} from "@/lib/auth/remember";

import type { Database } from "./database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return createBrowserClient<Database>(url, key, {
    isSingleton: false,
    cookies: {
      getAll() {
        return document.cookie
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => {
            const separator = part.indexOf("=");
            return {
              name: separator === -1 ? part : part.slice(0, separator),
              value: separator === -1 ? "" : decodeURIComponent(part.slice(separator + 1)),
            };
          });
      },
      setAll(cookiesToSet) {
        const persist = readRememberPreference();
        cookiesToSet.forEach(({ name, value, options }) => {
          const nextOptions = persist ? { ...options, maxAge: persistentMaxAge } : withoutCookieLifetime(options);
          document.cookie = serializeCookie(name, value, nextOptions);
        });
      },
    },
  });
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    expires?: Date;
    sameSite?: true | false | "lax" | "strict" | "none";
    secure?: boolean;
    domain?: string;
  },
) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? "/"}`];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  const sameSite =
    options.sameSite === true ? "Strict" : options.sameSite === false ? undefined : options.sameSite;
  if (sameSite) {
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  } else {
    parts.push("SameSite=Lax");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}
