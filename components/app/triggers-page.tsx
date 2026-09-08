"use client";

import { useMemo, useState } from "react";

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
import { TRIGGERS_HEADING } from "@/lib/triggers/content";
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
  const [assigning, setAssigning] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment[]>>(
    () => savedAssignments,
  );
  const [assignmentBaseline, setAssignmentBaseline] = useState<Record<string, DayAssignment[]>>(
    () => savedAssignments,
  );
  const [date, setDate] = useState(() => new Date());
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [savingScenario, setSavingScenario] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [assignSelection, setAssignSelection] = useState<LibraryDragPayload[]>([]);
  const { toasts, showToast, dismissToast } = useToasts();

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

  function clearAssignSelection() {
    setAssignSelection([]);
  }

  const canSaveAssign = JSON.stringify(assignments) !== JSON.stringify(assignmentBaseline);

  function startAssigning() {
    if (savingAssign) return;
    cancelTrigger();
    cancelScenario();
    setAssignmentBaseline(assignments);
    clearAssignSelection();
    setAssigning(true);
  }

  function cancelAssigning() {
    if (savingAssign) return;
    setAssignments(assignmentBaseline);
    clearAssignSelection();
    setAssigning(false);
  }

  async function saveAssigning() {
    if (!canSaveAssign || savingAssign) return;

    setSavingAssign(true);
    try {
      const supabase = createClient();
      await saveDateAssignments(supabase, assignmentBaseline, assignments);
      setSavedAssignments(assignments);
      setStates((current) =>
        pruneStatesToAssignments(
          current,
          assignments,
          (scenarioId) => scenarioById.get(scenarioId)?.triggerIds,
        ),
      );
      setAssignmentBaseline(assignments);
      clearAssignSelection();
      setAssigning(false);
      showToast("Triggers assigned to your calendar.");
    } catch {
      showToast("Couldn't save those assignments. Please try again.", "error");
    } finally {
      setSavingAssign(false);
    }
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
      setAssignments((current) => ({ ...current, [key]: nextList }));
    }

    if (blocked) {
      showToast("A date can have at most 10 triggers, including ones inside scenarios.", "warning");
    }
  }

  const markers = useMemo(() => {
    const next: Record<string, CalendarMarker> = {};
    for (const [key, items] of Object.entries(assignments)) {
      const baselineItems = assignmentBaseline[key] ?? [];
      const assigned = items.map((item) => {
        const addedThisPass = !baselineItems.some(
          (entry) => entry.kind === item.kind && entry.id === item.id,
        );

        if (item.kind === "trigger") {
          const trigger = triggerById.get(item.id);
          return {
            kind: item.kind,
            id: item.id,
            name: trigger?.name,
            icon: trigger?.icon,
            addedThisPass,
          };
        }

        const scenario = scenarioById.get(item.id);
        return {
          kind: item.kind,
          id: item.id,
          name: scenario?.title,
          icon: scenario?.icon,
          addedThisPass,
        };
      });

      next[key] = {
        count: items.length,
        icons: assigned.map((item) => item.icon),
        items: assigned,
      };
    }
    return next;
  }, [assignmentBaseline, assignments, scenarioById, triggerById]);

  async function persistDayChange(
    next: Record<string, DayAssignment[]>,
    write: () => Promise<void>,
  ) {
    const previous = assignments;
    setAssignments(next);
    if (assigning) {
      return;
    }

    setAssignmentBaseline(next);
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
      setAssignmentBaseline(previous);
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
    setAssignmentBaseline(next);
    setSavedAssignments(next);

    try {
      await saveDateAssignments(createClient(), previous, next);
      setStates((current) =>
        pruneStatesToAssignments(current, next, (scenarioId) => scenarioById.get(scenarioId)?.triggerIds),
      );
      showToast("Calendar cleared.");
    } catch {
      setAssignments(previous);
      setAssignmentBaseline(previous);
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6">
      <section className="flex flex-col items-center gap-1 py-2 text-center">
        <Text as="h1" variant="display" className="text-center">
          {TRIGGERS_HEADING.title}
        </Text>
        <Text as="p" variant="sectionTitle" className="text-center font-normal text-secondary">
          {TRIGGERS_HEADING.subtitle}
        </Text>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-2">
        <TriggersLibrary
          columns={2}
          className="h-full"
          assigning={assigning}
          state={addingTrigger ? "add" : addingScenario || assigning ? "pick" : "default"}
          items={triggers}
          selectedIds={selectedTriggerIds}
          onSelectedChange={(id, checked) => {
            const trigger = triggers.find((entry) => entry.id === id);
            if (!trigger) return;
            toggleAssignSelection({ kind: "trigger", id, name: trigger.name }, checked);
          }}
          selection={assignSelection}
          name={triggerName}
          onNameChange={setTriggerName}
          selectedIcon={triggerIcon}
          onIconSelect={setTriggerIcon}
          onAdd={() => {
            cancelScenario();
            cancelAssigning();
            setAddingTrigger(true);
          }}
          onSave={() => void saveTrigger()}
          onCancel={() => {
            if (!savingTrigger) cancelTrigger();
          }}
          saving={savingTrigger}
          onDelete={(id) => {
            const item = triggers.find((trigger) => trigger.id === id);
            if (!item) return;
            setPendingDelete({ kind: "library-trigger", id, name: item.name });
          }}
        />
        <ScenariosLibrary
          className="h-full"
          assigning={assigning}
          state={addingScenario ? "add" : assigning ? "pick" : "default"}
          items={scenarios}
          selectedIds={selectedScenarioIds}
          onSelectedChange={(id, checked) => {
            const scenario = scenarios.find((entry) => entry.id === id);
            if (!scenario) return;
            toggleAssignSelection({ kind: "scenario", id, name: scenario.title }, checked);
          }}
          selection={assignSelection}
          name={scenarioName}
          onNameChange={setScenarioName}
          description={scenarioDescription}
          onDescriptionChange={setScenarioDescription}
          selectedIcon={scenarioIcon}
          onIconSelect={setScenarioIcon}
          droppedTriggers={scenarioTriggers}
          pendingCount={pendingScenarioTriggerCount}
          onAddSelected={addSelectedTriggersToScenario}
          onDropTrigger={dropScenarioTrigger}
          onRemoveTrigger={removeScenarioTrigger}
          onAdd={() => {
            cancelTrigger();
            cancelAssigning();
            setAddingScenario(true);
          }}
          onSave={() => void saveScenario()}
          onCancel={cancelScenario}
          saving={savingScenario}
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
        className="max-w-none"
        assigning={assigning}
        canSaveAssign={canSaveAssign}
        assignSaving={savingAssign}
        selectionCount={assignSelection.length}
        markers={markers}
        onAssign={startAssigning}
        onCancelAssign={cancelAssigning}
        onSaveAssign={() => void saveAssigning()}
        onDropOnDate={assignToDate}
        onRemoveFromDate={(day, item) => {
          void removeFromDate(item.kind, item.id, day);
        }}
        onEditDate={(day) => {
          setDate(day);
          setDayDrawerOpen(true);
        }}
        onDayClick={(day) => {
          if (assigning) {
            if (assignSelection.length > 0) assignToDate(day, assignSelection);
            return;
          }
          setDayDrawerOpen(true);
        }}
        onClear={() => setPendingDelete({ kind: "calendar-clear" })}
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
          if (assigning) {
            void removeFromDate("scenario", id);
            return;
          }
          setPendingDelete({ kind: "date-scenario", id, name: item.title });
        }}
        onRemoveTrigger={(id) => {
          const item = dayTriggers.find((trigger) => trigger.id === id);
          if (!item) return;
          if (assigning) {
            void removeFromDate("trigger", id);
            return;
          }
          setPendingDelete({ kind: "date-trigger", id, name: item.title });
        }}
        onAdd={() => {
          setDayDrawerOpen(false);
          startAssigning();
        }}
        onClear={() => {
          if (assigning) {
            void clearDate();
            return;
          }
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
