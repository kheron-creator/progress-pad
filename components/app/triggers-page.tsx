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
import { type LibraryDragPayload } from "@/lib/triggers/drag";
import {
  SCENARIO_LIBRARY_SEED,
  TRIGGER_LIBRARY_SEED,
  TRIGGERS_HEADING,
} from "@/lib/triggers/content";

type DayAssignment = {
  kind: LibraryDragPayload["kind"];
  id: string;
};

type PendingDelete =
  | { kind: "library-trigger"; id: string; name: string }
  | { kind: "library-scenario"; id: string; name: string }
  | { kind: "date-trigger"; id: string; name: string }
  | { kind: "date-scenario"; id: string; name: string }
  | { kind: "date-clear" };

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
};

function scenarioTriggerCount(scenario: LibraryScenario) {
  if (typeof scenario.triggerCount === "number") return scenario.triggerCount;
  const match = scenario.meta?.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function EmojiMark({ children }: { children: string }) {
  return (
    <IconMark size="sm" tone="surface">
      <span aria-hidden className="text-(length:--pp-font-size-14) leading-none">
        {children}
      </span>
    </IconMark>
  );
}

export function TriggersPage() {
  const seed = useMemo(() => {
    const triggers = TRIGGER_LIBRARY_SEED.map((item) => ({
      id: item.id,
      name: item.name,
      icon: <EmojiMark>{item.emoji}</EmojiMark>,
    }));
    const scenarios = SCENARIO_LIBRARY_SEED.map((item) => ({
      id: item.id,
      title: item.title,
      meta: item.meta,
      triggerCount: Number.parseInt(item.meta, 10),
      icon: <EmojiMark>{item.emoji}</EmojiMark>,
    }));
    return { triggers, scenarios };
  }, []);

  const [triggers, setTriggers] = useState<LibraryTrigger[]>(seed.triggers);
  const [scenarios, setScenarios] = useState<LibraryScenario[]>(seed.scenarios);
  const [addingTrigger, setAddingTrigger] = useState(false);
  const [addingScenario, setAddingScenario] = useState(false);
  const [triggerName, setTriggerName] = useState("");
  const [triggerIcon, setTriggerIcon] = useState<string>();
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [scenarioIcon, setScenarioIcon] = useState<string>();
  const [scenarioTriggers, setScenarioTriggers] = useState<DroppedTrigger[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment[]>>({});
  const [assignmentBaseline, setAssignmentBaseline] = useState<Record<string, DayAssignment[]>>({});
  const [date, setDate] = useState(() => new Date());
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const { toasts, showToast } = useToasts();

  function cancelTrigger() {
    setTriggerName("");
    setTriggerIcon(undefined);
    setAddingTrigger(false);
  }

  function cancelScenario() {
    setScenarioName("");
    setScenarioDescription("");
    setScenarioIcon(undefined);
    setScenarioTriggers([]);
    setAddingScenario(false);
  }

  function removeScenarioTrigger(id: string) {
    setScenarioTriggers((current) => current.filter((item) => item.id !== id));
  }

  function dropScenarioTrigger(item: DroppedTrigger) {
    const source = triggers.find((trigger) => trigger.id === item.id);
    setScenarioTriggers((current) =>
      current.some((entry) => item.id === entry.id)
        ? current
        : [...current, { id: item.id, name: item.name, icon: source?.icon }],
    );
  }

  function saveTrigger() {
    const name = triggerName.trim();
    if (!name || !triggerIcon) return;

    setTriggers((current) => [
      ...current,
      { id: `trigger-${Date.now()}`, name, icon: <EmojiMark>{triggerIcon}</EmojiMark> },
    ]);
    setTriggerName("");
    setTriggerIcon(undefined);
    setAddingTrigger(false);
    showToast("Trigger added to your library.");
  }

  function saveScenario() {
    const title = scenarioName.trim();
    if (!title || !scenarioIcon || scenarioTriggers.length === 0) return;

    setScenarios((current) => [
      ...current,
      {
        id: `scenario-${Date.now()}`,
        title,
        description: scenarioDescription.trim() || undefined,
        meta: `${scenarioTriggers.length} trigger${scenarioTriggers.length === 1 ? "" : "s"}`,
        triggerCount: scenarioTriggers.length,
        icon: <EmojiMark>{scenarioIcon}</EmojiMark>,
      },
    ]);
    cancelScenario();
    showToast("Scenario added to your library.");
  }

  function startAssigning() {
    cancelTrigger();
    cancelScenario();
    setAssignmentBaseline(assignments);
    setAssigning(true);
  }

  function cancelAssigning() {
    setAssignments(assignmentBaseline);
    setAssigning(false);
  }

  function saveAssigning() {
    setAssignmentBaseline(assignments);
    setAssigning(false);
    showToast("Triggers assigned to your calendar.");
  }

  const canSaveAssign = JSON.stringify(assignments) !== JSON.stringify(assignmentBaseline);

  function assignToDate(day: Date, item: LibraryDragPayload) {
    const key = isoDate(day);
    setAssignments((current) => {
      const list = current[key] ?? [];
      if (list.some((entry) => entry.kind === item.kind && entry.id === item.id)) {
        return current;
      }
      return { ...current, [key]: [...list, { kind: item.kind, id: item.id }] };
    });
  }

  const markers = useMemo(() => {
    const next: Record<string, CalendarMarker> = {};
    for (const [key, items] of Object.entries(assignments)) {
      next[key] = {
        count: items.length,
        icons: items.map((item) =>
          item.kind === "trigger"
            ? triggers.find((trigger) => trigger.id === item.id)?.icon
            : scenarios.find((scenario) => scenario.id === item.id)?.icon,
        ),
      };
    }
    return next;
  }, [assignments, scenarios, triggers]);

  function persistAssignments(next: Record<string, DayAssignment[]>) {
    setAssignments(next);
    if (!assigning) {
      setAssignmentBaseline(next);
    }
  }

  function removeFromDate(kind: DayAssignment["kind"], id: string) {
    const key = isoDate(date);
    const next = {
      ...assignments,
      [key]: (assignments[key] ?? []).filter((item) => !(item.kind === kind && item.id === id)),
    };
    persistAssignments(next);
  }

  function clearDate() {
    const key = isoDate(date);
    const next = { ...assignments };
    delete next[key];
    persistAssignments(next);
  }

  const dayAssignments = assignments[isoDate(date)] ?? [];
  const dayScenarios = dayAssignments
    .filter((item) => item.kind === "scenario")
    .flatMap((item) => {
      const scenario = scenarios.find((entry) => entry.id === item.id);
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
      const trigger = triggers.find((entry) => entry.id === item.id);
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
  const dayTriggerCount =
    dayTriggers.length +
    dayScenarios.reduce((sum, item) => {
      const scenario = scenarios.find((entry) => entry.id === item.id);
      return sum + (scenario ? scenarioTriggerCount(scenario) : 0);
    }, 0);

  function confirmDelete() {
    if (!pendingDelete) return;

    if (pendingDelete.kind === "library-trigger") {
      setTriggers((current) => current.filter((item) => item.id !== pendingDelete.id));
      showToast("Trigger removed.");
    } else if (pendingDelete.kind === "library-scenario") {
      setScenarios((current) => current.filter((item) => item.id !== pendingDelete.id));
      showToast("Scenario removed.");
    } else if (pendingDelete.kind === "date-trigger") {
      removeFromDate("trigger", pendingDelete.id);
    } else if (pendingDelete.kind === "date-scenario") {
      removeFromDate("scenario", pendingDelete.id);
    } else if (pendingDelete.kind === "date-clear") {
      clearDate();
    }

    setPendingDelete(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
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
          name={triggerName}
          onNameChange={setTriggerName}
          selectedIcon={triggerIcon}
          onIconSelect={setTriggerIcon}
          onAdd={() => {
            cancelScenario();
            cancelAssigning();
            setAddingTrigger(true);
          }}
          onSave={saveTrigger}
          onCancel={cancelTrigger}
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
          name={scenarioName}
          onNameChange={setScenarioName}
          description={scenarioDescription}
          onDescriptionChange={setScenarioDescription}
          selectedIcon={scenarioIcon}
          onIconSelect={setScenarioIcon}
          droppedTriggers={scenarioTriggers}
          onDropTrigger={dropScenarioTrigger}
          onRemoveTrigger={removeScenarioTrigger}
          onAdd={() => {
            cancelTrigger();
            cancelAssigning();
            setAddingScenario(true);
          }}
          onSave={saveScenario}
          onCancel={cancelScenario}
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
        markers={markers}
        onAssign={startAssigning}
        onCancelAssign={cancelAssigning}
        onSaveAssign={saveAssigning}
        onDropOnDate={assignToDate}
        onDayClick={() => setDayDrawerOpen(true)}
        onClear={() => setDate(new Date())}
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
        onAdd={() => {
          setDayDrawerOpen(false);
          startAssigning();
        }}
        onClear={() => setPendingDelete({ kind: "date-clear" })}
      />

      <ToastRegion toasts={toasts} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
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
          confirmLabel={pendingDelete ? DELETE_COPY[pendingDelete.kind].confirm : "Delete"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      </Dialog>
    </div>
  );
}
