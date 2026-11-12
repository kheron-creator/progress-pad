// Browser helpers for the micro sprints on "the T" (Mind Sweep > Micro sprints).
// The T page itself is a static page; these let other pages read and update the same lines.

export type SprintTask = {
  text: string;
  done?: boolean;
  doneAt?: string | null;
  sweepId?: string | null;
  logged?: boolean;
  cp?: boolean;
  star?: boolean;
  day?: string;
  mins?: number;
  draft?: boolean;
};

export type SprintData = {
  kind?: string;
  name?: string;
  start?: string;
  day?: string;
  order?: number;
  status?: "active" | "done";
  doneAt?: string | null;
  logged?: boolean;
  sweepId?: string | null;
  tasks?: SprintTask[];
  activity?: { text: string; date: string }[];
  [key: string]: unknown;
};

export type SprintDoc = { id: string; data: SprintData };

export const MICRO_SPRINTS_HREF = "/active-mind-sweep/micro-sprints";

export function localToday() {
  return new Date().toLocaleDateString("en-CA");
}

export function isSprint(doc: SprintDoc) {
  return doc.data.kind !== "pin" && typeof doc.data.name === "string";
}

export async function fetchSprints(): Promise<SprintDoc[]> {
  const response = await fetch("/api/micro-sprints", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Couldn't load micro sprints");
  }
  const body = (await response.json()) as { docs?: SprintDoc[] };
  return (body.docs ?? []).filter(isSprint);
}

export async function saveSprint(id: string, data: SprintData) {
  const response = await fetch("/api/micro-sprints", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, data }),
  });
  if (!response.ok) {
    throw new Error("Couldn't save that micro sprint");
  }
}

export async function padAction(tool: string, input: Record<string, unknown>) {
  const response = await fetch("/api/micro-sprints/pad", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool, input }),
  });
  if (!response.ok) {
    throw new Error("Couldn't update the pad");
  }
  return response.json() as Promise<{ payload?: unknown }>;
}

export function newClientSprintId() {
  return "s" + crypto.randomUUID().replace(/-/g, "").slice(0, 15);
}

/** Real steps: not checkpoints and not PT drafts waiting to be kept. */
export function activeSteps(data: SprintData) {
  return (data.tasks ?? []).filter((task) => !task.cp && !task.draft);
}

/** Index of the next step to do on a line, or -1. */
export function nextStepIndex(data: SprintData) {
  return (data.tasks ?? []).findIndex((task) => !task.cp && !task.draft && !task.done);
}

const STOP_WORDS = new Set(["the", "and", "for", "with", "to", "a", "an", "of", "on", "in", "my", "get", "do", "it", "is", "at", "up"]);

function words(text: string) {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

/** The open line whose name and steps share the most words with `title`, if any share at least one. */
export function bestMatchingLine(title: string, sprints: SprintDoc[]) {
  const wanted = words(title);
  let best: SprintDoc | null = null;
  let bestScore = 0;
  for (const sprint of sprints) {
    if (sprint.data.status === "done") {
      continue;
    }
    const have = words([sprint.data.name ?? "", ...activeSteps(sprint.data).map((task) => task.text)].join(" "));
    let score = 0;
    for (const word of wanted) {
      if (have.has(word)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = sprint;
      bestScore = score;
    }
  }
  return best;
}

const reachedAt = (tasks: SprintTask[], index: number) =>
  tasks.slice(0, index).filter((task) => !task.cp && !task.draft).every((task) => task.done);

/**
 * Ticks a step the same way the T does: adds it to the line's activity, logs a win on the
 * Done List once, marks its Mind Sweep item achieved, logs checkpoints reached, and finishes
 * the line (with a "Sprint complete" win) when every step is done. Returns the new data.
 */
export function tickStep(data: SprintData, index: number): SprintData {
  const was = data.tasks ?? [];
  const task = was[index];
  if (!task || task.done) {
    return data;
  }
  const day = localToday();
  const tasks = was.map((step) => ({ ...step }));
  const step = tasks[index];
  step.done = true;
  step.doneAt = day;
  const next: SprintData = { ...data, tasks, activity: [...(data.activity ?? []), { text: step.text, date: day }] };
  const wins: { text: string; sweepId?: string | null }[] = [];

  if (!step.logged) {
    step.logged = true;
    wins.push({ text: step.text, sweepId: step.sweepId });
  } else {
    sweepStatus(step.sweepId, "achieved");
  }

  tasks.forEach((checkpoint, k) => {
    if (checkpoint.cp && reachedAt(tasks, k) && !reachedAt(was, k) && !checkpoint.logged) {
      checkpoint.logged = true;
      wins.push({ text: "Checkpoint: " + checkpoint.text });
    }
  });

  const steps = activeSteps(next);
  if (steps.length > 0 && steps.every((item) => item.done) && data.status !== "done") {
    next.status = "done";
    next.doneAt = day;
    sweepStatus(data.sweepId, "achieved");
    if (!data.logged) {
      next.logged = true;
      wins.push({ text: "Sprint complete: " + (data.name ?? "") });
    }
  }

  for (const win of wins) {
    sweepStatus(win.sweepId, "achieved");
    padAction("add_entry", { kind: "done", text: win.text, notes: "From the Progress T" }).catch(() => {});
  }
  return next;
}

function sweepStatus(id: string | null | undefined, status: "todo" | "achieved") {
  if (id) {
    padAction("update_mind_sweep_item", { id, status }).catch(() => {});
  }
}
