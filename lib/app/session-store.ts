import { createStore } from "zustand/vanilla";

import type { MindSweepByDate, PillarsByDate, WritingByDate } from "@/lib/home/store";
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

export type SessionState = AppSession & {
  setAssignments: (assignments: Updater<Record<string, DateAssignmentItem[]>>) => void;
  setStates: (states: Updater<Record<string, Record<string, DateTriggerStatus>>>) => void;
  setWritingByDate: (writingByDate: Updater<WritingByDate>) => void;
  setMindSweepByDate: (mindSweepByDate: Updater<MindSweepByDate>) => void;
  setPillarsByDate: (pillarsByDate: Updater<PillarsByDate>) => void;
  addLibraryTrigger: (trigger: StoredTrigger) => void;
  removeLibraryTrigger: (id: string) => void;
  addLibraryScenario: (scenario: StoredScenario) => void;
  removeLibraryScenario: (id: string) => void;
};

export type SessionStore = ReturnType<typeof createSessionStore>;

export function createSessionStore(initial: AppSession) {
  return createStore<SessionState>()((set) => ({
    ...initial,
    setAssignments: (assignments) =>
      set((current) => ({ assignments: apply(current.assignments, assignments) })),
    setStates: (states) => set((current) => ({ states: apply(current.states, states) })),
    setWritingByDate: (writingByDate) =>
      set((current) => ({ writingByDate: apply(current.writingByDate, writingByDate) })),
    setMindSweepByDate: (mindSweepByDate) =>
      set((current) => ({ mindSweepByDate: apply(current.mindSweepByDate, mindSweepByDate) })),
    setPillarsByDate: (pillarsByDate) =>
      set((current) => ({ pillarsByDate: apply(current.pillarsByDate, pillarsByDate) })),
    addLibraryTrigger: (trigger) =>
      set((current) => ({
        libraryTriggers: [...current.libraryTriggers, trigger],
        planTriggers: mergeById(current.planTriggers, [trigger]),
      })),
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
