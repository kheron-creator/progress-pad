import { z } from "zod";

import { todayIso } from "@/lib/mcp/dates";
import { errorMessage, routeUser } from "@/lib/micro-sprints/route-user";

export const dynamic = "force-dynamic";

// The three pad actions the Micro sprints page needs: read open Mind Sweep items,
// tick one achieved (or back to todo), and log a win on today's Done List.
const action = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("list_mind_sweep"),
    input: z.object({ limit: z.number().int().min(1).max(200).optional() }).passthrough().optional(),
  }),
  z.object({
    tool: z.literal("update_mind_sweep_item"),
    input: z.object({ id: z.string().uuid(), status: z.enum(["todo", "achieved"]) }),
  }),
  z.object({
    tool: z.literal("add_entry"),
    input: z.object({
      kind: z.literal("done"),
      text: z.string().trim().min(1).max(500),
      notes: z.string().max(10000).optional(),
    }),
  }),
]);

export async function POST(request: Request) {
  const user = await routeUser();
  if (!user) {
    return Response.json({ error: "Sign in to use your Mind Sweep." }, { status: 401 });
  }

  const parsed = action.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  const { supabase, userId } = user;
  const call = parsed.data;

  try {
    if (call.tool === "list_mind_sweep") {
      const { data, error } = await supabase
        .from("mind_sweep_items")
        .select("id, on_date, title, notes, status, sort_order")
        .eq("status", "todo")
        .order("on_date", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(call.input?.limit ?? 100);
      if (error) {
        throw error;
      }
      return Response.json({ payload: { items: data } });
    }

    if (call.tool === "update_mind_sweep_item") {
      const { data, error } = await supabase
        .from("mind_sweep_items")
        .update({ status: call.input.status })
        .eq("id", call.input.id)
        .select("id, status")
        .maybeSingle();
      if (error) {
        throw error;
      }
      return Response.json({ payload: { updated: data } });
    }

    const { data, error } = await supabase
      .from("writing_entries")
      .insert({
        user_id: userId,
        on_date: todayIso(),
        kind: "done",
        title: call.input.text,
        notes: call.input.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) {
      throw error;
    }
    return Response.json({ payload: { added: data } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
