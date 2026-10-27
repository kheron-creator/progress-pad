"use client";

import { useMemo, useState, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon, ChecksIcon, HeadCircuitIcon, LightbulbIcon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { formatDayLabel } from "@/lib/home/archive";
import { ARCHIVE_AREAS } from "@/lib/home/content";
import type { MindSweepByDate, WritingByDate, WritingKind } from "@/lib/home/store";
import {
  parseAreaNotes,
  POWERFUL_AREAS,
  POWERFUL_AREA_IDS,
  powerfulArea,
  type PowerfulAreaId,
} from "@/lib/powerful/areas";
import { cn } from "@/lib/utils/cn";

type AreaItem = {
  id: string;
  date: string;
  title: string;
  notes: string;
  source: string;
  createdAt: string;
};

type AreaThread = {
  open: AreaItem[];
  wins: AreaItem[];
  thoughts: AreaItem[];
};

const WRITING_SOURCE: Record<WritingKind, string> = {
  gratitude: "Gratitude",
  quotes: "Quote",
  journal: "Journal",
  reflections: "Reflection",
  done: "Done list",
};

function emptyThreads(): Record<PowerfulAreaId, AreaThread> {
  return Object.fromEntries(
    POWERFUL_AREA_IDS.map((id) => [id, { open: [], wins: [], thoughts: [] }]),
  ) as unknown as Record<PowerfulAreaId, AreaThread>;
}

const newestFirst = (a: AreaItem, b: AreaItem) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
const oldestFirst = (a: AreaItem, b: AreaItem) => -newestFirst(a, b);

function buildAreaThreads(writingByDate: WritingByDate, mindSweepByDate: MindSweepByDate) {
  const threads = emptyThreads();

  for (const [date, items] of Object.entries(mindSweepByDate)) {
    for (const item of items) {
      const { areas, notes } = parseAreaNotes(item.notes);
      for (const area of areas) {
        const row = {
          id: item.id,
          date,
          title: item.title,
          notes,
          source: "Mind sweep",
          createdAt: item.created_at,
        };
        threads[area][item.status === "achieved" ? "wins" : "open"].push(row);
      }
    }
  }

  for (const [date, day] of Object.entries(writingByDate)) {
    for (const kind of Object.keys(WRITING_SOURCE) as WritingKind[]) {
      for (const entry of day[kind]) {
        const { areas, notes } = parseAreaNotes(entry.notes);
        for (const area of areas) {
          threads[area][kind === "done" ? "wins" : "thoughts"].push({
            id: entry.id,
            date,
            title: entry.title || notes,
            notes: entry.title ? notes : "",
            source: WRITING_SOURCE[kind],
            createdAt: entry.created_at,
          });
        }
      }
    }
  }

  for (const thread of Object.values(threads)) {
    // Oldest open loops first, so the ones waiting longest stand out.
    thread.open.sort(oldestFirst);
    thread.wins.sort(newestFirst);
    thread.thoughts.sort(newestFirst);
  }

  return threads;
}

function AreaRow({ item, done }: { item: AreaItem; done?: boolean }) {
  return (
    <li className="flex min-w-0 items-start gap-3 px-4 py-3">
      <span className="min-w-0 flex-1">
        <Text
          variant="bodySmall"
          className={cn(
            "block whitespace-pre-line",
            done ? "font-(--pp-font-weight-semibold) text-(--pp-spring-green-600)" : "text-foreground",
          )}
        >
          {item.title}
        </Text>
        {item.notes ? (
          <Text variant="caption" className="mt-0.5 line-clamp-3 block whitespace-pre-line text-foreground-muted">
            {item.notes}
          </Text>
        ) : null}
        <Text variant="caption" className="mt-1 block text-foreground-muted">
          {item.source} · {formatDayLabel(item.date)}
        </Text>
      </span>
      {done ? (
        <Tag
          size="xs"
          className="shrink-0 border-transparent! bg-(--pp-spring-green-600)! text-white!"
          leftIcon={<CheckIcon size={8} weight="bold" />}
        >
          DONE
        </Tag>
      ) : null}
    </li>
  );
}

function AreaSection({
  title,
  icon,
  items,
  empty,
  done,
}: {
  title: string;
  icon: ReactNode;
  items: AreaItem[];
  empty: string;
  done?: boolean;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-foreground">
        {icon}
        <Text as="h3" variant="label">
          {title}
        </Text>
        <Text variant="caption" className="text-foreground-muted">
          {items.length}
        </Text>
      </div>
      {items.length === 0 ? (
        <Text variant="caption" className="rounded-md border border-dashed border-border px-4 py-3 text-foreground-muted">
          {empty}
        </Text>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-(--pp-grey-25) in-data-[theme=dark]:bg-background-subtle">
          {items.map((item) => (
            <AreaRow key={`${item.id}-${item.source}`} item={item} done={done} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function ArchiveAreas({
  writingByDate,
  mindSweepByDate,
}: {
  writingByDate: WritingByDate;
  mindSweepByDate: MindSweepByDate;
}) {
  const [areaId, setAreaId] = useState<PowerfulAreaId>("pipeline");
  const threads = useMemo(
    () => buildAreaThreads(writingByDate, mindSweepByDate),
    [mindSweepByDate, writingByDate],
  );

  const area = powerfulArea(areaId);
  const thread = threads[areaId];
  const total = thread.open.length + thread.wins.length + thread.thoughts.length;

  const tabs = POWERFUL_AREAS.map((item) => {
    const open = threads[item.id].open.length;
    return { value: item.id, label: open ? `${item.tag} · ${open}` : item.tag };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Tabs
          label={ARCHIVE_AREAS.tabsLabel}
          tone="primary"
          size="lg"
          value={areaId}
          onChange={(next) => setAreaId(next as PowerfulAreaId)}
          options={tabs}
        />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <div className="flex items-center gap-3 bg-accent-muted px-3 py-4 sm:px-5 sm:py-5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent font-(--pp-font-weight-semibold) text-white">
            {area.letter}
          </span>
          <span className="min-w-0 flex-1">
            <Text as="h2" variant="subtitle" className="text-accent">
              {area.label}
            </Text>
            <Text variant="caption" className="text-accent">
              {area.description}
            </Text>
          </span>
        </div>

        <div className="flex flex-col gap-6 px-3 py-5 sm:px-5">
          {total === 0 ? (
            <EmptyState
              title={ARCHIVE_AREAS.emptyTitle}
              description={ARCHIVE_AREAS.emptyDescription(area.tag)}
            />
          ) : (
            <>
              <AreaSection
                title={ARCHIVE_AREAS.openTitle}
                icon={<HeadCircuitIcon size={16} />}
                items={thread.open}
                empty={ARCHIVE_AREAS.openEmpty}
              />
              <AreaSection
                title={ARCHIVE_AREAS.winsTitle}
                icon={<ChecksIcon size={16} />}
                items={thread.wins}
                empty={ARCHIVE_AREAS.winsEmpty}
                done
              />
              <AreaSection
                title={ARCHIVE_AREAS.thoughtsTitle}
                icon={<LightbulbIcon size={16} />}
                items={thread.thoughts}
                empty={ARCHIVE_AREAS.thoughtsEmpty}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
