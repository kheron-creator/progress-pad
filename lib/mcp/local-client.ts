import "server-only";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createProgressPadServer } from "@/lib/mcp/server";
import type { Database } from "@/lib/supabase/database";

export class PadToolError extends Error {}

/**
 * Runs one Progress Pad MCP tool in-process for a signed-in web session, so the
 * dashboard page and Claude share exactly the same reads and writes.
 */
export async function callPadTool(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string,
  args: Record<string, unknown>,
) {
  const server = createProgressPadServer({ userId, token: "", clientId: "web", supabase });
  const client = new Client({ name: "progress-pad-web", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    const result = await client.callTool({ name, arguments: args });
    const content = Array.isArray(result.content) ? result.content : [];
    const first = content[0];
    const text = first && first.type === "text" && typeof first.text === "string" ? first.text : "";

    if (result.isError) {
      throw new PadToolError(text || "Something went wrong");
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  } finally {
    await Promise.allSettled([client.close(), server.close()]);
  }
}
