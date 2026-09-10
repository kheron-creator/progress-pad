"use client";

import { useMemo, useState } from "react";

import { AddScenarioDrawer } from "@/components/ui/add-scenario-drawer";
import { AddTriggerDrawer } from "@/components/ui/add-trigger-drawer";
import { CalendarStrip, isoDate, type CalendarMarker } from "@/components/ui/calendar-strip";
import { DayPlanDrawer } from "@/components/ui/day-plan-drawer";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { IconMark } from "@/components/ui/icon-mark";
import { ScenariosLibrary, type LibraryScenario } from "@/components/ui/scenarios-library";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { type DroppedTrigger } from "@/components/ui/trigger-dropzone";
import { TriggersLibrary, type LibraryTrigger } from "@/components/ui/triggers-library";
import { useSessionStore } from "@/components/app/session-store-provider";
import { createClient } from "@/lib/supabase/client";
import { SUGGESTED_TRIGGERS, TRIGGERS_HEADING } from "@/lib/triggers/content";
import { type LibraryDragPayload } from "@/lib/triggers/drag";
import {
  addLibraryScenario,
  addLibraryTrigger,
  clearDateAssignments,
  pruneStatesToAssignments,
  removeDateAssignment,
  saveDateAssignments,
  softDeleteLibraryScenario,
  softDeleteLibraryTrigger,
  uniqueAssignedTriggerIds,
  MAX_TRIGGERS_PER_DATE,
  type DateAssignmentItem,
  type StoredScenario,
  type StoredTrigger,
} from "@/lib/triggers/store";

type DayAssignment = DateAssignmentItem;

type PendingDelete =
  | { kind: "library-trigger"; id: string; name: string }
  | { kind: "library-scenario"; id: string; name: string }
  | { kind: "date-trigger"; id: string; name: string }
  | { kind: "date-scenario"; id: string; name: string }
  | { kind: "date-clear" }
  | { kind: "calendar-clear" };

const DELETE_COPY: Record<
  PendingDelete["kind"],
  { title: string; description: (name?: string) => string; confirm: string }
> = {
  "library-trigger": {
    title: "Delete this trigger?",
    description: (name) => `“${name}” will be removed from your library. This cannot be undone.`,
    confirm: "Delete",
  },
  "library-scenario": {
    title: "Delete this scenario?",
    description: (name) => `“${name}” will be removed from your library. This cannot be undone.`,
    confirm: "Delete",
  },
  "date-trigger": {
    title: "Remove this trigger?",
    description: (name) => `“${name}” will be removed from this date. It will stay in your library.`,
    confirm: "Remove",
  },
  "date-scenario": {
    title: "Remove this scenario?",
    description: (name) =>
      `“${name}” and its triggers will be removed from this date. It will stay in your library.`,
    confirm: "Remove",
  },
  "date-clear": {
    title: "Clear this date?",
    description: () =>
      "All scenarios and triggers will be removed from this date. They will stay in your library.",
    confirm: "Clear",
  },
  "calendar-clear": {
    title: "Clear calendar?",
    description: () =>
      "All scenarios and triggers will be removed from every date. They will stay in your library.",
    confirm: "Clear calendar",
  },
};

function EmojiMark({ children }: { children: string }) {
  return (
    <IconMark size="sm" tone="surface">
      <span aria-hidden className="text-(length:--pp-font-size-14) leading-none">
        {children}
      </span>
    </IconMark>
  );
}

function scenarioMeta(count: number) {
  return `${count} trigger${count === 1 ? "" : "s"}`;
}

function toLibraryTrigger(item: StoredTrigger): LibraryTrigger {
  return {
    id: item.id,
    name: item.name,
    icon: item.emoji ? <EmojiMark>{item.emoji}</EmojiMark> : undefined,
  };
}

function toLibraryScenario(item: StoredScenario): LibraryScenario {
  return {
    id: item.id,
    title: item.name,
    description: item.description ?? undefined,
    meta: scenarioMeta(item.triggerIds.length),
    triggerCount: item.triggerIds.length,
    triggerIds: item.triggerIds,
    icon: item.emoji ? <EmojiMark>{item.emoji}</EmojiMark> : undefined,
  };
}

export function TriggersPage() {
  const libraryTriggers = useSessionStore((state) => state.libraryTriggers);
  const libraryScenarios = useSessionStore((state) => state.libraryScenarios);
  const planTriggers = useSessionStore((state) => state.planTriggers);
  const planScenarios = useSessionStore((state) => state.planScenarios);
  const savedAssignments = useSessionStore((state) => state.assignments);
  const setSavedAssignments = useSessionStore((state) => state.setAssignments);
  const setStates = useSessionStore((state) => state.setStates);
  const addLibraryTriggerToStore = useSessionStore((state) => state.addLibraryTrigger);
  const removeLibraryTriggerFromStore = useSessionStore((state) => state.removeLibraryTrigger);
  const addLibraryScenarioToStore = useSessionStore((state) => state.addLibraryScenario);
  const removeLibraryScenarioFromStore = useSessionStore((state) => state.removeLibraryScenario);
  const triggers = useMemo(() => libraryTriggers.map(toLibraryTrigger), [libraryTriggers]);
  const scenarios = useMemo(() => libraryScenarios.map(toLibraryScenario), [libraryScenarios]);
  const triggerById = useMemo(() => {
    const next = new Map<string, LibraryTrigger>();
    for (const item of planTriggers) next.set(item.id, toLibraryTrigger(item));
    for (const item of libraryTriggers) next.set(item.id, toLibraryTrigger(item));
    return next;
  }, [planTriggers, libraryTriggers]);
  const scenarioById = useMemo(() => {
    const next = new Map<string, LibraryScenario>();
    for (const item of planScenarios) next.set(item.id, toLibraryScenario(item));
    for (const item of libraryScenarios) next.set(item.id, toLibraryScenario(item));
    return next;
  }, [planScenarios, libraryScenarios]);
  const [addingTrigger, setAddingTrigger] = useState(false);
  const [addingScenario, setAddingScenario] = useState(false);
  const [triggerName, setTriggerName] = useState("");
  const [triggerIcon, setTriggerIcon] = useState<string>();
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [scenarioIcon, setScenarioIcon] = useState<string>();
  const [scenarioTriggers, setScenarioTriggers] = useState<DroppedTrigger[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment[]>>(
    () => savedAssignments,
  );
  const [date, setDate] = useState(() => new Date());
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [savingScenario, setSavingScenario] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [assignSelection, setAssignSelection] = useState<LibraryDragPayload[]>([]);
  const [hiddenSuggestionIds, setHiddenSuggestionIds] = useState<Set<string>>(() => new Set());
  const { toasts, showToast, dismissToast } = useToasts();

  const suggestedTriggers = useMemo(() => {
    const keys = new Set(
      libraryTriggers.map((item) => item.source_key).filter((key): key is string => Boolean(key)),
    );
    const names = new Set(libraryTriggers.map((item) => item.name.trim().toLowerCase()));
    return SUGGESTED_TRIGGERS.filter(
      (item) =>
        !keys.has(item.id) &&
        !names.has(item.name.toLowerCase()) &&
        !hiddenSuggestionIds.has(item.id),
    ).map((item) => ({
      id: item.id,
      name: item.name,
      icon: <EmojiMark>{item.emoji}</EmojiMark>,
    }));
  }, [hiddenSuggestionIds, libraryTriggers]);

  function cancelTrigger() {
    setTriggerName("");
    setTriggerIcon(undefined);
    setAddingTrigger(false);
  }

  function cancelScenario() {
    if (savingScenario) return;
    setScenarioName("");
    setScenarioDescription("");
    setScenarioIcon(undefined);
    setScenarioTriggers([]);
    setAddingScenario(false);
    clearAssignSelection();
  }

  function removeScenarioTrigger(id: string) {
    setScenarioTriggers((current) => current.filter((item) => item.id !== id));
  }

  function addTriggersToScenario(items: DroppedTrigger[]) {
    if (items.length === 0) return;
    setScenarioTriggers((current) => {
      const next = [...current];
      const seen = new Set(next.map((entry) => entry.id));
      for (const item of items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const source = triggers.find((trigger) => trigger.id === item.id);
        next.push({ id: item.id, name: item.name, icon: source?.icon ?? item.icon });
      }
      return next.length === current.length ? current : next;
    });
    clearAssignSelection();
  }

  function dropScenarioTrigger(item: DroppedTrigger) {
    addTriggersToScenario([item]);
  }

  function addSelectedTriggersToScenario() {
    addTriggersToScenario(
      assignSelection
        .filter((item) => item.kind === "trigger")
        .map((item) => ({ id: item.id, name: item.name })),
    );
  }

  async function saveTrigger() {
    const name = triggerName.trim();
    if (!name || !triggerIcon || savingTrigger) return;

    setSavingTrigger(true);
    try {
      const supabase = createClient();
      const created = await addLibraryTrigger(supabase, { name, emoji: triggerIcon });
      addLibraryTriggerToStore(created);
      setTriggerName("");
      setTriggerIcon(undefined);
      setAddingTrigger(false);
      showToast("Trigger added to your library.");
    } catch {
      showToast("Couldn't add that trigger. Please try again.", "error");
    } finally {
      setSavingTrigger(false);
    }
  }

  async function addSuggestedTrigger(id: string) {
    const suggestion = SUGGESTED_TRIGGERS.find((item) => item.id === id);
    if (!suggestion) return;
    if (
      hiddenSuggestionIds.has(id) ||
      libraryTriggers.some((item) => item.source_key === id || item.name.trim().toLowerCase() === suggestion.name.toLowerCase())
    ) {
      return;
    }

    const pendingId = `pending:${suggestion.id}`;
    const pending: StoredTrigger = {
      id: pendingId,
      name: suggestion.name,
      emoji: suggestion.emoji,
      source_key: suggestion.id,
    };

    setHiddenSuggestionIds((current) => new Set(current).add(id));
    addLibraryTriggerToStore(pending);

    try {
      const supabase = createClient();
      const created = await addLibraryTrigger(supabase, {
        name: suggestion.name,
        emoji: suggestion.emoji,
        sourceKey: suggestion.id,
      });
      addLibraryTriggerToStore(created);
      if (created.id !== pendingId) {
        setAssignments((current) => {
          let changed = false;
          const next: Record<string, DayAssignment[]> = {};
          for (const [onDate, items] of Object.entries(current)) {
            next[onDate] = items.map((item) => {
              if (item.kind !== "trigger" || item.id !== pendingId) {
                return item;
              }
              changed = true;
              return { ...item, id: created.id };
            });
          }
          return changed ? next : current;
        });
      }
    } catch {
      removeLibraryTriggerFromStore(pendingId);
      setHiddenSuggestionIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      showToast("Couldn't add that trigger. Please try again.", "error");
    }
  }

  async function saveScenario() {
    const title = scenarioName.trim();
    if (!title || !scenarioIcon || scenarioTriggers.length === 0 || savingScenario) return;

    setSavingScenario(true);
    try {
      const supabase = createClient();
      const created = await addLibraryScenario(supabase, {
        name: title,
        emoji: scenarioIcon,
        description: scenarioDescription,
        triggerIds: scenarioTriggers.map((item) => item.id),
      });
      addLibraryScenarioToStore(created);
      setScenarioName("");
      setScenarioDescription("");
      setScenarioIcon(undefined);
      setScenarioTriggers([]);
      setAddingScenario(false);
      clearAssignSelection();
      showToast("Scenario added to your library.");
    } catch {
      showToast("Couldn't add that scenario. Please try again.", "error");
    } finally {
      setSavingScenario(false);
    }
  }

  const selectedTriggerIds = useMemo(() => {
    const next = new Set<string>();
    for (const item of assignSelection) {
      if (item.kind === "trigger") next.add(item.id);
    }
    return next;
  }, [assignSelection]);

  const selectedScenarioIds = useMemo(() => {
    const next = new Set<string>();
    for (const item of assignSelection) {
      if (item.kind === "scenario") next.add(item.id);
    }
    return next;
  }, [assignSelection]);

  const pendingScenarioTriggerCount = useMemo(() => {
    const added = new Set(scenarioTriggers.map((item) => item.id));
    return assignSelection.filter((item) => item.kind === "trigger" && !added.has(item.id)).length;
  }, [assignSelection, scenarioTriggers]);

  function toggleAssignSelection(item: LibraryDragPayload, checked: boolean) {
    setAssignSelection((current) => {
      if (checked) {
        if (current.some((entry) => entry.kind === item.kind && entry.id === item.id)) {
          return current;
        }
        return [...current, item];
      }
      return current.filter((entry) => !(entry.kind === item.kind && entry.id === item.id));
    });
  }

  function setKindSelection(kind: LibraryDragPayload["kind"], items: LibraryDragPayload[], selected: boolean) {
    setAssignSelection((current) => {
      const rest = current.filter((entry) => entry.kind !== kind);
      if (!selected) return rest;
      const seen = new Set(rest.map((entry) => `${entry.kind}:${entry.id}`));
      const next = [...rest];
      for (const item of items) {
        const key = `${item.kind}:${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(item);
      }
      return next;
    });
  }

  function clearAssignSelection() {
    setAssignSelection([]);
  }

  function assignToDate(day: Date, items: LibraryDragPayload[]) {
    if (items.length === 0) return;

    const key = isoDate(day);
    const list = assignments[key] ?? [];
    const nextList = [...list];
    let blocked = false;
    let added = 0;

    for (const item of items) {
      if (nextList.some((entry) => entry.kind === item.kind && entry.id === item.id)) {
        continue;
      }

      const candidate: DayAssignment[] = [...nextList, { kind: item.kind, id: item.id }];
      const count = uniqueAssignedTriggerIds(
        candidate,
        (scenarioId) => scenarioById.get(scenarioId)?.triggerIds,
      ).length;

      if (count > MAX_TRIGGERS_PER_DATE) {
        blocked = true;
        continue;
      }

      nextList.push({ kind: item.kind, id: item.id });
      added += 1;
    }

    if (added > 0) {
      const next = { ...assignments, [key]: nextList };
      void persistDayChange(next, () => saveDateAssignments(createClient(), assignments, next));
    }

    if (blocked) {
      showToast("A date can have at most 10 triggers, including ones inside scenarios.", "warning");
    }
  }

  const markers = useMemo(() => {
    const next: Record<string, CalendarMarker> = {};
    for (const [key, items] of Object.entries(assignments)) {
      const assigned = items.map((item) => {
        if (item.kind === "trigger") {
          const trigger = triggerById.get(item.id);
          return {
            kind: item.kind,
            id: item.id,
            name: trigger?.name,
            icon: trigger?.icon,
          };
        }

        const scenario = scenarioById.get(item.id);
        return {
          kind: item.kind,
          id: item.id,
          name: scenario?.title,
          icon: scenario?.icon,
        };
      });

      next[key] = {
        count: items.length,
        icons: assigned.map((item) => item.icon),
        items: assigned,
      };
    }
    return next;
  }, [assignments, scenarioById, triggerById]);

  async function persistDayChange(
    next: Record<string, DayAssignment[]>,
    write: () => Promise<void>,
  ) {
    const previous = assignments;
    setAssignments(next);
    setSavedAssignments(next);
    try {
      await write();
      setStates((current) =>
        pruneStatesToAssignments(
          current,
          next,
          (scenarioId) => scenarioById.get(scenarioId)?.triggerIds,
        ),
      );
    } catch {
      setAssignments(previous);
      setSavedAssignments(previous);
      showToast("Couldn't update that date. Please try again.", "error");
    }
  }

  function removeFromDate(kind: DayAssignment["kind"], id: string, day = date) {
    const key = isoDate(day);
    const next = {
      ...assignments,
      [key]: (assignments[key] ?? []).filter((item) => !(item.kind === kind && item.id === id)),
    };
    if (next[key].length === 0) {
      delete next[key];
    }
    return persistDayChange(next, () =>
      removeDateAssignment(createClient(), key, { kind, id }),
    );
  }

  function clearDate() {
    const key = isoDate(date);
    const next = { ...assignments };
    delete next[key];
    return persistDayChange(next, () => clearDateAssignments(createClient(), key));
  }

  async function clearCalendar() {
    const previous = assignments;
    const next: Record<string, DayAssignment[]> = {};
    setAssignments(next);
    setSavedAssignments(next);

    try {
      await saveDateAssignments(createClient(), previous, next);
      setStates((current) =>
        pruneStatesToAssignments(current, next, (scenarioId) => scenarioById.get(scenarioId)?.triggerIds),
      );
      showToast("Calendar cleared.");
    } catch {
      setAssignments(previous);
      setSavedAssignments(previous);
      showToast("Couldn't clear the calendar. Please try again.", "error");
    }
  }

  const dayAssignments = assignments[isoDate(date)] ?? [];
  const dayScenarios = dayAssignments
    .filter((item) => item.kind === "scenario")
    .flatMap((item) => {
      const scenario = scenarioById.get(item.id);
      return scenario
        ? [
          {
            id: scenario.id,
            title: scenario.title,
            meta: scenario.meta,
            icon: scenario.icon,
          },
        ]
        : [];
    });
  const dayTriggers = dayAssignments
    .filter((item) => item.kind === "trigger")
    .flatMap((item) => {
      const trigger = triggerById.get(item.id);
      return trigger
        ? [
          {
            id: trigger.id,
            title: trigger.name,
            icon: trigger.icon,
          },
        ]
        : [];
    });
  const dayTriggerCount = uniqueAssignedTriggerIds(
    dayAssignments,
    (scenarioId) => scenarioById.get(scenarioId)?.triggerIds,
  ).length;

  async function confirmDelete() {
    if (!pendingDelete || deletePending) return;

    if (pendingDelete.kind === "library-trigger") {
      setDeletePending(true);
      try {
        const supabase = createClient();
        await softDeleteLibraryTrigger(supabase, pendingDelete.id);
        removeLibraryTriggerFromStore(pendingDelete.id);
        setScenarioTriggers((current) => current.filter((item) => item.id !== pendingDelete.id));
        showToast("Trigger removed.");
        setPendingDelete(null);
      } catch {
        showToast("Couldn't remove that trigger. Please try again.", "error");
      } finally {
        setDeletePending(false);
      }
      return;
    }

    if (pendingDelete.kind === "library-scenario") {
      setDeletePending(true);
      try {
        const supabase = createClient();
        await softDeleteLibraryScenario(supabase, pendingDelete.id);
        removeLibraryScenarioFromStore(pendingDelete.id);
        showToast("Scenario removed.");
        setPendingDelete(null);
      } catch {
        showToast("Couldn't remove that scenario. Please try again.", "error");
      } finally {
        setDeletePending(false);
      }
      return;
    }

    if (pendingDelete.kind === "date-trigger") {
      setDeletePending(true);
      try {
        await removeFromDate("trigger", pendingDelete.id);
        setPendingDelete(null);
      } finally {
        setDeletePending(false);
      }
      return;
    }

    if (pendingDelete.kind === "date-scenario") {
      setDeletePending(true);
      try {
        await removeFromDate("scenario", pendingDelete.id);
        setPendingDelete(null);
      } finally {
        setDeletePending(false);
      }
      return;
    }

    if (pendingDelete.kind === "date-clear") {
      setDeletePending(true);
      try {
        await clearDate();
        setPendingDelete(null);
      } finally {
        setDeletePending(false);
      }
      return;
    }

    if (pendingDelete.kind === "calendar-clear") {
      setDeletePending(true);
      try {
        await clearCalendar();
        setPendingDelete(null);
      } finally {
        setDeletePending(false);
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <section className="flex flex-col items-center gap-1 py-2 text-center">
        <Text as="h1" variant="pageTitle" className="text-center">
          {TRIGGERS_HEADING.title}
        </Text>
        <Text as="p" variant="subtitle" className="text-center font-normal text-secondary">
          {TRIGGERS_HEADING.subtitle}
        </Text>
      </section>

      <div className="grid grid-cols-1 items-start gap-3 md:gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 md:gap-4">
          <TriggersLibrary
            columns={2}
            items={triggers}
            selectedIds={selectedTriggerIds}
            onSelectedChange={(id, checked) => {
              const trigger = triggers.find((entry) => entry.id === id);
              if (!trigger) return;
              toggleAssignSelection({ kind: "trigger", id, name: trigger.name }, checked);
            }}
            onSelectAll={(selected) =>
              setKindSelection(
                "trigger",
                triggers.map((trigger) => ({ kind: "trigger", id: trigger.id, name: trigger.name })),
                selected,
              )
            }
            selection={assignSelection}
            onAdd={() => {
              cancelScenario();
              setDayDrawerOpen(false);
              setAddingTrigger(true);
            }}
            onDelete={(id) => {
              const item = triggers.find((trigger) => trigger.id === id);
              if (!item) return;
              setPendingDelete({ kind: "library-trigger", id, name: item.name });
            }}
            suggestions={suggestedTriggers}
            onAddSuggestion={(id) => void addSuggestedTrigger(id)}
          />
          <ScenariosLibrary
            columns={2}
            items={scenarios}
            selectedIds={selectedScenarioIds}
            onSelectedChange={(id, checked) => {
              const scenario = scenarios.find((entry) => entry.id === id);
              if (!scenario) return;
              toggleAssignSelection({ kind: "scenario", id, name: scenario.title }, checked);
            }}
            onSelectAll={(selected) =>
              setKindSelection(
                "scenario",
                scenarios.map((scenario) => ({ kind: "scenario", id: scenario.id, name: scenario.title })),
                selected,
              )
            }
            selection={assignSelection}
            onAdd={() => {
              cancelTrigger();
              setDayDrawerOpen(false);
              setAddingScenario(true);
            }}
            onDelete={(id) => {
              const item = scenarios.find((scenario) => scenario.id === id);
              if (!item) return;
              setPendingDelete({ kind: "library-scenario", id, name: item.title });
            }}
          />
        </div>

        <CalendarStrip
          look="intention"
          view="month"
          value={date}
          onChange={setDate}
          className="max-w-none self-start"
          selectionCount={addingScenario ? 0 : assignSelection.length}
          markers={markers}
          onDropOnDate={addingScenario ? undefined : assignToDate}
          onDayClick={(day) => {
            if (addingScenario) return;
            if (assignSelection.length > 0) {
              assignToDate(day, assignSelection);
              return;
            }
            cancelTrigger();
            setDayDrawerOpen(true);
          }}
          onClear={() => setPendingDelete({ kind: "calendar-clear" })}
        />
      </div>

      <AddScenarioDrawer
        open={addingScenario}
        onOpenChange={(open) => {
          if (open) {
            cancelTrigger();
            setDayDrawerOpen(false);
            setAddingScenario(true);
            return;
          }
          cancelScenario();
        }}
        name={scenarioName}
        onNameChange={setScenarioName}
        description={scenarioDescription}
        onDescriptionChange={setScenarioDescription}
        selectedIcon={scenarioIcon}
        onIconSelect={setScenarioIcon}
        droppedTriggers={scenarioTriggers}
        libraryTriggers={triggers}
        pendingCount={pendingScenarioTriggerCount}
        onAddSelected={addSelectedTriggersToScenario}
        onDropTrigger={dropScenarioTrigger}
        onAddTriggers={addTriggersToScenario}
        onRemoveTrigger={removeScenarioTrigger}
        onSave={() => void saveScenario()}
        saving={savingScenario}
      />

      <AddTriggerDrawer
        open={addingTrigger}
        onOpenChange={(open) => {
          if (open) {
            cancelScenario();
            setDayDrawerOpen(false);
            setAddingTrigger(true);
            return;
          }
          if (!savingTrigger) cancelTrigger();
        }}
        name={triggerName}
        onNameChange={setTriggerName}
        selectedIcon={triggerIcon}
        onIconSelect={setTriggerIcon}
        onSave={() => void saveTrigger()}
        saving={savingTrigger}
      />

      <DayPlanDrawer
        open={dayDrawerOpen}
        onOpenChange={setDayDrawerOpen}
        date={date}
        scenarios={dayScenarios}
        triggers={dayTriggers}
        triggerCount={dayTriggerCount}
        onRemoveScenario={(id) => {
          const item = dayScenarios.find((scenario) => scenario.id === id);
          if (!item) return;
          setPendingDelete({ kind: "date-scenario", id, name: item.title });
        }}
        onRemoveTrigger={(id) => {
          const item = dayTriggers.find((trigger) => trigger.id === id);
          if (!item) return;
          setPendingDelete({ kind: "date-trigger", id, name: item.title });
        }}
        onClear={() => {
          setPendingDelete({ kind: "date-clear" });
        }}
      />

      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePending) setPendingDelete(null);
        }}
        title={pendingDelete ? DELETE_COPY[pendingDelete.kind].title : "Delete?"}
        description={
          pendingDelete
            ? DELETE_COPY[pendingDelete.kind].description(
              "name" in pendingDelete ? pendingDelete.name : undefined,
            )
            : undefined
        }
      >
        <DialogConfirmActions
          danger
          pending={deletePending}
          confirmLabel={pendingDelete ? DELETE_COPY[pendingDelete.kind].confirm : "Delete"}
          onCancel={() => {
            if (!deletePending) setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      </Dialog>
    </div>
  );
}
