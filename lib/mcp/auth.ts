import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database";

export type McpUser = {
  userId: string;
  token: string;
  clientId: string;
  expiresAt?: number;
  supabase: SupabaseClient<Database>;
};

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { url, key };
}

/** Supabase Auth is the OAuth 2.1 authorization server for the MCP endpoint. */
export function authorizationServerUrl() {
  return `${supabaseConfig().url.replace(/\/$/, "")}/auth/v1`;
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/**
 * Verifies a Supabase access token (issued through the OAuth server) and returns a
 * client that queries as that user, so row level security still applies.
 */
export async function verifyMcpToken(token: string): Promise<McpUser | null> {
  const { url, key } = supabaseConfig();
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  };

  const verifier = createClient<Database>(url, key, options);
  const { data, error } = await verifier.auth.getClaims(token);
  const claims = data?.claims;

  if (error || !claims?.sub || claims.role !== "authenticated") {
    return null;
  }

  const supabase = createClient<Database>(url, key, {
    ...options,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const clientId = typeof claims.client_id === "string" ? claims.client_id : "progress-pad";

  return {
    userId: claims.sub,
    token,
    clientId,
    expiresAt: typeof claims.exp === "number" ? claims.exp : undefined,
    supabase,
  };
}
