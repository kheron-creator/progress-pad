import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export type WritingKind = Database["public"]["Enums"]["writing_kind"];
export type MindSweepStatus = Database["public"]["Enums"]["trigger_status"];

export type StoredWritingEntry = {
  id: string;
  on_date: string;
  kind: WritingKind;
  title: string;
  notes: string | null;
  created_at: string;
};

export type StoredMindSweepItem = {
  id: string;
  on_date: string;
  title: string;
  notes: string | null;
  status: MindSweepStatus;
  sort_order: number;
  created_at: string;
};

export type WritingByDate = Record<string, Record<WritingKind, StoredWritingEntry[]>>;
export type MindSweepByDate = Record<string, StoredMindSweepItem[]>;

export const PILLAR_IDS = [
  "mentally",
  "emotionally",
  "professionally",
  "physically",
  "socially",
  "romantically",
] as const;

export type PillarId = (typeof PILLAR_IDS)[number];

export type PillarDayValues = Record<PillarId, { rating: number; notes: string }>;
export type PillarsByDate = Record<string, PillarDayValues>;

export const DEFAULT_PILLAR_RATING = 5;

export async function loadHomeWriting(supabase: Client) {
  const [writing, mindSweep] = await Promise.all([
    loadWritingEntries(supabase),
    loadMindSweepItems(supabase),
  ]);

  return {
    writingByDate: groupWritingByDate(writing),
    mindSweepByDate: groupMindSweepByDate(mindSweep),
  };
}

export async function addWritingEntry(
  supabase: Client,
  input: { onDate: string; kind: WritingKind; title: string; notes?: string },
) {
  const userId = await requireUserId(supabase);
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase
    .from("writing_entries")
    .insert({
      user_id: userId,
      on_date: input.onDate,
      kind: input.kind,
      title,
      notes: input.notes?.trim() || null,
    })
    .select("id, on_date, kind, title, notes, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateWritingEntry(
  supabase: Client,
  id: string,
  input: { title: string; notes?: string | null },
) {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const patch: { title: string; notes?: string | null } = { title };
  if ("notes" in input) {
    patch.notes = input.notes?.trim() || null;
  }

  const { error } = await supabase.from("writing_entries").update(patch).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteWritingEntry(supabase: Client, id: string) {
  const { error } = await supabase.from("writing_entries").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function addMindSweepItem(
  supabase: Client,
  input: { onDate: string; title: string; notes?: string; sortOrder?: number },
) {
  const userId = await requireUserId(supabase);
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const sortOrder = input.sortOrder ?? (await nextMindSweepSortOrder(supabase, userId, input.onDate));

  const { data, error } = await supabase
    .from("mind_sweep_items")
    .insert({
      user_id: userId,
      on_date: input.onDate,
      title,
      notes: input.notes?.trim() || null,
      status: "todo",
      sort_order: sortOrder,
    })
    .select("id, on_date, title, notes, status, sort_order, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMindSweepItem(
  supabase: Client,
  id: string,
  input: { title: string; notes?: string | null },
) {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const patch: { title: string; notes?: string | null } = { title };
  if ("notes" in input) {
    patch.notes = input.notes?.trim() || null;
  }

  const { error } = await supabase.from("mind_sweep_items").update(patch).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setMindSweepStatus(supabase: Client, id: string, status: MindSweepStatus) {
  const { error } = await supabase.from("mind_sweep_items").update({ status }).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setMindSweepDate(supabase: Client, id: string, onDate: string, sortOrder?: number) {
  const patch: { on_date: string; sort_order?: number } = { on_date: onDate };
  if (sortOrder != null) {
    patch.sort_order = sortOrder;
  }

  const { error } = await supabase.from("mind_sweep_items").update(patch).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function persistMindSweepPatches(
  supabase: Client,
  patches: readonly { id: string; on_date: string; sort_order: number }[],
) {
  if (patches.length === 0) {
    return;
  }

  const results = await Promise.all(
    patches.map((patch) =>
      supabase
        .from("mind_sweep_items")
        .update({ on_date: patch.on_date, sort_order: patch.sort_order })
        .eq("id", patch.id),
    ),
  );

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    throw firstError;
  }
}

export function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function flattenMindSweepItems(byDate: MindSweepByDate) {
  const items: StoredMindSweepItem[] = [];
  for (const list of Object.values(byDate)) {
    items.push(...list);
  }
  return items;
}

export function incompleteMindSweepItems(byDate: MindSweepByDate, today: string) {
  return flattenMindSweepItems(byDate)
    .filter((item) => item.status !== "achieved")
    .sort((a, b) => compareMindSweepItems(a, b, today));
}

function compareMindSweepItems(a: StoredMindSweepItem, b: StoredMindSweepItem, today: string) {
  const aToday = a.on_date === today ? 0 : 1;
  const bToday = b.on_date === today ? 0 : 1;
  if (aToday !== bToday) {
    return aToday - bToday;
  }
  const dateCmp = a.on_date.localeCompare(b.on_date);
  if (dateCmp !== 0) {
    return dateCmp;
  }
  const orderCmp = a.sort_order - b.sort_order;
  if (orderCmp !== 0) {
    return orderCmp;
  }
  return a.created_at.localeCompare(b.created_at);
}

function withRenumberedSortOrder(items: StoredMindSweepItem[]): StoredMindSweepItem[] {
  return items.map((item, index) =>
    item.sort_order === index + 1 ? item : { ...item, sort_order: index + 1 },
  );
}

export function mindSweepPatches(
  previous: MindSweepByDate,
  next: MindSweepByDate,
): { id: string; on_date: string; sort_order: number }[] {
  const prevById = new Map(flattenMindSweepItems(previous).map((item) => [item.id, item]));
  const patches: { id: string; on_date: string; sort_order: number }[] = [];

  for (const item of flattenMindSweepItems(next)) {
    const prior = prevById.get(item.id);
    if (
      !prior ||
      prior.on_date !== item.on_date ||
      prior.sort_order !== item.sort_order
    ) {
      patches.push({
        id: item.id,
        on_date: item.on_date,
        sort_order: item.sort_order,
      });
    }
  }

  return patches;
}

export function reorderMindSweepDay(
  byDate: MindSweepByDate,
  onDate: string,
  orderedIds: readonly string[],
): MindSweepByDate {
  const key = onDate.slice(0, 10);
  const current = byDate[key] ?? [];
  if (current.length === 0) {
    return byDate;
  }

  const byId = new Map(current.map((item) => [item.id, item]));
  const reordered: StoredMindSweepItem[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (!item) {
      continue;
    }
    reordered.push(item);
    byId.delete(id);
  }
  for (const item of byId.values()) {
    reordered.push(item);
  }

  const renumbered = withRenumberedSortOrder(reordered);
  const unchanged =
    renumbered.length === current.length &&
    renumbered.every(
      (item, index) =>
        item.id === current[index]?.id && item.sort_order === current[index]?.sort_order,
    );
  if (unchanged) {
    return byDate;
  }

  return {
    ...byDate,
    [key]: renumbered,
  };
}

export function mapMindSweepItem(
  byDate: MindSweepByDate,
  id: string,
  patch: Partial<StoredMindSweepItem>,
): MindSweepByDate {
  let changed = false;
  const next: MindSweepByDate = { ...byDate };
  for (const [date, items] of Object.entries(next)) {
    if (!items.some((item) => item.id === id)) {
      continue;
    }
    changed = true;
    next[date] = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
  }
  return changed ? next : byDate;
}

export function relocateMindSweepItem(byDate: MindSweepByDate, id: string, onDate: string): MindSweepByDate {
  let found: StoredMindSweepItem | undefined;
  let sourceDate: string | undefined;
  const next: MindSweepByDate = {};

  for (const [date, items] of Object.entries(byDate)) {
    const remaining: StoredMindSweepItem[] = [];
    for (const item of items) {
      if (item.id === id) {
        found = item;
        sourceDate = date;
        continue;
      }
      remaining.push(item);
    }
    next[date] = sourceDate === date ? withRenumberedSortOrder(remaining) : remaining;
  }

  if (!found) {
    return byDate;
  }

  const key = onDate.slice(0, 10);
  if (sourceDate === key) {
    return byDate;
  }

  const target = next[key] ?? [];
  next[key] = [
    ...target,
    {
      ...found,
      on_date: key,
      sort_order: target.length + 1,
    },
  ];
  return next;
}

export function removeMindSweepItem(byDate: MindSweepByDate, id: string): MindSweepByDate {
  let changed = false;
  const next: MindSweepByDate = {};
  for (const [date, items] of Object.entries(byDate)) {
    if (!items.some((item) => item.id === id)) {
      next[date] = items;
      continue;
    }
    changed = true;
    next[date] = withRenumberedSortOrder(items.filter((item) => item.id !== id));
  }
  return changed ? next : byDate;
}

export function mergeMindSweepItems(byDate: MindSweepByDate, rows: StoredMindSweepItem[]): MindSweepByDate {
  const next: MindSweepByDate = { ...byDate };
  for (const row of rows) {
    const onDate = row.on_date.slice(0, 10);
    const item = { ...row, on_date: onDate };
    const day = [...(next[onDate] ?? []).filter((entry) => entry.id !== item.id), item];
    day.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
    next[onDate] = day;
  }
  return next;
}

export async function deleteMindSweepItem(supabase: Client, id: string) {
  const { error } = await supabase.from("mind_sweep_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function loadHomePillars(supabase: Client) {
  const { data, error } = await supabase
    .from("pillar_entries")
    .select("on_date, pillar_id, rating, notes");

  if (error) {
    throw error;
  }

  return groupPillarsByDate(data ?? []);
}

export async function savePillarEntries(
  supabase: Client,
  onDate: string,
  values: Partial<Record<string, { rating: number; notes: string }>>,
) {
  const userId = await requireUserId(supabase);
  const next = emptyPillarDay();
  const rows = PILLAR_IDS.map((pillar_id) => {
    const rating = clampRating(values[pillar_id]?.rating ?? DEFAULT_PILLAR_RATING);
    const notes = values[pillar_id]?.notes?.trim() ?? "";
    next[pillar_id] = { rating, notes };

    return {
      user_id: userId,
      on_date: onDate,
      pillar_id,
      rating,
      notes: notes || null,
    };
  });

  const { error } = await supabase.from("pillar_entries").upsert(rows, {
    onConflict: "user_id,on_date,pillar_id",
  });

  if (error) {
    throw error;
  }

  return next;
}

async function loadWritingEntries(supabase: Client) {
  const { data, error } = await supabase
    .from("writing_entries")
    .select("id, on_date, kind, title, notes, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function loadMindSweepItems(supabase: Client) {
  const { data, error } = await supabase
    .from("mind_sweep_items")
    .select("id, on_date, title, notes, status, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function groupWritingByDate(rows: StoredWritingEntry[]): WritingByDate {
  const next: WritingByDate = {};

  for (const row of rows) {
    const onDate = row.on_date.slice(0, 10);
    const day = next[onDate] ?? emptyWritingDay();
    day[row.kind] = [...day[row.kind], row];
    next[onDate] = day;
  }

  return next;
}

function groupMindSweepByDate(rows: StoredMindSweepItem[]): MindSweepByDate {
  const next: MindSweepByDate = {};

  for (const row of rows) {
    const onDate = row.on_date.slice(0, 10);
    next[onDate] = [...(next[onDate] ?? []), { ...row, on_date: onDate }];
  }

  for (const [date, items] of Object.entries(next)) {
    next[date] = [...items].sort(
      (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
    );
  }

  return next;
}

async function nextMindSweepSortOrder(supabase: Client, userId: string, onDate: string) {
  const { data, error } = await supabase
    .from("mind_sweep_items")
    .select("sort_order")
    .eq("user_id", userId)
    .eq("on_date", onDate)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.sort_order ?? 0) + 1;
}

function groupPillarsByDate(
  rows: { on_date: string; pillar_id: string; rating: number; notes: string | null }[],
): PillarsByDate {
  const next: PillarsByDate = {};

  for (const row of rows) {
    if (!isPillarId(row.pillar_id)) {
      continue;
    }

    const onDate = row.on_date.slice(0, 10);
    const day = next[onDate] ?? emptyPillarDay();
    day[row.pillar_id] = {
      rating: clampRating(row.rating),
      notes: row.notes ?? "",
    };
    next[onDate] = day;
  }

  return next;
}

export function emptyPillarDay(): PillarDayValues {
  return {
    mentally: { rating: DEFAULT_PILLAR_RATING, notes: "" },
    emotionally: { rating: DEFAULT_PILLAR_RATING, notes: "" },
    professionally: { rating: DEFAULT_PILLAR_RATING, notes: "" },
    physically: { rating: DEFAULT_PILLAR_RATING, notes: "" },
    socially: { rating: DEFAULT_PILLAR_RATING, notes: "" },
    romantically: { rating: DEFAULT_PILLAR_RATING, notes: "" },
  };
}

export function clonePillarDay(day: PillarDayValues): PillarDayValues {
  return Object.fromEntries(PILLAR_IDS.map((id) => [id, { ...day[id] }])) as PillarDayValues;
}

export function clonePillarsByDate(value: PillarsByDate): PillarsByDate {
  return Object.fromEntries(
    Object.entries(value).map(([date, day]) => [date, clonePillarDay(day)]),
  );
}

export function pillarDaysEqual(a: PillarDayValues, b: PillarDayValues) {
  return PILLAR_IDS.every((id) => a[id].rating === b[id].rating && a[id].notes === b[id].notes);
}

export function pillarsByDateEqual(a: PillarsByDate, b: PillarsByDate) {
  const dates = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const date of dates) {
    if (!pillarDaysEqual(a[date] ?? emptyPillarDay(), b[date] ?? emptyPillarDay())) {
      return false;
    }
  }
  return true;
}

function isPillarId(value: string): value is PillarId {
  return (PILLAR_IDS as readonly string[]).includes(value);
}

function clampRating(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_PILLAR_RATING;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

export function emptyWritingDay(): Record<WritingKind, StoredWritingEntry[]> {
  return {
    gratitude: [],
    quotes: [],
    journal: [],
    reflections: [],
    done: [],
  };
}

export function writingKindForSection(sectionId: string): WritingKind | null {
  if (sectionId === "done-list") {
    return "done";
  }

  if (
    sectionId === "gratitude" ||
    sectionId === "quotes" ||
    sectionId === "journal" ||
    sectionId === "reflections"
  ) {
    return sectionId;
  }

  return null;
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
