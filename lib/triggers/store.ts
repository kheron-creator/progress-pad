import type { SupabaseClient } from "@supabase/supabase-js";

import { triggerOptions } from "@/lib/onboarding/content";
import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export type StoredTrigger = {
  id: string;
  name: string;
  emoji: string | null;
  source_key: string | null;
};

export type StoredScenario = {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  triggerIds: string[];
};

export type DateAssignmentItem = {
  kind: "trigger" | "scenario";
  id: string;
};

export type StoredDatePlan = {
  assignments: Record<string, DateAssignmentItem[]>;
  triggers: StoredTrigger[];
  scenarios: StoredScenario[];
};

export type DateTriggerStatus = "todo" | "achieved";

export type FlattenedDayTrigger = {
  id: string;
  name: string;
  emoji: string | null;
  status: DateTriggerStatus;
};

export const MAX_TRIGGERS_PER_DATE = 10;

const TRIGGER_CATALOG = new Map<string, (typeof triggerOptions)[number]>(
  triggerOptions.map((item) => [item.id, item]),
);

export async function ensureOnboardingTriggers(
  supabase: Client,
  userId: string,
  triggerIds: string[],
) {
  const keys = uniqueKeys(triggerIds).filter((key) => TRIGGER_CATALOG.has(key));
  if (keys.length === 0) {
    return;
  }

  const { data: existing, error: readError } = await supabase
    .from("triggers")
    .select("id, source_key, emoji")
    .eq("user_id", userId)
    .in("source_key", keys);

  if (readError) {
    throw readError;
  }

  const have = new Set(
    (existing ?? []).map((row) => row.source_key).filter((key): key is string => Boolean(key)),
  );
  const rows = keys
    .filter((source_key) => !have.has(source_key))
    .map((source_key) => {
      const item = TRIGGER_CATALOG.get(source_key);
      return {
        user_id: userId,
        name: item?.label ?? source_key,
        emoji: item?.emoji,
        source_key,
      };
    });

  if (rows.length > 0) {
    const { error } = await supabase.from("triggers").insert(rows);
    if (error) {
      throw error;
    }
  }

  const missingEmoji = (existing ?? []).filter((row) => row.source_key && !row.emoji);
  for (const row of missingEmoji) {
    const item = row.source_key ? TRIGGER_CATALOG.get(row.source_key) : undefined;
    if (!item) continue;
    const { error } = await supabase.from("triggers").update({ emoji: item.emoji }).eq("id", row.id);
    if (error) {
      throw error;
    }
  }
}

export async function loadLibraryTriggers(supabase: Client) {
  const { data, error } = await supabase
    .from("triggers")
    .select("id, name, emoji, source_key")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addLibraryTrigger(supabase: Client, input: { name: string; emoji: string }) {
  const userId = await requireUserId(supabase);
  const name = input.name.trim();
  const emoji = input.emoji.trim();

  if (!name || !emoji) {
    throw new Error("Name and emoji are required");
  }

  const { data, error } = await supabase
    .from("triggers")
    .insert({
      user_id: userId,
      name,
      emoji,
    })
    .select("id, name, emoji, source_key")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function softDeleteLibraryTrigger(supabase: Client, id: string) {
  const { error } = await supabase
    .from("triggers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function loadLibraryScenarios(supabase: Client) {
  const { data, error } = await supabase
    .from("scenarios")
    .select("id, name, description, emoji")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const scenarios = data ?? [];
  return attachScenarioTriggerIds(supabase, scenarios);
}

async function attachScenarioTriggerIds(
  supabase: Client,
  scenarios: Array<{
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
  }>,
) {
  if (scenarios.length === 0) {
    return [];
  }

  const { data: members, error: memberError } = await supabase
    .from("scenario_triggers")
    .select("scenario_id, trigger_id, position")
    .in(
      "scenario_id",
      scenarios.map((scenario) => scenario.id),
    )
    .order("position", { ascending: true });

  if (memberError) {
    throw memberError;
  }

  const triggerIdsByScenario = new Map<string, string[]>();
  for (const member of members ?? []) {
    const list = triggerIdsByScenario.get(member.scenario_id) ?? [];
    list.push(member.trigger_id);
    triggerIdsByScenario.set(member.scenario_id, list);
  }

  return scenarios.map((scenario) => ({
    ...scenario,
    triggerIds: triggerIdsByScenario.get(scenario.id) ?? [],
  }));
}

export async function addLibraryScenario(
  supabase: Client,
  input: { name: string; emoji: string; description?: string; triggerIds: string[] },
) {
  const userId = await requireUserId(supabase);
  const name = input.name.trim();
  const emoji = input.emoji.trim();
  const triggerIds = uniqueKeys(input.triggerIds);
  const description = input.description?.trim() || null;

  if (!name || !emoji || triggerIds.length === 0) {
    throw new Error("Name, emoji, and at least one trigger are required");
  }

  const { data: scenario, error } = await supabase
    .from("scenarios")
    .insert({
      user_id: userId,
      name,
      description,
      emoji,
    })
    .select("id, name, description, emoji")
    .single();

  if (error) {
    throw error;
  }

  const { error: memberError } = await supabase.from("scenario_triggers").insert(
    triggerIds.map((trigger_id, position) => ({
      scenario_id: scenario.id,
      trigger_id,
      user_id: userId,
      position,
    })),
  );

  if (memberError) {
    await supabase
      .from("scenarios")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", scenario.id);
    throw memberError;
  }

  return { ...scenario, triggerIds };
}

export async function softDeleteLibraryScenario(supabase: Client, id: string) {
  const { error } = await supabase
    .from("scenarios")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function loadDatePlan(supabase: Client): Promise<StoredDatePlan> {
  const { data, error } = await supabase
    .from("date_assignments")
    .select("on_date, kind, trigger_id, scenario_id, position")
    .order("on_date", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const assignments: Record<string, DateAssignmentItem[]> = {};
  const triggerIds: string[] = [];
  const scenarioIds: string[] = [];

  for (const row of rows) {
    const onDate = String(row.on_date).slice(0, 10);
    const list = assignments[onDate] ?? [];
    if (row.kind === "trigger" && row.trigger_id) {
      list.push({ kind: "trigger", id: row.trigger_id });
      triggerIds.push(row.trigger_id);
    } else if (row.kind === "scenario" && row.scenario_id) {
      list.push({ kind: "scenario", id: row.scenario_id });
      scenarioIds.push(row.scenario_id);
    }
    assignments[onDate] = list;
  }

  const scenarios = await loadScenariosByIds(supabase, uniqueKeys(scenarioIds));
  const memberIds = scenarios.flatMap((scenario) => scenario.triggerIds);
  const triggers = await loadTriggersByIds(supabase, uniqueKeys([...triggerIds, ...memberIds]));

  return { assignments, triggers, scenarios };
}

export async function saveDateAssignments(
  supabase: Client,
  previous: Record<string, DateAssignmentItem[]>,
  next: Record<string, DateAssignmentItem[]>,
) {
  const dates = uniqueKeys([...Object.keys(previous), ...Object.keys(next)]).filter(
    (onDate) => JSON.stringify(previous[onDate] ?? []) !== JSON.stringify(next[onDate] ?? []),
  );

  if (dates.length === 0) {
    return;
  }

  const userId = await requireUserId(supabase);
  const { error: deleteError } = await supabase.from("date_assignments").delete().in("on_date", dates);

  if (deleteError) {
    throw deleteError;
  }

  const rows = dates.flatMap((on_date) =>
    (next[on_date] ?? []).map((item, position) => ({
      user_id: userId,
      on_date,
      kind: item.kind,
      trigger_id: item.kind === "trigger" ? item.id : null,
      scenario_id: item.kind === "scenario" ? item.id : null,
      position,
    })),
  );

  if (rows.length === 0) {
    await Promise.all(dates.map((onDate) => pruneDateTriggerStates(supabase, onDate, [])));
    return;
  }

  const { error } = await supabase.from("date_assignments").insert(rows);

  if (error) {
    throw error;
  }

  await Promise.all(
    dates.map(async (onDate) => {
      const keepIds = await remainingTriggerIdsOnDate(supabase, onDate);
      await pruneDateTriggerStates(supabase, onDate, keepIds);
    }),
  );
}

export async function removeDateAssignment(
  supabase: Client,
  onDate: string,
  item: DateAssignmentItem,
) {
  let query = supabase.from("date_assignments").delete().eq("on_date", onDate);
  query = item.kind === "trigger" ? query.eq("trigger_id", item.id) : query.eq("scenario_id", item.id);
  const { error } = await query;

  if (error) {
    throw error;
  }

  const keepIds = await remainingTriggerIdsOnDate(supabase, onDate);
  await pruneDateTriggerStates(supabase, onDate, keepIds);
}

export async function clearDateAssignments(supabase: Client, onDate: string) {
  const { error } = await supabase.from("date_assignments").delete().eq("on_date", onDate);

  if (error) {
    throw error;
  }

  await pruneDateTriggerStates(supabase, onDate, []);
}

export async function loadDateTriggerStates(supabase: Client) {
  const { data, error } = await supabase
    .from("date_trigger_states")
    .select("on_date, trigger_id, status");

  if (error) {
    throw error;
  }

  const byDate: Record<string, Record<string, DateTriggerStatus>> = {};
  for (const row of data ?? []) {
    const onDate = String(row.on_date).slice(0, 10);
    const day = byDate[onDate] ?? {};
    day[row.trigger_id] = row.status;
    byDate[onDate] = day;
  }

  return byDate;
}

export async function setDateTriggerStatus(
  supabase: Client,
  onDate: string,
  triggerId: string,
  status: DateTriggerStatus,
) {
  const userId = await requireUserId(supabase);
  const { error } = await supabase.from("date_trigger_states").upsert(
    {
      user_id: userId,
      on_date: onDate,
      trigger_id: triggerId,
      status,
    },
    { onConflict: "user_id,on_date,trigger_id" },
  );

  if (error) {
    throw error;
  }
}

export function flattenDayTriggers(
  items: DateAssignmentItem[],
  triggers: StoredTrigger[],
  scenarios: StoredScenario[],
  statuses: Record<string, DateTriggerStatus> = {},
): FlattenedDayTrigger[] {
  const triggerById = new Map(triggers.map((trigger) => [trigger.id, trigger]));
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  const seen = new Set<string>();
  const result: FlattenedDayTrigger[] = [];

  function add(id: string) {
    if (seen.has(id)) {
      return;
    }

    const trigger = triggerById.get(id);
    if (!trigger) {
      return;
    }

    seen.add(id);
    result.push({
      id,
      name: trigger.name,
      emoji: trigger.emoji,
      status: statuses[id] === "achieved" ? "achieved" : "todo",
    });
  }

  for (const item of items) {
    if (item.kind === "trigger") {
      add(item.id);
      continue;
    }

    const scenario = scenarioById.get(item.id);
    for (const triggerId of scenario?.triggerIds ?? []) {
      add(triggerId);
    }
  }

  return result;
}

export function uniqueAssignedTriggerIds(
  items: DateAssignmentItem[],
  scenarioTriggerIds: (scenarioId: string) => readonly string[] | undefined,
) {
  const seen = new Set<string>();

  for (const item of items) {
    if (item.kind === "trigger") {
      seen.add(item.id);
      continue;
    }

    for (const triggerId of scenarioTriggerIds(item.id) ?? []) {
      seen.add(triggerId);
    }
  }

  return [...seen];
}

export function pruneStatesToAssignments(
  states: Record<string, Record<string, DateTriggerStatus>>,
  assignments: Record<string, DateAssignmentItem[]>,
  scenarioTriggerIds: (scenarioId: string) => readonly string[] | undefined,
) {
  const next: Record<string, Record<string, DateTriggerStatus>> = {};

  for (const [onDate, day] of Object.entries(states)) {
    const keep = new Set(uniqueAssignedTriggerIds(assignments[onDate] ?? [], scenarioTriggerIds));
    const pruned: Record<string, DateTriggerStatus> = {};
    for (const [id, status] of Object.entries(day)) {
      if (keep.has(id)) {
        pruned[id] = status;
      }
    }
    if (Object.keys(pruned).length > 0) {
      next[onDate] = pruned;
    }
  }

  return next;
}

async function remainingTriggerIdsOnDate(supabase: Client, onDate: string) {
  const { data, error } = await supabase
    .from("date_assignments")
    .select("kind, trigger_id, scenario_id")
    .eq("on_date", onDate);

  if (error) {
    throw error;
  }

  const triggerIds: string[] = [];
  const scenarioIds: string[] = [];

  for (const row of data ?? []) {
    if (row.kind === "trigger" && row.trigger_id) {
      triggerIds.push(row.trigger_id);
    } else if (row.kind === "scenario" && row.scenario_id) {
      scenarioIds.push(row.scenario_id);
    }
  }

  if (scenarioIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("scenario_triggers")
      .select("trigger_id")
      .in("scenario_id", scenarioIds);

    if (memberError) {
      throw memberError;
    }

    for (const row of members ?? []) {
      triggerIds.push(row.trigger_id);
    }
  }

  return uniqueKeys(triggerIds);
}

async function pruneDateTriggerStates(supabase: Client, onDate: string, keepIds: string[]) {
  if (keepIds.length === 0) {
    const { error } = await supabase.from("date_trigger_states").delete().eq("on_date", onDate);
    if (error) {
      throw error;
    }
    return;
  }

  const { data, error: readError } = await supabase
    .from("date_trigger_states")
    .select("trigger_id")
    .eq("on_date", onDate);

  if (readError) {
    throw readError;
  }

  const keep = new Set(keepIds);
  const drop = uniqueKeys(
    (data ?? []).map((row) => row.trigger_id).filter((id) => !keep.has(id)),
  );

  if (drop.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("date_trigger_states")
    .delete()
    .eq("on_date", onDate)
    .in("trigger_id", drop);

  if (error) {
    throw error;
  }
}

async function loadTriggersByIds(supabase: Client, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("triggers")
    .select("id, name, emoji, source_key")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function loadScenariosByIds(supabase: Client, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("scenarios")
    .select("id, name, description, emoji")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return attachScenarioTriggerIds(supabase, data ?? []);
}

async function requireUserId(supabase: Client) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  return user.id;
}

function uniqueKeys(ids: string[]) {
  const seen = new Set<string>();
  const keys: string[] = [];

  for (const id of ids) {
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    keys.push(id);
  }

  return keys;
}
