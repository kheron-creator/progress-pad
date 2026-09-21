"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CalendarStrip, isoDate, type CalendarMarker } from "@/components/ui/calendar-strip";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import {
  BarbellIcon,
  BookOpenIcon,
  BrainIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
  ChartLineIcon,
  ChecksIcon,
  FilesIcon,
  GridIcon,
  HeadCircuitIcon,
  HeartIcon,
  LightbulbIcon,
  LightningIcon,
  PlusIcon,
  QuotesIcon,
  SearchIcon,
  SmileyIcon,
  SparkleIcon,
  UsersThreeIcon,
  CloseIcon,
  CheckIcon,
} from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { IconMark, type IconMarkSize } from "@/components/ui/icon-mark";
import { Input } from "@/components/ui/input";
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
  formatIsoDate,
  mindSweepPatches,
  parseIsoDate,
  pillarDaysEqual,
  pillarsByDateEqual,
  persistMindSweepPatches,
  relocateMindSweepItem,
  removeMindSweepItem,
  reorderMindSweepDay,
  savePillarEntries,
  setMindSweepStatus,
  updateMindSweepItem,
  updateWritingEntry,
  writingKindForSection,
  type PillarId,
  type StoredMindSweepItem,
  type StoredWritingEntry,
} from "@/lib/home/store";
import {
  addLibraryTrigger,
  flattenDayTriggers,
  removeTriggerFromDayAssignments,
  saveDateAssignments,
  setDateTriggerStatus,
  uniqueAssignedTriggerIds,
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
const PILLAR_SAVE_DELAY_MS = 500;

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

function formatItemDate(onDate: string, today: string) {
  if (onDate === today) {
    return "Today";
  }

  const date = parseIsoDate(onDate);
  if (!date) {
    return onDate;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function writingItemsFromEntries(entries: StoredWritingEntry[]): WritingSectionItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    notes: entry.notes ?? undefined,
  }));
}

function writingItemsFromMindSweep(
  items: StoredMindSweepItem[],
  today: string,
): WritingSectionItem[] {
  return items.map((item) => {
    const achieved = item.status === "achieved";
    const itemDate = item.on_date.slice(0, 10);
    return {
      id: item.id,
      title: item.title,
      notes: item.notes ?? undefined,
      checked: achieved,
      achieved,
      variant: achieved ? ("striked" as const) : ("default" as const),
      dateLabel: formatItemDate(itemDate, today),
      dateValue: itemDate,
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const date = useMemo(
    () => parseIsoDate(searchParams.get("date") ?? "") ?? new Date(),
    [searchParams],
  );
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const assignments = useSessionStore((state) => state.assignments);
  const setAssignments = useSessionStore((state) => state.setAssignments);
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
  const libraryTriggers = useSessionStore((state) => state.libraryTriggers);
  const addLibraryTriggerToStore = useSessionStore((state) => state.addLibraryTrigger);
  const plan = useMemo(
    () => ({ assignments, triggers: planTriggers, scenarios: planScenarios }),
    [assignments, planTriggers, planScenarios],
  );
  const [showAllTriggers, setShowAllTriggers] = useState(false);
  const [addingTrigger, setAddingTrigger] = useState(false);
  const [addTriggerTab, setAddTriggerTab] = useState<"library" | "custom">("library");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [savingLibrarySelection, setSavingLibrarySelection] = useState(false);
  const [triggerName, setTriggerName] = useState("");
  const [triggerIcon, setTriggerIcon] = useState<string | undefined>();
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [draftsByDate, setDraftsByDate] = useState<Record<string, Record<string, string>>>({});
  const [noteDraftsByDate, setNoteDraftsByDate] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [savingSections, setSavingSections] = useState<ReadonlySet<string>>(() => new Set());
  const savingSectionsRef = useRef(new Set<string>());
  const [dirtyItemKeys, setDirtyItemKeys] = useState<ReadonlySet<string>>(() => new Set());
  const [deletePending, setDeletePending] = useState(false);
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
  const pillarsByDateRef = useRef(pillarsByDate);
  const savedPillarsByDateRef = useRef(savedPillarsByDate);
  const pillarSaveTimerRef = useRef<number>(null);
  const pillarSavingRef = useRef(false);
  const pendingPillarDatesRef = useRef(new Set<string>());
  const previousPillarDateRef = useRef<string | null>(null);
  pillarsByDateRef.current = pillarsByDate;
  savedPillarsByDateRef.current = savedPillarsByDate;

  useEffect(() => {
    return () => window.clearTimeout(celebrateTimer.current);
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!celebrateName) return;

    const frame = window.requestAnimationFrame(() => {
      burstConfetti(celebrateNoteRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [celebrateName]);

  useEffect(() => {
    return () => {
      if (pillarSaveTimerRef.current != null) {
        window.clearTimeout(pillarSaveTimerRef.current);
      }
    };
  }, []);

  function changeDate(next: Date) {
    setShowAllTriggers(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", isoDate(next));
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}?${params.toString()}${hash}`, { scroll: false });
  }

  const onDate = isoDate(date);
  const today = formatIsoDate(new Date());
  const dayPillars = pillarsByDate[onDate] ?? emptyPillarDay();
  const dayDrafts = draftsByDate[onDate] ?? emptyWritingDrafts();
  const dayNoteDrafts = noteDraftsByDate[onDate] ?? emptyWritingDrafts();
  const composerDirty = hasComposerDrafts(draftsByDate, noteDraftsByDate);
  const pillarsDirty = !pillarsByDateEqual(pillarsByDate, savedPillarsByDate);
  useRegisterUnsavedLeave(
    composerDirty || pillarsDirty || dirtyItemKeys.size > 0,
  );
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
  const dayAssignedTriggerIds = useMemo(
    () =>
      new Set(
        uniqueAssignedTriggerIds(
          plan.assignments[onDate] ?? [],
          (scenarioId) => plan.scenarios.find((scenario) => scenario.id === scenarioId)?.triggerIds,
        ),
      ),
    [onDate, plan],
  );
  const availableLibraryTriggers = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    return libraryTriggers
      .filter((trigger) => !dayAssignedTriggerIds.has(trigger.id))
      .filter((trigger) => !query || trigger.name.toLowerCase().includes(query))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dayAssignedTriggerIds, libraryQuery, libraryTriggers]);
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

  async function removeTriggerFromDay(id: string) {
    const previousAssignments = assignments;
    const previousDayStates = states[onDate] ?? {};
    const dayList = previousAssignments[onDate] ?? [];
    const nextDayList = removeTriggerFromDayAssignments(dayList, id, planScenarios);
    const nextAssignments = { ...previousAssignments };

    if (nextDayList.length === 0) {
      delete nextAssignments[onDate];
    } else {
      nextAssignments[onDate] = nextDayList;
    }

    setAssignments(nextAssignments);
    setStates((current) => {
      const day = { ...(current[onDate] ?? {}) };
      delete day[id];
      return { ...current, [onDate]: day };
    });

    try {
      await saveDateAssignments(createClient(), previousAssignments, nextAssignments);
    } catch {
      setAssignments(previousAssignments);
      setStates((current) => ({
        ...current,
        [onDate]: previousDayStates,
      }));
      showToast("Couldn't remove that trigger from this day. Please try again.", "error");
    }
  }

  function resetTriggerDraft() {
    setTriggerName("");
    setTriggerIcon(undefined);
  }

  function openAddTrigger() {
    resetTriggerDraft();
    setLibraryQuery("");
    setSelectedLibraryIds([]);
    setAddTriggerTab("library");
    setAddingTrigger(true);
  }

  function closeAddTrigger() {
    if (savingTrigger || savingLibrarySelection) {
      return;
    }
    setAddingTrigger(false);
    setAddTriggerTab("library");
    setLibraryQuery("");
    setSelectedLibraryIds([]);
    resetTriggerDraft();
  }

  function toggleLibrarySelection(triggerId: string) {
    if (savingTrigger || savingLibrarySelection) {
      return;
    }
    setSelectedLibraryIds((current) =>
      current.includes(triggerId)
        ? current.filter((id) => id !== triggerId)
        : [...current, triggerId],
    );
  }

  async function assignSelectedLibraryTriggers() {
    if (savingTrigger || savingLibrarySelection || selectedLibraryIds.length === 0) {
      return;
    }

    const previousAssignments = assignments;
    const dayList = previousAssignments[onDate] ?? [];
    const existing = new Set(
      dayList.filter((item) => item.kind === "trigger").map((item) => item.id),
    );
    const toAdd = selectedLibraryIds.filter((id) => !existing.has(id));
    if (toAdd.length === 0) {
      setSelectedLibraryIds([]);
      return;
    }

    setSavingLibrarySelection(true);
    const nextAssignments = {
      ...previousAssignments,
      [onDate]: [
        ...dayList,
        ...toAdd.map((id) => ({ kind: "trigger" as const, id })),
      ],
    };
    setAssignments(nextAssignments);

    try {
      await saveDateAssignments(createClient(), previousAssignments, nextAssignments);
      setSelectedLibraryIds([]);
      showToast(
        toAdd.length === 1
          ? "Trigger added to this day."
          : `${toAdd.length} triggers added to this day.`,
      );
    } catch {
      setAssignments(previousAssignments);
      showToast("Couldn't add those triggers. Please try again.", "error");
    } finally {
      setSavingLibrarySelection(false);
    }
  }

  async function saveNewTrigger() {
    const name = triggerName.trim();
    if (!name || !triggerIcon || savingTrigger) {
      return;
    }

    setSavingTrigger(true);
    const previousAssignments = assignments;

    try {
      const supabase = createClient();
      const created = await addLibraryTrigger(supabase, { name, emoji: triggerIcon });
      addLibraryTriggerToStore(created);

      const dayList = previousAssignments[onDate] ?? [];
      const alreadyAssigned = dayList.some((item) => item.kind === "trigger" && item.id === created.id);

      if (!alreadyAssigned) {
        const nextAssignments = {
          ...previousAssignments,
          [onDate]: [...dayList, { kind: "trigger" as const, id: created.id }],
        };
        setAssignments(nextAssignments);
        try {
          await saveDateAssignments(supabase, previousAssignments, nextAssignments);
        } catch {
          setAssignments(previousAssignments);
          showToast("Trigger saved to your library, but couldn't add it to this day.", "error");
          resetTriggerDraft();
          return;
        }
      }

      resetTriggerDraft();
      showToast("Trigger added to this day and your library.");
    } catch {
      showToast("Couldn't add that trigger. Please try again.", "error");
    } finally {
      setSavingTrigger(false);
    }
  }

  const canSaveTrigger = Boolean(triggerName.trim() && triggerIcon);
  const addBusy = savingTrigger || savingLibrarySelection;
  const selectedLibraryCount = selectedLibraryIds.length;

  const addTriggerPanel = (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-(--pp-spring-green-10) p-6 in-data-[theme=dark]:bg-background-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <IconMark size="xs" shape="circle" tone="primary-muted">
            <PlusIcon size={10} />
          </IconMark>
          <Text as="h3" variant="bodySmall" className="font-(--pp-font-weight-semibold)">
            Add Trigger
          </Text>
        </div>
        <IconButton
          label="Close"
          look="clear"
          size="sm"
          onClick={closeAddTrigger}
          disabled={addBusy}
          className="shrink-0"
        >
          <CloseIcon size={16} />
        </IconButton>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          role="tab"
          aria-selected={addTriggerTab === "library"}
          disabled={addBusy}
          onClick={() => setAddTriggerTab("library")}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-surface px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            addTriggerTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-foreground hover:border-border",
          )}
        >
          <GridIcon size={16} />
          <Text
            variant="caption"
            className={cn(
              "font-(--pp-font-weight-semibold)",
              addTriggerTab === "library" ? "text-primary" : "text-foreground",
            )}
          >
            Choose from Library
          </Text>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={addTriggerTab === "custom"}
          disabled={addBusy}
          onClick={() => setAddTriggerTab("custom")}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-surface px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            addTriggerTab === "custom"
              ? "border-primary text-primary"
              : "border-transparent text-foreground hover:border-border",
          )}
        >
          <PlusIcon size={16} />
          <Text
            variant="caption"
            className={cn(
              "font-(--pp-font-weight-semibold)",
              addTriggerTab === "custom" ? "text-primary" : "text-foreground",
            )}
          >
            Add Custom Trigger
          </Text>
        </button>
      </div>

      {addTriggerTab === "library" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Text variant="caption" className="text-foreground">
              Select triggers from your library
            </Text>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="min-w-0 flex-1 sm:w-52 sm:flex-none">
                <Input
                  size="sm"
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.currentTarget.value)}
                  placeholder="Search triggers..."
                  aria-label="Search library triggers"
                  leftIcon={<SearchIcon size={12} />}
                  disabled={addBusy}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => void assignSelectedLibraryTriggers()}
                disabled={selectedLibraryCount === 0}
                loading={savingLibrarySelection}
                className="shrink-0"
              >
                Add
                {selectedLibraryCount > 0 ? ` (${selectedLibraryCount})` : ""}
              </Button>
            </div>
          </div>

          {availableLibraryTriggers.length === 0 ? (
            <Text variant="caption" className="text-foreground-muted">
              {libraryTriggers.length === 0
                ? "Your library is empty. Switch to Add Custom Trigger to create one."
                : libraryQuery.trim()
                  ? "No matching triggers in your library."
                  : "All library triggers are already on this day."}
            </Text>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">
              {availableLibraryTriggers.map((trigger) => {
                const selected = selectedLibraryIds.includes(trigger.id);

                return (
                  <button
                    key={trigger.id}
                    type="button"
                    disabled={addBusy}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Deselect" : "Select"} ${trigger.name}`}
                    onClick={() => toggleLibrarySelection(trigger.id)}
                    className={cn(
                      "flex min-w-0 cursor-pointer items-center gap-2 rounded-md border bg-surface px-3 py-2 text-left transition-colors",
                      "hover:border-primary hover:bg-primary-muted/40",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      selected
                        ? "border-primary bg-primary-muted/50"
                        : "border-border",
                    )}
                  >
                    <span
                      aria-hidden
                      className="inline-flex size-5 shrink-0 items-center justify-center text-(length:--pp-font-size-14) leading-none"
                    >
                      {trigger.emoji || "⚡"}
                    </span>
                    <Text
                      variant="caption"
                      className="min-w-0 flex-1 truncate font-(--pp-font-weight-medium) text-foreground"
                    >
                      {trigger.name}
                    </Text>
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary text-primary",
                      )}
                    >
                      {selected ? <CheckIcon size={10} /> : <PlusIcon size={10} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void saveNewTrigger();
          }}
        >
          <Text variant="caption" className="text-foreground">
            Create a trigger that isn’t in your library yet
          </Text>
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1 basis-40">
              <Input
                value={triggerName}
                onChange={(event) => setTriggerName(event.currentTarget.value)}
                placeholder="Trigger name"
                aria-label="Custom trigger name"
                disabled={savingTrigger}
              />
            </div>
            <EmojiPicker
              label=""
              placeholder="Icon"
              selected={triggerIcon}
              onSelect={setTriggerIcon}
              className="w-64 shrink-0 sm:w-72"
            />
            <Button
              type="submit"
              size="md"
              disabled={!canSaveTrigger}
              loading={savingTrigger}
              className="shrink-0"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );

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

  async function changeMindSweepItemDate(id: string, nextDate: string) {
    if (nextDate === onDate || !parseIsoDate(nextDate)) {
      return;
    }

    const previous = mindSweepByDate;
    const next = relocateMindSweepItem(previous, id, nextDate);
    if (next === previous) {
      return;
    }

    setMindSweepByDate(next);

    try {
      await persistMindSweepPatches(createClient(), mindSweepPatches(previous, next));
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't update that date. Please try again.", "error");
    }
  }

  async function reorderMindSweepItems(orderedIds: string[]) {
    const previous = mindSweepByDate;
    const next = reorderMindSweepDay(previous, onDate, orderedIds);
    if (next === previous) {
      return;
    }

    setMindSweepByDate(next);

    try {
      await persistMindSweepPatches(createClient(), mindSweepPatches(previous, next));
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't update that order. Please try again.", "error");
    }
  }

  async function saveWritingItem(
    sectionId: string,
    id: string,
    next: { title: string; notes?: string },
  ) {
    const title = next.title.trim();
    if (!title) {
      return;
    }

    const notes = next.notes !== undefined ? next.notes.trim() || null : undefined;

    if (sectionId === "mind-sweep") {
      const previous = mindSweepByDate[onDate] ?? [];
      const currentItem = previous.find((item) => item.id === id);
      if (!currentItem) {
        return;
      }

      const nextNotes = notes !== undefined ? notes : currentItem.notes;
      if (currentItem.title === title && currentItem.notes === nextNotes) {
        return;
      }

      setMindSweepByDate((current) => ({
        ...current,
        [onDate]: (current[onDate] ?? []).map((item) =>
          item.id === id ? { ...item, title, notes: nextNotes } : item,
        ),
      }));

      try {
        await updateMindSweepItem(createClient(), id, {
          title,
          ...(notes !== undefined ? { notes } : {}),
        });
      } catch {
        setMindSweepByDate((current) => ({
          ...current,
          [onDate]: previous,
        }));
        showToast("Couldn't update that item. Please try again.", "error");
      }
      return;
    }

    const kind = writingKindForSection(sectionId);
    if (!kind) {
      return;
    }

    const previousDay = writingByDate[onDate] ?? emptyWritingDay();
    const currentItem = previousDay[kind].find((item) => item.id === id);
    if (!currentItem) {
      return;
    }

    const nextNotes = notes !== undefined ? notes : currentItem.notes;
    if (currentItem.title === title && currentItem.notes === nextNotes) {
      return;
    }

    setWritingByDate((current) => {
      const day = current[onDate] ?? emptyWritingDay();
      return {
        ...current,
        [onDate]: {
          ...day,
          [kind]: day[kind].map((item) =>
            item.id === id ? { ...item, title, notes: nextNotes } : item,
          ),
        },
      };
    });

    try {
      await updateWritingEntry(createClient(), id, {
        title,
        ...(notes !== undefined ? { notes } : {}),
      });
    } catch {
      setWritingByDate((current) => ({
        ...current,
        [onDate]: previousDay,
      }));
      showToast("Couldn't update that item. Please try again.", "error");
    }
  }

  function setWritingItemDirty(sectionId: string, id: string, dirty: boolean) {
    const key = `${sectionId}:${id}`;
    setDirtyItemKeys((current) => {
      const has = current.has(key);
      if (dirty === has) {
        return current;
      }

      const next = new Set(current);
      if (dirty) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  async function addWritingItem(sectionId: string, title: string, notes?: string) {
    if (savingSectionsRef.current.has(sectionId)) {
      return;
    }

    markSaving(sectionId, true);

    try {
      if (sectionId === "mind-sweep") {
        const sortOrder = (mindSweepByDate[onDate]?.length ?? 0) + 1;
        const row = await addMindSweepItem(createClient(), { onDate, title, notes, sortOrder });
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
        const previous = mindSweepByDate;
        const next = removeMindSweepItem(previous, pendingDelete.id);
        setMindSweepByDate(next);
        try {
          await deleteMindSweepItem(createClient(), pendingDelete.id);
          await persistMindSweepPatches(createClient(), mindSweepPatches(previous, next));
        } catch (error) {
          setMindSweepByDate(previous);
          throw error;
        }
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
    const day = {
      ...(pillarsByDateRef.current[onDate] ?? emptyPillarDay()),
    };
    day[pillarId] = { ...day[pillarId], ...patch };
    pillarsByDateRef.current = { ...pillarsByDateRef.current, [onDate]: day };
    setPillarsByDate((current) => ({
      ...current,
      [onDate]: day,
    }));
  }

  async function persistPendingPillars() {
    if (pillarSavingRef.current) {
      return;
    }

    const dates = [...pendingPillarDatesRef.current];
    if (dates.length === 0) {
      return;
    }

    pendingPillarDatesRef.current.clear();
    pillarSavingRef.current = true;

    try {
      for (const forDate of dates) {
        const values = pillarsByDateRef.current[forDate] ?? emptyPillarDay();
        const saved = savedPillarsByDateRef.current[forDate] ?? emptyPillarDay();
        if (pillarDaysEqual(values, saved)) {
          continue;
        }

        const next = await savePillarEntries(createClient(), forDate, values);
        const latest = pillarsByDateRef.current[forDate] ?? emptyPillarDay();
        savedPillarsByDateRef.current = { ...savedPillarsByDateRef.current, [forDate]: next };
        markPillarsSaved(forDate, next);

        if (pillarDaysEqual(latest, values)) {
          pillarsByDateRef.current = { ...pillarsByDateRef.current, [forDate]: next };
          setPillarsByDate((current) => ({ ...current, [forDate]: next }));
        } else {
          pendingPillarDatesRef.current.add(forDate);
        }
      }
    } catch {
      showToast("Couldn't save progression. Please try again.", "error");
    } finally {
      pillarSavingRef.current = false;
      if (pendingPillarDatesRef.current.size > 0) {
        void persistPendingPillars();
      }
    }
  }

  function flushPillarSaves() {
    if (pillarSaveTimerRef.current != null) {
      window.clearTimeout(pillarSaveTimerRef.current);
      pillarSaveTimerRef.current = null;
    }

    void persistPendingPillars();
  }

  function schedulePillarSave(forDate: string) {
    pendingPillarDatesRef.current.add(forDate);
    if (pillarSaveTimerRef.current != null) {
      window.clearTimeout(pillarSaveTimerRef.current);
    }

    pillarSaveTimerRef.current = window.setTimeout(() => {
      pillarSaveTimerRef.current = null;
      void persistPendingPillars();
    }, PILLAR_SAVE_DELAY_MS);
  }

  useEffect(() => {
    if (previousPillarDateRef.current == null) {
      previousPillarDateRef.current = onDate;
      return;
    }

    if (previousPillarDateRef.current === onDate) {
      return;
    }

    pendingPillarDatesRef.current.add(previousPillarDateRef.current);
    previousPillarDateRef.current = onDate;
    flushPillarSaves();
  }, [onDate]);

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
      ? writingItemsFromMindSweep(mindSweepByDate[onDate] ?? [], today)
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
        onItemChange={(id, next) => void saveWritingItem(section.id, id, next)}
        onItemDateChange={
          isMindSweep ? (id, nextDate) => void changeMindSweepItemDate(id, nextDate) : undefined
        }
        onReorder={isMindSweep ? (orderedIds) => void reorderMindSweepItems(orderedIds) : undefined}
        onItemDirtyChange={(id, dirty) => setWritingItemDirty(section.id, id, dirty)}
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
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <HomeBanner
        size="lg"
        kicker={HOME_HERO.kicker}
        title={HOME_HERO.title}
        description={HOME_HERO.description}
        image={HOME_BANNER_IMAGES.hero}
        priority
      />

      <section id="flow-overview" className="flex scroll-mt-28 flex-col items-center gap-1 py-2 text-center">
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

      <div id="flow-calendar" className="scroll-mt-28">
        <CalendarStrip
          value={date}
          onChange={changeDate}
          view={calendarView}
          onViewChange={setCalendarView}
          markers={calendarMarkers}
          className="max-w-none"
        />
      </div>

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.triggers.kicker}
        title={HOME_BANNERS.triggers.title}
        description={HOME_BANNERS.triggers.description}
        image={HOME_BANNER_IMAGES.triggers}
      />

      <Card id="flow-triggers" className="flex w-full scroll-mt-28 flex-col gap-section">
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
          action={
            addingTrigger ? undefined : (
              <Button size="md" className="shrink-0 max-sm:hidden" onClick={openAddTrigger}>
                <PlusIcon size={16} />
                Add Trigger
              </Button>
            )
          }
        />

        {addingTrigger ? addTriggerPanel : null}

        {triggers.length === 0 && !addingTrigger ? (
          <EmptyState
            className="border-0 bg-transparent py-8"
            media={<FilesIcon size="xl" className="text-(--pp-spring-green-700)" />}
            title="No triggers yet"
            description="Add your first trigger to start building small actions that create big change over time."
            action={
              <Button size="md" onClick={openAddTrigger}>
                <PlusIcon size={16} />
                Add Your First Trigger
              </Button>
            }
          />
        ) : triggers.length > 0 ? (
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
                    onDelete={() => void removeTriggerFromDay(trigger.id)}
                  />
                );
              })}
            </div>

            {!addingTrigger ? (
              <Button className="md:hidden max-sm:w-full" size="md" onClick={openAddTrigger}>
                <PlusIcon size={16} />
                Add Trigger
              </Button>
            ) : null}

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
        ) : null}
      </Card>

      <div id={`flow-${HOME_WRITING_SECTIONS[0].id}`} className="scroll-mt-28">
        {writingSection(HOME_WRITING_SECTIONS[0])}
      </div>

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.writing.kicker}
        title={HOME_BANNERS.writing.title}
        description={HOME_BANNERS.writing.description}
        image={HOME_BANNER_IMAGES.writing}
      />

      {HOME_WRITING_SECTIONS.slice(1, 3).map((section) => (
        <div key={section.id} id={`flow-${section.id}`} className="scroll-mt-28">
          {writingSection(section)}
        </div>
      ))}


      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.pillars.kicker}
        title={HOME_BANNERS.pillars.title}
        description={HOME_BANNERS.pillars.description}
        image={HOME_BANNER_IMAGES.pillars}
      />

      <div id="flow-quotes" className="scroll-mt-28">
        {writingSection(HOME_WRITING_SECTIONS[3])}
      </div>
      {HOME_WRITING_SECTIONS.slice(4).map((section) => (
        <div key={section.id} id={`flow-${section.id}`} className="scroll-mt-28">
          {writingSection(section)}
        </div>
      ))}

      <Card id="flow-pillars" className="flex w-full scroll-mt-28 flex-col gap-section">
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
                pendingPillarDatesRef.current.add(onDate);
                flushPillarSaves();
              }}
              onNotesChange={(value) => {
                updatePillar(pillar.id, { notes: value });
                schedulePillarSave(onDate);
              }}
              onNotesBlur={() => {
                pendingPillarDatesRef.current.add(onDate);
                flushPillarSaves();
              }}
              icon={<ItemIcon>{PILLAR_ICONS[pillar.id]}</ItemIcon>}
            />
          ))}
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
