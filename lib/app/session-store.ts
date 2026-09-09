import { createStore } from "zustand/vanilla";

import {
  clonePillarDay,
  clonePillarsByDate,
  type MindSweepByDate,
  type PillarDayValues,
  type PillarsByDate,
  type WritingByDate,
} from "@/lib/home/store";
import type { StoredNotification } from "@/lib/notifications/store";
import type {
  DateAssignmentItem,
  DateTriggerStatus,
  StoredScenario,
  StoredTrigger,
} from "@/lib/triggers/store";

import type { AppSession } from "./session";

type Updater<T> = T | ((current: T) => T);

function apply<T>(current: T, next: Updater<T>) {
  return typeof next === "function" ? (next as (current: T) => T)(current) : next;
}

function mergeById<T extends { id: string }>(...lists: T[][]) {
  const next = new Map<string, T>();
  for (const list of lists) {
    for (const item of list) {
      next.set(item.id, item);
    }
  }
  return [...next.values()];
}

function remapAssignmentTriggerId(
  assignments: Record<string, DateAssignmentItem[]>,
  fromId: string,
  toId: string,
) {
  if (fromId === toId) {
    return assignments;
  }

  let changed = false;
  const next: Record<string, DateAssignmentItem[]> = {};
  for (const [onDate, items] of Object.entries(assignments)) {
    next[onDate] = items.map((item) => {
      if (item.kind !== "trigger" || item.id !== fromId) {
        return item;
      }
      changed = true;
      return { ...item, id: toId };
    });
  }
  return changed ? next : assignments;
}

export type SessionState = AppSession & {
  savedPillarsByDate: PillarsByDate;
  setAssignments: (assignments: Updater<Record<string, DateAssignmentItem[]>>) => void;
  setStates: (states: Updater<Record<string, Record<string, DateTriggerStatus>>>) => void;
  setWritingByDate: (writingByDate: Updater<WritingByDate>) => void;
  setMindSweepByDate: (mindSweepByDate: Updater<MindSweepByDate>) => void;
  setPillarsByDate: (pillarsByDate: Updater<PillarsByDate>) => void;
  markPillarsSaved: (onDate: string, values: PillarDayValues) => void;
  setNotifications: (notifications: Updater<StoredNotification[]>) => void;
  addNotification: (notification: StoredNotification) => void;
  addLibraryTrigger: (trigger: StoredTrigger) => void;
  removeLibraryTrigger: (id: string) => void;
  addLibraryScenario: (scenario: StoredScenario) => void;
  removeLibraryScenario: (id: string) => void;
};

export type SessionStore = ReturnType<typeof createSessionStore>;

export function createSessionStore(initial: AppSession) {
  return createStore<SessionState>()((set) => ({
    ...initial,
    savedPillarsByDate: clonePillarsByDate(initial.pillarsByDate),
    setAssignments: (assignments) =>
      set((current) => ({ assignments: apply(current.assignments, assignments) })),
    setStates: (states) => set((current) => ({ states: apply(current.states, states) })),
    setWritingByDate: (writingByDate) =>
      set((current) => ({ writingByDate: apply(current.writingByDate, writingByDate) })),
    setMindSweepByDate: (mindSweepByDate) =>
      set((current) => ({ mindSweepByDate: apply(current.mindSweepByDate, mindSweepByDate) })),
    setPillarsByDate: (pillarsByDate) =>
      set((current) => ({ pillarsByDate: apply(current.pillarsByDate, pillarsByDate) })),
    markPillarsSaved: (onDate, values) =>
      set((current) => ({
        savedPillarsByDate: { ...current.savedPillarsByDate, [onDate]: clonePillarDay(values) },
      })),
    setNotifications: (notifications) =>
      set((current) => ({ notifications: apply(current.notifications, notifications) })),
    addNotification: (notification) =>
      set((current) => {
        if (current.notifications.some((item) => item.id === notification.id)) {
          return current;
        }
        return { notifications: [notification, ...current.notifications] };
      }),
    addLibraryTrigger: (trigger) =>
      set((current) => {
        const match = current.libraryTriggers.find(
          (item) =>
            item.id === trigger.id ||
            (trigger.source_key != null && item.source_key === trigger.source_key),
        );
        if (!match) {
          return {
            libraryTriggers: [...current.libraryTriggers, trigger],
            planTriggers: mergeById(current.planTriggers, [trigger]),
          };
        }

        return {
          libraryTriggers: current.libraryTriggers.map((item) => (item.id === match.id ? trigger : item)),
          planTriggers: mergeById(
            current.planTriggers.filter((item) => item.id !== match.id),
            [trigger],
          ),
          assignments: remapAssignmentTriggerId(current.assignments, match.id, trigger.id),
        };
      }),
    removeLibraryTrigger: (id) =>
      set((current) => ({
        libraryTriggers: current.libraryTriggers.filter((item) => item.id !== id),
      })),
    addLibraryScenario: (scenario) =>
      set((current) => ({
        libraryScenarios: [...current.libraryScenarios, scenario],
        planScenarios: mergeById(current.planScenarios, [scenario]),
      })),
    removeLibraryScenario: (id) =>
      set((current) => ({
        libraryScenarios: current.libraryScenarios.filter((item) => item.id !== id),
      })),
  }));
}
