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
  input: { onDate: string; title: string; notes?: string },
) {
  const userId = await requireUserId(supabase);
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase
    .from("mind_sweep_items")
    .insert({
      user_id: userId,
      on_date: input.onDate,
      title,
      notes: input.notes?.trim() || null,
      status: "todo",
    })
    .select("id, on_date, title, notes, status, created_at")
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

export async function setMindSweepDate(supabase: Client, id: string, onDate: string) {
  const { error } = await supabase.from("mind_sweep_items").update({ on_date: onDate }).eq("id", id);

  if (error) {
    throw error;
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
  return a.created_at.localeCompare(b.created_at);
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
  const next: MindSweepByDate = {};
  for (const [date, items] of Object.entries(byDate)) {
    next[date] = items.filter((item) => {
      if (item.id !== id) {
        return true;
      }
      found = item;
      return false;
    });
  }

  if (!found) {
    return byDate;
  }

  const key = onDate.slice(0, 10);
  next[key] = [...(next[key] ?? []), { ...found, on_date: key }];
  return next;
}

export function removeMindSweepItem(byDate: MindSweepByDate, id: string): MindSweepByDate {
  const next: MindSweepByDate = {};
  for (const [date, items] of Object.entries(byDate)) {
    next[date] = items.filter((item) => item.id !== id);
  }
  return next;
}

export function mergeMindSweepItems(byDate: MindSweepByDate, rows: StoredMindSweepItem[]): MindSweepByDate {
  const next: MindSweepByDate = { ...byDate };
  for (const row of rows) {
    const onDate = row.on_date.slice(0, 10);
    const item = { ...row, on_date: onDate };
    next[onDate] = [...(next[onDate] ?? []).filter((entry) => entry.id !== item.id), item];
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
    .select("id, on_date, title, notes, status, created_at")
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
    next[onDate] = [...(next[onDate] ?? []), row];
  }

  return next;
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
