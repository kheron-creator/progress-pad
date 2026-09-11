"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSessionStore } from "@/components/app/session-store-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpenIcon,
  CalendarBlankIcon,
  ChartLineIcon,
  CheckIcon,
  ChecksIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  HeadCircuitIcon,
  LightbulbIcon,
  LightningIcon,
  QuotesIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/ui/icon";
import { IconMark } from "@/components/ui/icon-mark";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import {
  ARCHIVE_CATEGORIES,
  ARCHIVE_CATEGORY_LABELS,
  ARCHIVE_ROW_LABELS,
  defaultArchiveRange,
  flattenArchiveDay,
  formatDayLabel,
  groupArchiveEntries,
  listArchivePeriods,
  periodDayContents,
  type ArchiveCategory,
  type ArchiveDayContent,
  type ArchiveFilter,
  type ArchiveGrain,
  type ArchiveTimelineEntry,
} from "@/lib/home/archive";
import { ARCHIVE, HOME_PILLARS } from "@/lib/home/content";
import { DEFAULT_PILLAR_RATING } from "@/lib/home/store";
import { flattenDayTriggers } from "@/lib/triggers/store";
import { cn } from "@/lib/utils/cn";

const GRAIN_TABS: { value: ArchiveGrain; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "range", label: "Custom" },
];

const CATEGORY_TABS: { value: ArchiveFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...ARCHIVE_CATEGORIES.map((id) => ({ value: id, label: ARCHIVE_CATEGORY_LABELS[id] })),
];

const CATEGORY_CHIP: Record<ArchiveCategory, { chip: string; icon: ReactNode }> = {
  gratitude: {
    chip: "border-(--pp-bondi-blue-400) bg-(--pp-bondi-blue-10) text-(--pp-bondi-blue-600) in-data-[theme=dark]:bg-(--pp-bondi-blue-900) in-data-[theme=dark]:text-(--pp-bondi-blue-200)",
    icon: <SparkleIcon size={14} />,
  },
  "mind-sweep": {
    chip: "border-(--pp-magenta-400) bg-(--pp-magenta-10) text-(--pp-magenta-600) in-data-[theme=dark]:bg-(--pp-magenta-900) in-data-[theme=dark]:text-(--pp-magenta-200)",
    icon: <HeadCircuitIcon size={14} />,
  },
  "done-list": {
    chip: "border-(--pp-spring-green-600) bg-(--pp-spring-green-10) text-(--pp-spring-green-700) in-data-[theme=dark]:bg-(--pp-spring-green-900) in-data-[theme=dark]:text-(--pp-spring-green-200)",
    icon: <ChecksIcon size={14} />,
  },
  quotes: {
    chip: "border-(--pp-purple-500) bg-(--pp-purple-500)/8 text-(--pp-purple-500) in-data-[theme=dark]:bg-background-subtle",
    icon: <QuotesIcon size={14} />,
  },
  journal: {
    chip: "border-(--pp-pink-500) bg-(--pp-pink-500)/8 text-(--pp-pink-500) in-data-[theme=dark]:bg-background-subtle",
    icon: <BookOpenIcon size={14} />,
  },
  reflections: {
    chip: "border-(--pp-cobalt-500) bg-(--pp-cobalt-500)/8 text-(--pp-cobalt-500) in-data-[theme=dark]:bg-background-subtle",
    icon: <LightbulbIcon size={14} />,
  },
  triggers: {
    chip: "border-(--pp-yellow-600) bg-(--pp-yellow-25) text-(--pp-yellow-700) in-data-[theme=dark]:bg-(--pp-yellow-900) in-data-[theme=dark]:text-(--pp-yellow-200)",
    icon: <LightningIcon size={14} />,
  },
  pillars: {
    chip: "border-primary bg-primary-muted text-primary",
    icon: <ChartLineIcon size={14} />,
  },
};

function entryMatchesQuery(entry: ArchiveTimelineEntry, needle: string) {
  return (
    entry.title.toLowerCase().includes(needle) ||
    entry.notes.toLowerCase().includes(needle) ||
    (entry.value ?? "").toLowerCase().includes(needle)
  );
}

function entryCountLabel(count: number) {
  return count === 1 ? "1 entry" : `${count} entries`;
}

function formatEntryTime(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayTimeline(day: ArchiveDayContent): ArchiveTimelineEntry[] {
  const entries = flattenArchiveDay(day);
  if (!day.pillars) {
    return entries;
  }

  const pillarRows: ArchiveTimelineEntry[] = [];
  for (const pillar of HOME_PILLARS) {
    const values = day.pillars[pillar.id];
    if (!values) {
      continue;
    }
    const notes = values.notes.trim();
    if (values.rating === DEFAULT_PILLAR_RATING && !notes) {
      continue;
    }
    pillarRows.push({
      id: `${day.date}-${pillar.id}`,
      category: "pillars",
      title: pillar.title,
      notes,
      createdAt: null,
      hasNotes: Boolean(notes),
      achieved: false,
      value: `${values.rating}/10`,
    });
  }

  if (pillarRows.length === 0) {
    pillarRows.push({
      id: `${day.date}-pillars`,
      category: "pillars",
      title: "Six pillars",
      notes: "",
      createdAt: null,
      hasNotes: false,
      achieved: false,
    });
  }

  return [...entries, ...pillarRows];
}

function ArchiveEntryRow({ item }: { item: ArchiveTimelineEntry }) {
  const time = formatEntryTime(item.createdAt);

  return (
    <span className="flex min-w-0 items-center gap-2 px-4 py-2.5">
      {item.emoji ? (
        <span className="shrink-0 leading-none" aria-hidden>
          {item.emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <Text
          variant="bodySmall"
          className={cn(
            "truncate",
            item.achieved
              ? "font-(--pp-font-weight-semibold) text-(--pp-spring-green-600)"
              : "text-foreground",
          )}
        >
          {item.title}
        </Text>
        {item.hasNotes ? (
          <Text
            variant="caption"
            className={cn(
              "mt-0.5 block truncate",
              item.achieved ? "text-(--pp-spring-green-600)" : "text-foreground-muted",
            )}
          >
            {item.notes}
          </Text>
        ) : null}
      </span>
      {item.achieved ? (
        <Tag
          size="xs"
          className="shrink-0 border-transparent! bg-(--pp-spring-green-600)! text-white!"
          leftIcon={<CheckIcon size={8} weight="bold" />}
        >
          ACHIEVED
        </Tag>
      ) : null}
      {item.value ? (
        <Text variant="bodySmall" className="shrink-0 text-foreground">
          {item.value}
        </Text>
      ) : null}
      {time ? (
        <Text variant="caption" className="shrink-0 text-foreground-muted">
          {time}
        </Text>
      ) : null}
    </span>
  );
}

function ArchiveCategoryGroup({
  category,
  items,
}: {
  category: ArchiveCategory;
  items: ArchiveTimelineEntry[];
}) {
  const style = CATEGORY_CHIP[category];
  const allAchieved = items.length > 0 && items.every((item) => item.achieved);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex w-fit shrink-0 sm:w-40">
        <span
          className={cn(
            "inline-flex w-full items-center gap-1.5 rounded-full border px-2.5 py-1 sm:mt-1.5",
            style.chip,
          )}
        >
          {style.icon}
          <Text variant="label" className="text-inherit">
            {ARCHIVE_ROW_LABELS[category]}
          </Text>
        </span>
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col divide-y divide-border overflow-hidden rounded-md border bg-background-subtle",
          allAchieved ? "border-(--pp-spring-green-600)" : "border-border",
        )}
      >
        {items.map((item) => (
          <ArchiveEntryRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function ArchivePage() {
  const router = useRouter();
  const writingByDate = useSessionStore((state) => state.writingByDate);
  const mindSweepByDate = useSessionStore((state) => state.mindSweepByDate);
  const pillarsByDate = useSessionStore((state) => state.pillarsByDate);
  const assignments = useSessionStore((state) => state.assignments);
  const planTriggers = useSessionStore((state) => state.planTriggers);
  const planScenarios = useSessionStore((state) => state.planScenarios);
  const triggerStates = useSessionStore((state) => state.states);

  const [grain, setGrain] = useState<ArchiveGrain>("today");
  const [filter, setFilter] = useState<ArchiveFilter>("all");
  const [range, setRange] = useState(defaultArchiveRange);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [periodOpen, setPeriodOpen] = useState(true);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [openDays, setOpenDays] = useState<Set<string> | null>(null);
  const [query, setQuery] = useState("");

  const triggersByDate = useMemo(() => {
    const next: Record<string, ReturnType<typeof flattenDayTriggers>> = {};
    for (const [date, items] of Object.entries(assignments)) {
      const list = flattenDayTriggers(items, planTriggers, planScenarios, triggerStates[date]);
      if (list.length > 0) {
        next[date] = list;
      }
    }
    return next;
  }, [assignments, planScenarios, planTriggers, triggerStates]);

  const periods = useMemo(
    () =>
      listArchivePeriods(
        grain,
        filter,
        writingByDate,
        mindSweepByDate,
        pillarsByDate,
        triggersByDate,
        range,
      ),
    [filter, grain, mindSweepByDate, pillarsByDate, range, triggersByDate, writingByDate],
  );

  useEffect(() => {
    setPeriodIndex(0);
  }, [filter, grain, range.from, range.to]);

  const selectedPeriod = periods[Math.min(periodIndex, Math.max(periods.length - 1, 0))] ?? null;

  const days = useMemo(() => {
    if (!selectedPeriod) {
      return [];
    }
    return periodDayContents(
      selectedPeriod,
      filter,
      writingByDate,
      mindSweepByDate,
      pillarsByDate,
      triggersByDate,
    ).map((day) => ({ day, entries: dayTimeline(day) }));
  }, [filter, mindSweepByDate, pillarsByDate, selectedPeriod, triggersByDate, writingByDate]);

  const visibleDays = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return days;
    }
    return days
      .map(({ day, entries }) => ({
        day,
        entries: entries.filter((entry) => entryMatchesQuery(entry, needle)),
      }))
      .filter(({ entries }) => entries.length > 0);
  }, [days, query]);

  useEffect(() => {
    setPeriodOpen(true);
    setOpenDays(null);
  }, [selectedPeriod?.id, filter, query]);

  const resolvedOpenDays =
    openDays ??
    new Set(
      query.trim()
        ? visibleDays.map(({ day }) => day.date)
        : visibleDays[0]
          ? [visibleDays[0].day.date]
          : [],
    );

  function toggleDay(date: string) {
    setOpenDays((current) => {
      const next = new Set(current ?? resolvedOpenDays);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-20 md:gap-6">
      <Card className="flex w-full flex-col gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <IconMark size="lg" tone="primary-muted">
            <FolderIcon />
          </IconMark>
          <div className="min-w-0">
            <Text variant="overline" className="text-primary">
              {ARCHIVE.kicker}
            </Text>
            <Text as="h1" variant="pageTitle" className="mt-1">
              {ARCHIVE.title}
            </Text>
            <Text variant="description" className="mt-2 max-w-2xl">
              {ARCHIVE.description}
            </Text>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Tabs
            label={ARCHIVE.categoryLabel}
            tone="primary"
            size="lg"
            value={filter}
            onChange={(next) => setFilter(next as ArchiveFilter)}
            options={CATEGORY_TABS}
          />
        </div>
        <div className="relative flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">
          <Tabs
            label={ARCHIVE.grainLabel}
            tone="primary"
            size="lg"
            fullWidth
            className="sm:w-auto sm:inline-flex"
            value={grain}
            onChange={(next) => {
              const value = next as ArchiveGrain;
              setGrain(value);
              setRangeOpen(value === "range");
            }}
            options={GRAIN_TABS}
          />
          <DateRangePicker
            from={range.from}
            to={range.to}
            open={grain === "range" && rangeOpen}
            onOpenChange={setRangeOpen}
            onApply={setRange}
          />
        </div>
      </div>

      <div className="w-full sm:max-w-sm sm:self-end">
        <Input
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={ARCHIVE.searchPlaceholder}
          aria-label={ARCHIVE.searchPlaceholder}
          leftIcon={<SearchIcon size={16} />}
        />
      </div>







      {selectedPeriod ? (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <button
            type="button"
            aria-expanded={periodOpen}
            onClick={() => setPeriodOpen((open) => !open)}
            className="flex w-full items-center gap-3 bg-accent-muted px-3 py-4 text-left sm:px-5 sm:py-5"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-white">
              <CalendarBlankIcon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <Text as="h2" variant="subtitle" className="text-accent">
                {selectedPeriod.label}
              </Text>
              <Text variant="caption" className="text-accent">
                {selectedPeriod.total === 0 ? "No entries in this period" : entryCountLabel(selectedPeriod.total)}
              </Text>
            </span>
            <span className="inline-flex size-9 shrink-0 items-center justify-center text-accent">
              {periodOpen ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
            </span>
          </button>

          {periodOpen ? (
            visibleDays.length === 0 ? (
              <div className="px-4 py-6">
                <EmptyState
                  media={<FolderIcon size="xl" className="text-(--pp-spring-green-700)" />}
                  title={query.trim() ? ARCHIVE.searchEmptyTitle : ARCHIVE.emptyTitle}
                  description={
                    query.trim() ? ARCHIVE.searchEmptyDescription : ARCHIVE.emptyDescription
                  }
                  action={
                    query.trim() ? undefined : (
                      <Button size="md" onClick={() => router.push("/home")}>
                        {ARCHIVE.emptyAction}
                      </Button>
                    )
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleDays.map(({ day, entries }) => {
                  const singleDay = selectedPeriod.start === selectedPeriod.end;
                  const open = singleDay || resolvedOpenDays.has(day.date);
                  return (
                    <section key={day.date} className="px-3 sm:px-5">
                      {singleDay ? null : (
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => toggleDay(day.date)}
                          className="flex w-full items-center gap-3 py-3.5 text-left outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/25"
                        >
                          <span className="min-w-0 flex-1">
                            <Text as="h3" variant="subtitle">
                              {formatDayLabel(day.date)}
                            </Text>
                            <Text variant="caption" className="mt-0.5 block text-foreground-muted">
                              {entryCountLabel(entries.length)}
                            </Text>
                          </span>
                          <span className="inline-flex size-9 shrink-0 items-center justify-center text-foreground-muted">
                            {open ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                          </span>
                        </button>
                      )}
                      {open ? (
                        <div className={cn("flex flex-col gap-4", singleDay ? "py-5" : "pb-5")}>
                          {groupArchiveEntries(entries).map((group) => (
                            <ArchiveCategoryGroup
                              key={group.category}
                              category={group.category}
                              items={group.items}
                            />
                          ))}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      ) : (
        <EmptyState
          media={<FolderIcon size="xl" className="text-(--pp-spring-green-700)" />}
          title={ARCHIVE.noPeriodsTitle}
          description={ARCHIVE.noPeriodsDescription}
          action={
            <Button size="md" onClick={() => router.push("/home")}>
              {ARCHIVE.emptyAction}
            </Button>
          }
        />
      )}
    </div>
  );
}
