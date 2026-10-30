import type { SupabaseClient } from "@supabase/supabase-js";

import {
  loadHomePillars,
  loadHomeWriting,
  type MindSweepByDate,
  type PillarsByDate,
  type WritingByDate,
} from "@/lib/home/store";
import { loadNotifications, type StoredNotification } from "@/lib/notifications/store";
import type { Database } from "@/lib/supabase/database";
import {
  loadDatePlan,
  loadDateTriggerStates,
  loadDateTriggerTimes,
  loadLibraryScenarios,
  loadLibraryTriggers,
  pruneStatesToAssignments,
  type DateAssignmentItem,
  type DateTriggerStatus,
  type StoredScenario,
  type StoredTrigger,
} from "@/lib/triggers/store";

type Client = SupabaseClient<Database>;

export type AppSession = {
  assignments: Record<string, DateAssignmentItem[]>;
  planTriggers: StoredTrigger[];
  planScenarios: StoredScenario[];
  libraryTriggers: StoredTrigger[];
  libraryScenarios: StoredScenario[];
  states: Record<string, Record<string, DateTriggerStatus>>;
  /** How many times each trigger was done, by date. */
  times: Record<string, Record<string, number>>;
  writingByDate: WritingByDate;
  mindSweepByDate: MindSweepByDate;
  pillarsByDate: PillarsByDate;
  notifications: StoredNotification[];
};

function mergeById<T extends { id: string }>(...lists: T[][]) {
  const next = new Map<string, T>();
  for (const list of lists) {
    for (const item of list) {
      next.set(item.id, item);
    }
  }
  return [...next.values()];
}

export async function loadAppSession(supabase: Client): Promise<AppSession> {
  const [plan, states, times, writing, pillars, libraryTriggers, libraryScenarios, notifications] =
    await Promise.all([
      loadDatePlan(supabase),
      loadDateTriggerStates(supabase),
      loadDateTriggerTimes(supabase),
      loadHomeWriting(supabase),
      loadHomePillars(supabase),
      loadLibraryTriggers(supabase),
      loadLibraryScenarios(supabase),
      loadNotifications(supabase),
    ]);

  const scenarioTriggerIds = new Map<string, readonly string[]>();
  for (const scenario of mergeById(plan.scenarios, libraryScenarios)) {
    scenarioTriggerIds.set(scenario.id, scenario.triggerIds);
  }

  return {
    assignments: plan.assignments,
    planTriggers: mergeById(plan.triggers, libraryTriggers),
    planScenarios: mergeById(plan.scenarios, libraryScenarios),
    libraryTriggers,
    libraryScenarios,
    states: pruneStatesToAssignments(
      states,
      plan.assignments,
      (scenarioId) => scenarioTriggerIds.get(scenarioId),
    ),
    times,
    writingByDate: writing.writingByDate,
    mindSweepByDate: writing.mindSweepByDate,
    pillarsByDate: pillars,
    notifications,
  };
}
