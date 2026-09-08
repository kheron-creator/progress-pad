"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CalendarStrip, isoDate, type CalendarMarker } from "@/components/ui/calendar-strip";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarbellIcon,
  BookOpenIcon,
  BrainIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
  ChartLineIcon,
  ChecksIcon,
  FilesIcon,
  HeadCircuitIcon,
  HeartIcon,
  LightbulbIcon,
  LightningIcon,
  PlusIcon,
  QuotesIcon,
  SmileyIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@/components/ui/icon";
import { IconMark, type IconMarkSize } from "@/components/ui/icon-mark";
import { PillarRow } from "@/components/ui/pillar-row";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { TriggerCard } from "@/components/ui/trigger-card";
import { WritingSection, type WritingSectionItem } from "@/components/ui/writing-section";
import { useSessionStore } from "@/components/app/session-store-provider";
import { useRegisterUnsavedLeave } from "@/components/app/unsaved-leave-provider";
import { createClient } from "@/lib/supabase/client";
import {
  HOME_BANNERS,
  HOME_HEADING,
  HOME_HERO,
  HOME_PILLARS,
  HOME_PILLAR_SECTION,
  HOME_TRIGGER_SECTION,
  HOME_WRITING_SECTIONS,
} from "@/lib/home/content";
import {
  addMindSweepItem,
  addWritingEntry,
  deleteMindSweepItem,
  deleteWritingEntry,
  emptyWritingDay,
  emptyPillarDay,
  pillarsByDateEqual,
  savePillarEntries,
  setMindSweepStatus,
  writingKindForSection,
  type PillarId,
  type StoredMindSweepItem,
  type StoredWritingEntry,
} from "@/lib/home/store";
import {
  flattenDayTriggers,
  setDateTriggerStatus,
  type DateTriggerStatus,
} from "@/lib/triggers/store";
import { burstConfetti } from "@/lib/ui/burst-confetti";
import { cn } from "@/lib/utils/cn";

const HOME_BANNER_IMAGES = {
  hero: "/brand/home-banner-professional.jpg",
  triggers: "/brand/home-banner-triggers.jpg",
  writing: "/brand/home-banner-actions.jpg",
  pillars: "/brand/home-banner-pillars.jpg",
} as const;
const MOBILE_TRIGGER_COUNT = 5;

const PILLAR_ICONS = {
  mentally: <BrainIcon />,
  emotionally: <SmileyIcon />,
  professionally: <BriefcaseIcon />,
  physically: <BarbellIcon />,
  socially: <UsersThreeIcon />,
  romantically: <HeartIcon />,
} as const;

function emptyWritingDrafts(): Record<string, string> {
  return Object.fromEntries(HOME_WRITING_SECTIONS.map((section) => [section.id, ""]));
}

function hasComposerDrafts(
  drafts: Record<string, Record<string, string>>,
  notes: Record<string, Record<string, string>>,
) {
  return [drafts, notes].some((byDate) =>
    Object.values(byDate).some((day) =>
      Object.values(day).some((value) => value.trim().length > 0),
    ),
  );
}

function formatChipDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatChipDateShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function writingItemsFromEntries(entries: StoredWritingEntry[]): WritingSectionItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    notes: entry.notes ?? undefined,
  }));
}

function writingItemsFromMindSweep(items: StoredMindSweepItem[]): WritingSectionItem[] {
  return items.map((item) => {
    const achieved = item.status === "achieved";
    return {
      id: item.id,
      title: item.title,
      notes: item.notes ?? undefined,
      checked: achieved,
      achieved,
      variant: achieved ? ("striked" as const) : ("default" as const),
    };
  });
}

function BannerKicker({ children }: { children: string }) {
  return (
    <Chip
      state="outlined"
      size="xs"
      className="pointer-events-none border-(--pp-bondi-blue-600)! bg-(--pp-bondi-blue-25)! text-(--pp-bondi-blue-600)! uppercase"
    >
      {children}
    </Chip>
  );
}

function HomeBanner({
  size,
  kicker,
  title,
  description,
  image,
  imageClassName,
  priority = false,
}: {
  size: "sm" | "lg";
  kicker: string;
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <Banner
      size={size}
      title={title}
      description={description}
      kicker={<BannerKicker>{kicker}</BannerKicker>}
      media={
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          quality={100}
          sizes="(min-width: 64rem) 1024px, 100vw"
          className={cn("object-cover", imageClassName)}
        />
      }
    />
  );
}

function SectionIcon({ children, size = "lg" }: { children: ReactNode; size?: IconMarkSize }) {
  return <IconMark size={size}>{children}</IconMark>;
}

function CountChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-(--pp-space-4) rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-50) px-(--pp-space-16) py-(--pp-space-4) text-(length:--pp-font-size-12) font-(--pp-font-weight-semibold) leading-none text-(--pp-bondi-blue-600) max-sm:px-(--pp-space-8)">
      {children}
    </span>
  );
}

function ItemIcon({ children }: { children: ReactNode }) {
  return (
    <IconMark size="sm" tone="accent">
      {children}
    </IconMark>
  );
}

export function HomePage() {
  const [date, setDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const assignments = useSessionStore((state) => state.assignments);
  const planTriggers = useSessionStore((state) => state.planTriggers);
  const planScenarios = useSessionStore((state) => state.planScenarios);
  const states = useSessionStore((state) => state.states);
  const setStates = useSessionStore((state) => state.setStates);
  const writingByDate = useSessionStore((state) => state.writingByDate);
  const setWritingByDate = useSessionStore((state) => state.setWritingByDate);
  const mindSweepByDate = useSessionStore((state) => state.mindSweepByDate);
  const setMindSweepByDate = useSessionStore((state) => state.setMindSweepByDate);
  const pillarsByDate = useSessionStore((state) => state.pillarsByDate);
  const setPillarsByDate = useSessionStore((state) => state.setPillarsByDate);
  const savedPillarsByDate = useSessionStore((state) => state.savedPillarsByDate);
  const markPillarsSaved = useSessionStore((state) => state.markPillarsSaved);
  const plan = useMemo(
    () => ({ assignments, triggers: planTriggers, scenarios: planScenarios }),
    [assignments, planTriggers, planScenarios],
  );
  const [showAllTriggers, setShowAllTriggers] = useState(false);
  const [draftsByDate, setDraftsByDate] = useState<Record<string, Record<string, string>>>({});
  const [noteDraftsByDate, setNoteDraftsByDate] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [savingSections, setSavingSections] = useState<ReadonlySet<string>>(() => new Set());
  const savingSectionsRef = useRef(new Set<string>());
  const [deletePending, setDeletePending] = useState(false);
  const [pillarSaving, setPillarSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    sectionId: string;
    id: string;
    name: string;
    onDate: string;
  } | null>(null);
  const { toasts, showToast, dismissToast } = useToasts();
  const [celebrateName, setCelebrateName] = useState<string | null>(null);
  const celebrateNoteRef = useRef<HTMLParagraphElement>(null);
  const celebrateTimer = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(celebrateTimer.current);
  }, []);

  useEffect(() => {
    if (!celebrateName) return;

    const frame = window.requestAnimationFrame(() => {
      burstConfetti(celebrateNoteRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [celebrateName]);

  const onDate = isoDate(date);
  const dayPillars = pillarsByDate[onDate] ?? emptyPillarDay();
  const dayDrafts = draftsByDate[onDate] ?? emptyWritingDrafts();
  const dayNoteDrafts = noteDraftsByDate[onDate] ?? emptyWritingDrafts();
  const composerDirty = hasComposerDrafts(draftsByDate, noteDraftsByDate);
  const pillarsDirty = !pillarsByDateEqual(pillarsByDate, savedPillarsByDate);
  const { guardedPush } = useRegisterUnsavedLeave(composerDirty || pillarsDirty);
  const triggers = useMemo(
    () =>
      flattenDayTriggers(
        plan.assignments[onDate] ?? [],
        plan.triggers,
        plan.scenarios,
        states[onDate],
      ),
    [onDate, plan, states],
  );
  const achievedCount = triggers.filter((trigger) => trigger.status === "achieved").length;
  const triggerProgress =
    triggers.length === 0 ? 0 : Math.round((achievedCount / triggers.length) * 100);
  const pillarAverage =
    HOME_PILLARS.reduce((sum, pillar) => sum + (dayPillars[pillar.id]?.rating ?? 5), 0) /
    HOME_PILLARS.length;

  const chipDate = useMemo(() => formatChipDate(date), [date]);
  const chipDateShort = useMemo(() => formatChipDateShort(date), [date]);

  const calendarMarkers = useMemo(() => {
    const next: Record<string, CalendarMarker> = {};
    for (const [key, items] of Object.entries(plan.assignments)) {
      const count = flattenDayTriggers(items, plan.triggers, plan.scenarios).length;
      if (count > 0) {
        next[key] = { count, dot: true };
      }
    }
    return next;
  }, [plan]);

  function celebrateTrigger(name: string) {
    setCelebrateName(name);
    window.clearTimeout(celebrateTimer.current);
    celebrateTimer.current = window.setTimeout(() => setCelebrateName(null), 2800);
  }

  async function toggleTrigger(id: string) {
    const current = states[onDate]?.[id] === "achieved" ? "achieved" : "todo";
    const next: DateTriggerStatus = current === "achieved" ? "todo" : "achieved";
    const previousDay = states[onDate] ?? {};

    setStates((currentStates) => ({
      ...currentStates,
      [onDate]: { ...previousDay, [id]: next },
    }));

    if (next === "achieved") {
      const name = triggers.find((trigger) => trigger.id === id)?.name ?? "trigger";
      celebrateTrigger(name);
    }

    try {
      await setDateTriggerStatus(createClient(), onDate, id, next);
    } catch {
      setStates((currentStates) => ({
        ...currentStates,
        [onDate]: previousDay,
      }));
      setCelebrateName(null);
      showToast("Couldn't update that trigger. Please try again.", "error");
    }
  }

  function markSaving(sectionId: string, saving: boolean) {
    if (saving) {
      savingSectionsRef.current.add(sectionId);
    } else {
      savingSectionsRef.current.delete(sectionId);
    }

    setSavingSections((current) => {
      const next = new Set(current);
      if (saving) {
        next.add(sectionId);
      } else {
        next.delete(sectionId);
      }
      return next;
    });
  }

  async function updateWritingItem(sectionId: string, id: string, checked: boolean) {
    if (sectionId !== "mind-sweep") {
      return;
    }

    const status = checked ? "achieved" : "todo";
    const previous = mindSweepByDate[onDate] ?? [];

    setMindSweepByDate((current) => ({
      ...current,
      [onDate]: (current[onDate] ?? []).map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));

    if (status === "achieved") {
      const name = previous.find((item) => item.id === id)?.title ?? "task";
      celebrateTrigger(name);
    }

    try {
      await setMindSweepStatus(createClient(), id, status);
    } catch {
      setMindSweepByDate((current) => ({
        ...current,
        [onDate]: previous,
      }));
      setCelebrateName(null);
      showToast("Couldn't update that item. Please try again.", "error");
    }
  }

  async function addWritingItem(sectionId: string, title: string, notes?: string) {
    if (savingSectionsRef.current.has(sectionId)) {
      return;
    }

    markSaving(sectionId, true);

    try {
      if (sectionId === "mind-sweep") {
        const row = await addMindSweepItem(createClient(), { onDate, title, notes });
        setMindSweepByDate((current) => ({
          ...current,
          [onDate]: [...(current[onDate] ?? []), { ...row, on_date: onDate }],
        }));
      } else {
        const kind = writingKindForSection(sectionId);
        if (!kind) {
          return;
        }

        const row = await addWritingEntry(createClient(), { onDate, kind, title, notes });
        setWritingByDate((current) => {
          const day = current[onDate] ?? emptyWritingDay();
          return {
            ...current,
            [onDate]: {
              ...day,
              [kind]: [...day[kind], { ...row, on_date: onDate }],
            },
          };
        });
      }

      setDraftsByDate((current) => ({
        ...current,
        [onDate]: { ...(current[onDate] ?? emptyWritingDrafts()), [sectionId]: "" },
      }));
      setNoteDraftsByDate((current) => ({
        ...current,
        [onDate]: { ...(current[onDate] ?? emptyWritingDrafts()), [sectionId]: "" },
      }));

      if (sectionId === "done-list") {
        celebrateTrigger(title);
      }
    } catch {
      showToast("Couldn't save that entry. Please try again.", "error");
    } finally {
      markSaving(sectionId, false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deletePending) {
      return;
    }

    setDeletePending(true);

    try {
      if (pendingDelete.sectionId === "mind-sweep") {
        await deleteMindSweepItem(createClient(), pendingDelete.id);
        setMindSweepByDate((current) => ({
          ...current,
          [pendingDelete.onDate]: (current[pendingDelete.onDate] ?? []).filter(
            (item) => item.id !== pendingDelete.id,
          ),
        }));
      } else {
        const kind = writingKindForSection(pendingDelete.sectionId);
        if (!kind) {
          return;
        }

        await deleteWritingEntry(createClient(), pendingDelete.id);
        setWritingByDate((current) => {
          const day = current[pendingDelete.onDate];
          if (!day) {
            return current;
          }

          return {
            ...current,
            [pendingDelete.onDate]: {
              ...day,
              [kind]: day[kind].filter((item) => item.id !== pendingDelete.id),
            },
          };
        });
      }

      setPendingDelete(null);
    } catch {
      showToast("Couldn't delete that entry. Please try again.", "error");
    } finally {
      setDeletePending(false);
    }
  }

  function updatePillar(pillarId: PillarId, patch: { rating?: number; notes?: string }) {
    setPillarsByDate((current) => {
      const day = current[onDate] ?? emptyPillarDay();
      return {
        ...current,
        [onDate]: {
          ...day,
          [pillarId]: { ...day[pillarId], ...patch },
        },
      };
    });
  }

  async function savePillars() {
    if (pillarSaving) {
      return;
    }

    setPillarSaving(true);

    try {
      const saved = await savePillarEntries(
        createClient(),
        onDate,
        pillarsByDate[onDate] ?? emptyPillarDay(),
      );
      setPillarsByDate((current) => ({ ...current, [onDate]: saved }));
      markPillarsSaved(onDate, saved);
      showToast(HOME_PILLAR_SECTION.saved);
    } catch {
      showToast("Couldn't save progression. Please try again.", "error");
    } finally {
      setPillarSaving(false);
    }
  }

  function writingSection(section: (typeof HOME_WRITING_SECTIONS)[number]) {
    const isGratitude = section.id === "gratitude";
    const isMindSweep = section.id === "mind-sweep";
    const isDoneList = section.id === "done-list";
    const isQuotes = section.id === "quotes";
    const isJournal = section.id === "journal";
    const isReflections = section.id === "reflections";
    const isComposer = Boolean("composer" in section && section.composer);
    const kind = writingKindForSection(section.id);
    const items = isMindSweep
      ? writingItemsFromMindSweep(mindSweepByDate[onDate] ?? [])
      : writingItemsFromEntries(kind ? (writingByDate[onDate]?.[kind] ?? []) : []);
    const achievedCount = items.filter((item) => item.checked || item.achieved).length;
    const chip =
      "chip" in section
        ? section.chip === "achieved"
          ? `${achievedCount} / ${items.length} Achieved`
          : section.chip === "done"
            ? `${items.length} Done Today`
            : section.chip === "quotes"
              ? `${items.length} Quotes`
              : section.chip === "notes"
                ? `${items.length} Notes`
                : section.chip === "lessons"
                  ? `${items.length} Lessons`
                  : `${items.length} Logged`
        : undefined;
    const progress =
      "showProgress" in section && section.showProgress
        ? items.length === 0
          ? 0
          : Math.round((achievedCount / items.length) * 100)
        : undefined;

    return (
      <WritingSection
        key={section.id}
        title={section.title}
        description={section.description}
        composer={isComposer}
        saving={savingSections.has(section.id)}
        accent={section.accent}
        addLabel={"addLabel" in section ? section.addLabel : undefined}
        submitIcon={
          "addIcon" in section && section.addIcon === "check"
            ? "check"
            : "addIcon" in section && section.addIcon === "none"
              ? false
              : isMindSweep
                ? false
                : true
        }
        notesPlaceholder={"notesPlaceholder" in section ? section.notesPlaceholder : undefined}
        notesValue={dayNoteDrafts[section.id] ?? ""}
        onNotesChange={(value) =>
          setNoteDraftsByDate((current) => ({
            ...current,
            [onDate]: { ...(current[onDate] ?? emptyWritingDrafts()), [section.id]: value },
          }))
        }
        itemCheckbox={isComposer ? isMindSweep : undefined}
        itemLocked={Boolean("alwaysAchieved" in section && section.alwaysAchieved)}
        progress={progress}
        progressLabel={`${section.title} progress`}
        icon={
          isGratitude ? (
            <IconMark size="lg" tone="secondary">
              <SparkleIcon />
            </IconMark>
          ) : isMindSweep ? (
            <IconMark size="lg" tone="accent">
              <HeadCircuitIcon />
            </IconMark>
          ) : isDoneList ? (
            <IconMark size="lg" tone="primary">
              <ChecksIcon />
            </IconMark>
          ) : isQuotes ? (
            <IconMark size="lg" className="bg-(--pp-purple-500)! text-white">
              <QuotesIcon />
            </IconMark>
          ) : isJournal ? (
            <IconMark size="lg" className="bg-(--pp-pink-500)! text-white">
              <BookOpenIcon />
            </IconMark>
          ) : isReflections ? (
            <IconMark size="lg" className="bg-(--pp-cobalt-500)! text-white">
              <LightbulbIcon />
            </IconMark>
          ) : (
            <SectionIcon>
              <SparkleIcon />
            </SectionIcon>
          )
        }
        tag={chip ? <CountChip>{chip}</CountChip> : undefined}
        placeholder={section.placeholder}
        value={dayDrafts[section.id] ?? ""}
        onChange={(value) =>
          setDraftsByDate((current) => ({
            ...current,
            [onDate]: { ...(current[onDate] ?? emptyWritingDrafts()), [section.id]: value },
          }))
        }
        items={items}
        onCheckedChange={(id, checked) => updateWritingItem(section.id, id, checked)}
        onAdd={isComposer ? (title, notes) => addWritingItem(section.id, title, notes) : undefined}
        onDelete={
          isComposer
            ? (id) => {
              const item = items.find((entry) => entry.id === id);
              setPendingDelete({
                sectionId: section.id,
                id,
                name: item?.title ?? "this item",
                onDate,
              });
            }
            : undefined
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6">
      <HomeBanner
        size="lg"
        kicker={HOME_HERO.kicker}
        title={HOME_HERO.title}
        description={HOME_HERO.description}
        image={HOME_BANNER_IMAGES.hero}
        priority
      />

      <section className="flex flex-col items-center gap-1 py-2 text-center">
        <Chip
          state="outlined"
          size="lg"
          leftIcon={<CalendarBlankIcon size={12} />}
          className="pointer-events-none"
        >
          <span className="max-sm:hidden">{chipDate}</span>
          <span className="sm:hidden">{chipDateShort}</span>
        </Chip>
        <Text
          as="h1"
          variant="display"
          className="text-center lg:text-[4.5rem] lg:leading-28"
        >
          {HOME_HEADING.title}
        </Text>
        <Text
          as="p"
          variant="sectionTitle"
          className="text-center font-normal text-secondary"
        >
          {HOME_HEADING.subtitle}
        </Text>
      </section>

      <CalendarStrip
        value={date}
        onChange={(next) => {
          setDate(next);
          setShowAllTriggers(false);
        }}
        view={calendarView}
        onViewChange={setCalendarView}
        markers={calendarMarkers}
        className="max-w-none"
      />

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.triggers.kicker}
        title={HOME_BANNERS.triggers.title}
        description={HOME_BANNERS.triggers.description}
        image={HOME_BANNER_IMAGES.triggers}
      />

      <Card className="flex w-full flex-col gap-section">
        <TriggerCard
          title={HOME_TRIGGER_SECTION.title}
          description={HOME_TRIGGER_SECTION.description}
          leftIcon={
            <SectionIcon size="lg">
              <LightningIcon />
            </SectionIcon>
          }
          tag={
            <CountChip>
              {achievedCount} / {triggers.length} Achieved
            </CountChip>
          }
        />

        {triggers.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent py-8"
            media={<FilesIcon size="xl" className="text-(--pp-spring-green-700)" />}
            title="No triggers yet"
            description="Add your first trigger to start building small actions that create big change over time."
            action={
              <Button size="md" onClick={() => guardedPush("/triggers")}>
                <PlusIcon size={16} />
                Add Your First Trigger
              </Button>
            }
          />
        ) : (
          <>
            <Progress value={triggerProgress} size="md" label="Today’s trigger progress" />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {triggers.map((trigger, index) => {
                const hiddenOnMobile = !showAllTriggers && index >= MOBILE_TRIGGER_COUNT;

                return (
                  <TriggerCard
                    key={trigger.id}
                    kind="item"
                    state={trigger.status}
                    title={trigger.name}
                    leftIcon={
                      trigger.status === "achieved" || !trigger.emoji ? undefined : (
                        <IconMark size="sm" tone="surface" className="text-(length:--pp-font-size-14) leading-none">
                          <span aria-hidden>{trigger.emoji}</span>
                        </IconMark>
                      )
                    }
                    leftEmoji={false}
                    showDescription={false}
                    className={cn("cursor-pointer", hiddenOnMobile && "hidden md:flex")}
                    onClick={() => void toggleTrigger(trigger.id)}
                  />
                );
              })}
            </div>

            {triggers.length > MOBILE_TRIGGER_COUNT ? (
              <Button
                className="md:hidden max-sm:w-full"
                size="md"
                variant="secondary"
                look="outline"
                onClick={() => setShowAllTriggers((open) => !open)}
              >
                {showAllTriggers ? "Show less" : "Show all triggers"}
              </Button>
            ) : null}
          </>
        )}
      </Card>

      {writingSection(HOME_WRITING_SECTIONS[0])}

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.writing.kicker}
        title={HOME_BANNERS.writing.title}
        description={HOME_BANNERS.writing.description}
        image={HOME_BANNER_IMAGES.writing}
      />

      {HOME_WRITING_SECTIONS.slice(1, 3).map(writingSection)}


      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.pillars.kicker}
        title={HOME_BANNERS.pillars.title}
        description={HOME_BANNERS.pillars.description}
        image={HOME_BANNER_IMAGES.pillars}
      />

      {HOME_WRITING_SECTIONS.slice(3).map(writingSection)}

      <Card className="flex w-full flex-col gap-section">
        <TriggerCard
          title={HOME_PILLAR_SECTION.title}
          description={HOME_PILLAR_SECTION.description}
          leftIcon={
            <IconMark size="lg" tone="accent">
              <ChartLineIcon />
            </IconMark>
          }
          tag={
            <CountChip>
              <span className="max-sm:hidden">Progression Balance: </span>
              {pillarAverage.toFixed(1)}/10
            </CountChip>
          }
        />
        <div className="flex flex-col gap-(--pp-space-12)">
          {HOME_PILLARS.map((pillar) => (
            <PillarRow
              key={pillar.id}
              title={pillar.title}
              description={pillar.description}
              placeholder={pillar.placeholder}
              value={dayPillars[pillar.id]?.rating ?? 5}
              notes={dayPillars[pillar.id]?.notes ?? ""}
              onChange={(value) => {
                updatePillar(pillar.id, { rating: value });
              }}
              onNotesChange={(value) => {
                updatePillar(pillar.id, { notes: value });
              }}
              icon={<ItemIcon>{PILLAR_ICONS[pillar.id]}</ItemIcon>}
            />
          ))}
        </div>
        <div className="flex justify-end max-sm:w-full">
          <Button
            size="md"
            className="max-sm:w-full"
            loading={pillarSaving}
            onClick={() => void savePillars()}
          >
            {HOME_PILLAR_SECTION.saveLabel}
          </Button>
        </div>
      </Card>
      {celebrateName ? (
        <p
          ref={celebrateNoteRef}
          role="status"
          className="type-status pointer-events-none fixed bottom-6 left-1/2 z-50 w-fit max-w-[min(100%-2rem,24rem)] -translate-x-1/2 truncate rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-25) px-4 py-2 text-center text-(--pp-bondi-blue-700) shadow-md animate-[pp-ready-check-pop_0.45s_cubic-bezier(0.22,1.15,0.36,1)_both]"
        >
          Achieved ‘{celebrateName}’
        </p>
      ) : null}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePending) setPendingDelete(null);
        }}
        title="Delete this item?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed. This cannot be undone.`
            : undefined
        }
      >
        <DialogConfirmActions
          danger
          pending={deletePending}
          confirmLabel="Delete"
          onCancel={() => {
            if (!deletePending) setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      </Dialog>
    </div>
  );
}
