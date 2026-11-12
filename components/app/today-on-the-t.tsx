"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import {
  fetchSprints,
  localToday,
  MICRO_SPRINTS_HREF,
  nextStepIndex,
  saveSprint,
  tickStep,
  type SprintDoc,
} from "@/lib/micro-sprints/client";

const MAX_LINES = 3;

/** A calm strip on Home: up to three lines on the T for today (or overdue), each with its next step to tick. */
export function TodayOnTheT() {
  const [sprints, setSprints] = useState<SprintDoc[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchSprints()
      .then(setSprints)
      .catch(() => setSprints([]));
  }, []);

  useEffect(() => {
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  if (!sprints) {
    return null;
  }

  const today = localToday();
  const lines = sprints
    .filter((sprint) => sprint.data.status !== "done" && (sprint.data.day ?? sprint.data.start ?? today) <= today)
    .sort((a, b) => (Number(a.data.order) || 0) - (Number(b.data.order) || 0))
    .slice(0, MAX_LINES);

  if (lines.length === 0) {
    return null;
  }

  async function tick(sprint: SprintDoc, index: number) {
    setBusy(sprint.id);
    const data = tickStep(sprint.data, index);
    setSprints((current) => current?.map((doc) => (doc.id === sprint.id ? { ...doc, data } : doc)) ?? current);
    try {
      await saveSprint(sprint.id, data);
      setNote(
        data.status === "done"
          ? `${sprint.data.name} complete. Lovely work, it's on your Done list.`
          : "Done and logged. On to the next one.",
      );
    } catch {
      setNote("Couldn't save that tick. Please try again.");
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card padding="sm" className="flex flex-col gap-3" aria-label="Today on the T">
      <div className="flex items-center justify-between gap-2">
        <Text as="h2" variant="cardTitle">
          Today on the T
        </Text>
        <Button size="sm" look="clear" href={MICRO_SPRINTS_HREF}>
          Open the T
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {lines.map((sprint) => {
          const index = nextStepIndex(sprint.data);
          const step = index >= 0 ? sprint.data.tasks?.[index] : undefined;
          return (
            <li key={sprint.id} className="flex items-center gap-3">
              {step ? (
                <Checkbox
                  aria-label={`Tick ${step.text}`}
                  checked={false}
                  disabled={busy === sprint.id}
                  onChange={() => void tick(sprint, index)}
                />
              ) : (
                <span className="size-[var(--pp-checkbox-md)] shrink-0" />
              )}
              <div className="min-w-0">
                <Text variant="bodySmall" className="truncate">
                  {step ? step.text : "Add a first small step"}
                </Text>
                <Text variant="caption" className="truncate text-foreground-muted">
                  {sprint.data.name}
                  {step?.mins ? ` · ${step.mins} min` : ""}
                </Text>
              </div>
            </li>
          );
        })}
      </ul>
      {note ? (
        <Text variant="caption" className="text-foreground-muted" aria-live="polite">
          {note}
        </Text>
      ) : null}
    </Card>
  );
}
