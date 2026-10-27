import { NextResponse } from "next/server";

import { callPadTool, PadToolError } from "@/lib/mcp/local-client";
import { createClient } from "@/lib/supabase/server";

const TOOLS = new Set([
  "get_day",
  "rate_pillars",
  "pillar_trends",
  "add_entry",
  "update_entry",
  "list_entries",
  "mind_sweep",
  "list_mind_sweep",
  "update_mind_sweep_item",
  "list_triggers",
  "add_trigger",
  "plan_scenario",
  "set_trigger_status",
  "count_trigger",
]);

/** The dashboard page's data door: one Progress Pad tool call per request, as the signed-in user. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tool?: unknown; input?: unknown } | null;
  const tool = typeof body?.tool === "string" ? body.tool : "";
  const input =
    body?.input && typeof body.input === "object" && !Array.isArray(body.input)
      ? (body.input as Record<string, unknown>)
      : {};

  if (!TOOLS.has(tool)) {
    return NextResponse.json({ error: { code: "unknown_tool" } }, { status: 400 });
  }

  try {
    const payload = await callPadTool(supabase, user.id, tool, input);
    return NextResponse.json({ payload });
  } catch (error) {
    if (error instanceof PadToolError) {
      return NextResponse.json({ error: { code: "tool_error", message: error.message } }, { status: 422 });
    }
    return NextResponse.json({ error: { code: "server_unavailable" } }, { status: 500 });
  }
}
