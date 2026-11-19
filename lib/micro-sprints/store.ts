import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export type MicroSprintDoc = { id: string; data: Record<string, Json | undefined> };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const MAX_DOC_BYTES = 200_000;

export function checkSprintId(id: unknown): string {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    throw new Error("Invalid sprint id");
  }
  return id;
}

function checkSprintData(data: unknown): Record<string, Json | undefined> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Sprint data must be an object");
  }
  if (JSON.stringify(data).length > MAX_DOC_BYTES) {
    throw new Error("Sprint is too large");
  }
  return data as Record<string, Json | undefined>;
}

export async function listMicroSprints(supabase: Client): Promise<MicroSprintDoc[]> {
  const { data, error } = await supabase
    .from("micro_sprints")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    data: (row.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data : {}) as Record<
      string,
      Json | undefined
    >,
  }));
}

/** Saves the whole sprint, creating it if it is new. */
export async function saveMicroSprint(supabase: Client, userId: string, id: unknown, data: unknown) {
  const row = { user_id: userId, id: checkSprintId(id), data: checkSprintData(data) as Json };
  const { error } = await supabase.from("micro_sprints").upsert(row, { onConflict: "user_id,id" });

  if (error) {
    throw error;
  }
}

export async function deleteMicroSprint(supabase: Client, id: unknown) {
  const { error } = await supabase.from("micro_sprints").delete().eq("id", checkSprintId(id));

  if (error) {
    throw error;
  }
}

export function newSprintId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
