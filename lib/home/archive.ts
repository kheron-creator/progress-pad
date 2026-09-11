import {
  formatIsoDate,
  parseIsoDate,
  type MindSweepByDate,
  type PillarDayValues,
  type PillarsByDate,
  type StoredMindSweepItem,
  type StoredWritingEntry,
  type WritingByDate,
} from "@/lib/home/store";
import type { FlattenedDayTrigger } from "@/lib/triggers/store";

export const ARCHIVE_CATEGORIES = [
  "triggers",
  "gratitude",
  "mind-sweep",
  "done-list",
  "quotes",
  "journal",
  "reflections",
  "pillars",
] as const;

export type ArchiveCategory = (typeof ARCHIVE_CATEGORIES)[number];
export type ArchiveFilter = "all" | ArchiveCategory;
export type ArchiveGrain = "today" | "week" | "month" | "range";

export type ArchiveCounts = Record<ArchiveCategory, number>;

export type ArchivePeriod = {
  id: string;
  start: string;
  end: string;
  label: string;
  current: boolean;
  counts: ArchiveCounts;
  total: number;
};

export type ArchiveDayContent = {
  date: string;
  triggers: FlattenedDayTrigger[];
  gratitude: StoredWritingEntry[];
  mindSweep: StoredMindSweepItem[];
  done: StoredWritingEntry[];
  quotes: StoredWritingEntry[];
  journal: StoredWritingEntry[];
  reflections: StoredWritingEntry[];
  pillars: PillarDayValues | null;
};

export type TriggersByDate = Record<string, FlattenedDayTrigger[]>;

const EMPTY_COUNTS: ArchiveCounts = {
  triggers: 0,
  gratitude: 0,
  "mind-sweep": 0,
  "done-list": 0,
  quotes: 0,
  journal: 0,
  reflections: 0,
  pillars: 0,
};

export function emptyArchiveCounts(): ArchiveCounts {
  return { ...EMPTY_COUNTS };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

export function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function compareIso(a: string, b: string) {
  return a.localeCompare(b);
}

function clampRange(from: string, to: string) {
  return compareIso(from, to) <= 0 ? { from, to } : { from: to, to: from };
}

export function formatDayLabel(iso: string) {
  const date = parseIsoDate(iso);
  if (!date) {
    return iso;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatPeriodLabel(startIso: string, endIso: string, grain: ArchiveGrain) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) {
    return `${startIso} – ${endIso}`;
  }

  if (grain === "today" || startIso === endIso) {
    return formatDayLabel(startIso);
  }

  if (grain === "month" && start.getDate() === 1 && end.getDate() === endOfMonth(start).getDate()) {
    return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${formatDayShort(start)} – ${formatDayShort(end)}, ${start.getFullYear()}`;
  }

  return `${formatDayShort(start)}, ${start.getFullYear()} – ${formatDayShort(end)}, ${end.getFullYear()}`;
}

export function countsForDate(
  date: string,
  writingByDate: WritingByDate,
  mindSweepByDate: MindSweepByDate,
  pillarsByDate: PillarsByDate,
  triggersByDate: TriggersByDate,
): ArchiveCounts {
  const day = writingByDate[date];
  return {
    triggers: triggersByDate[date]?.length ?? 0,
    gratitude: day?.gratitude.length ?? 0,
    "mind-sweep": mindSweepByDate[date]?.length ?? 0,
    "done-list": day?.done.length ?? 0,
    quotes: day?.quotes.length ?? 0,
    journal: day?.journal.length ?? 0,
    reflections: day?.reflections.length ?? 0,
    pillars: pillarsByDate[date] ? 1 : 0,
  };
}

export function countForFilter(counts: ArchiveCounts, filter: ArchiveFilter) {
  if (filter === "all") {
    return ARCHIVE_CATEGORIES.reduce((sum, category) => sum + counts[category], 0);
  }

  return counts[filter];
}

function sumCounts(list: ArchiveCounts[]): ArchiveCounts {
  return list.reduce((next, counts) => {
    for (const category of ARCHIVE_CATEGORIES) {
      next[category] += counts[category];
    }
    return next;
  }, emptyArchiveCounts());
}

export function datesWithArchiveContent(
  writingByDate: WritingByDate,
  mindSweepByDate: MindSweepByDate,
  pillarsByDate: PillarsByDate,
  triggersByDate: TriggersByDate,
  filter: ArchiveFilter,
) {
  const dates = new Set<string>();

  function include(date: string) {
    const total = countForFilter(
      countsForDate(date, writingByDate, mindSweepByDate, pillarsByDate, triggersByDate),
      filter,
    );
    if (total > 0) {
      dates.add(date.slice(0, 10));
    }
  }

  for (const date of Object.keys(writingByDate)) {
    include(date);
  }
  for (const date of Object.keys(mindSweepByDate)) {
    include(date);
  }
  for (const date of Object.keys(pillarsByDate)) {
    include(date);
  }
  for (const date of Object.keys(triggersByDate)) {
    include(date);
  }

  return [...dates].sort(compareIso);
}

function periodId(grain: ArchiveGrain, start: string, end: string) {
  if (grain === "today") {
    return `day:${start}`;
  }
  if (grain === "week") {
    return `week:${start}`;
  }
  if (grain === "month") {
    return `month:${start.slice(0, 7)}`;
  }
  return `range:${start}_${end}`;
}

function buildPeriod(
  grain: ArchiveGrain,
  start: Date,
  end: Date,
  dates: string[],
  writingByDate: WritingByDate,
  mindSweepByDate: MindSweepByDate,
  pillarsByDate: PillarsByDate,
  triggersByDate: TriggersByDate,
  filter: ArchiveFilter,
  today: Date,
): ArchivePeriod {
  const startIso = formatIsoDate(start);
  const endIso = formatIsoDate(end);
  const todayIso = formatIsoDate(today);
  const counts = sumCounts(
    dates.map((date) =>
      countsForDate(date, writingByDate, mindSweepByDate, pillarsByDate, triggersByDate),
    ),
  );

  return {
    id: periodId(grain, startIso, endIso),
    start: startIso,
    end: endIso,
    label:
      grain === "today" && startIso === todayIso
        ? "Today"
        : formatPeriodLabel(startIso, endIso, grain),
    current: todayIso >= startIso && todayIso <= endIso,
    counts,
    total: countForFilter(counts, filter),
  };
}

export function listArchivePeriods(
  grain: ArchiveGrain,
  filter: ArchiveFilter,
  writingByDate: WritingByDate,
  mindSweepByDate: MindSweepByDate,
  pillarsByDate: PillarsByDate,
  triggersByDate: TriggersByDate,
  range: { from: string; to: string },
  today = new Date(),
): ArchivePeriod[] {
  const todayStart = startOfDay(today);
  const contentDates = datesWithArchiveContent(
    writingByDate,
    mindSweepByDate,
    pillarsByDate,
    triggersByDate,
    filter,
  );

  if (grain === "range") {
    const { from, to } = clampRange(range.from, range.to);
    const dates = contentDates.filter((date) => date >= from && date <= to);
    const start = parseIsoDate(from) ?? todayStart;
    const end = parseIsoDate(to) ?? todayStart;
    return [
      buildPeriod(
        grain,
        start,
        end,
        dates,
        writingByDate,
        mindSweepByDate,
        pillarsByDate,
        triggersByDate,
        filter,
        todayStart,
      ),
    ];
  }

  const buckets = new Map<string, { start: Date; end: Date; dates: string[] }>();

  function addBucket(start: Date, end: Date, date?: string) {
    const startIso = formatIsoDate(start);
    const existing = buckets.get(startIso);
    if (existing) {
      if (date) {
        existing.dates.push(date);
      }
      return;
    }
    buckets.set(startIso, { start, end, dates: date ? [date] : [] });
  }

  if (grain === "today") {
    addBucket(todayStart, todayStart);
    for (const date of contentDates) {
      const parsed = parseIsoDate(date);
      if (!parsed) {
        continue;
      }
      addBucket(parsed, parsed, date);
    }
  } else if (grain === "week") {
    addBucket(startOfWeek(todayStart), endOfWeek(todayStart));
    for (const date of contentDates) {
      const parsed = parseIsoDate(date);
      if (!parsed) {
        continue;
      }
      addBucket(startOfWeek(parsed), endOfWeek(parsed), date);
    }
  } else {
    addBucket(startOfMonth(todayStart), endOfMonth(todayStart));
    for (const date of contentDates) {
      const parsed = parseIsoDate(date);
      if (!parsed) {
        continue;
      }
      addBucket(startOfMonth(parsed), endOfMonth(parsed), date);
    }
  }

  return [...buckets.values()]
    .map((bucket) =>
      buildPeriod(
        grain,
        bucket.start,
        bucket.end,
        bucket.dates,
        writingByDate,
        mindSweepByDate,
        pillarsByDate,
        triggersByDate,
        filter,
        todayStart,
      ),
    )
    .sort((a, b) => compareIso(b.start, a.start));
}

export function periodDayContents(
  period: ArchivePeriod,
  filter: ArchiveFilter,
  writingByDate: WritingByDate,
  mindSweepByDate: MindSweepByDate,
  pillarsByDate: PillarsByDate,
  triggersByDate: TriggersByDate,
): ArchiveDayContent[] {
  const days: ArchiveDayContent[] = [];
  const start = parseIsoDate(period.start);
  const end = parseIsoDate(period.end);
  if (!start || !end) {
    return days;
  }

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const date = formatIsoDate(cursor);
    const counts = countsForDate(date, writingByDate, mindSweepByDate, pillarsByDate, triggersByDate);
    if (countForFilter(counts, filter) === 0) {
      continue;
    }

    const writing = writingByDate[date];
    const show = (category: ArchiveCategory) => filter === "all" || filter === category;

    days.push({
      date,
      triggers: show("triggers") ? (triggersByDate[date] ?? []) : [],
      gratitude: show("gratitude") ? (writing?.gratitude ?? []) : [],
      mindSweep: show("mind-sweep") ? (mindSweepByDate[date] ?? []) : [],
      done: show("done-list") ? (writing?.done ?? []) : [],
      quotes: show("quotes") ? (writing?.quotes ?? []) : [],
      journal: show("journal") ? (writing?.journal ?? []) : [],
      reflections: show("reflections") ? (writing?.reflections ?? []) : [],
      pillars: show("pillars") ? (pillarsByDate[date] ?? null) : null,
    });
  }

  return days;
}

export function defaultArchiveRange(today = new Date()) {
  const end = startOfDay(today);
  return {
    from: formatIsoDate(addDays(end, -29)),
    to: formatIsoDate(end),
  };
}

export const ARCHIVE_CATEGORY_LABELS: Record<ArchiveCategory, string> = {
  triggers: "Triggers",
  gratitude: "Gratitude",
  "mind-sweep": "Mind sweep",
  "done-list": "Done list",
  quotes: "Quotes",
  journal: "Journal",
  reflections: "Reflections",
  pillars: "Pillars",
};

export const ARCHIVE_ROW_LABELS: Record<ArchiveCategory, string> = {
  triggers: "Triggers",
  gratitude: "Gratitude",
  "mind-sweep": "Mind Sweep",
  "done-list": "Done List",
  quotes: "Quotes",
  journal: "Journal",
  reflections: "Reflections",
  pillars: "Pillars",
};

export type ArchiveTimelineEntry = {
  id: string;
  category: ArchiveCategory;
  title: string;
  notes: string;
  createdAt: string | null;
  hasNotes: boolean;
  achieved: boolean;
  value?: string;
  emoji?: string;
};

function toTimelineEntry(
  item: { id: string; title: string; notes: string | null; created_at: string },
  category: Exclude<ArchiveCategory, "pillars" | "triggers">,
  achieved = false,
): ArchiveTimelineEntry {
  const title = item.title.trim();
  const notes = item.notes?.trim() ?? "";
  return {
    id: item.id,
    category,
    title: title || notes,
    notes: title ? notes : "",
    createdAt: item.created_at,
    hasNotes: Boolean(title && notes),
    achieved,
  };
}

export function flattenArchiveDay(day: ArchiveDayContent): ArchiveTimelineEntry[] {
  const rows: ArchiveTimelineEntry[] = [
    ...day.gratitude.map((item) => toTimelineEntry(item, "gratitude")),
    ...day.mindSweep.map((item) => toTimelineEntry(item, "mind-sweep", item.status === "achieved")),
    ...day.done.map((item) => toTimelineEntry(item, "done-list", true)),
    ...day.quotes.map((item) => toTimelineEntry(item, "quotes")),
    ...day.journal.map((item) => toTimelineEntry(item, "journal")),
    ...day.reflections.map((item) => toTimelineEntry(item, "reflections")),
    ...day.triggers.map((item) => ({
      id: item.id,
      category: "triggers" as const,
      title: item.name,
      notes: "",
      createdAt: null,
      hasNotes: false,
      achieved: item.status === "achieved",
      emoji: item.emoji || undefined,
    })),
  ];

  return rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export type ArchiveCategoryGroup = {
  category: ArchiveCategory;
  items: ArchiveTimelineEntry[];
};

export function groupArchiveEntries(entries: ArchiveTimelineEntry[]): ArchiveCategoryGroup[] {
  return ARCHIVE_CATEGORIES.flatMap((category) => {
    const items = entries.filter((entry) => entry.category === category);
    return items.length > 0 ? [{ category, items }] : [];
  });
}
