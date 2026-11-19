"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  bestMatchingLine,
  fetchSprints,
  localToday,
  MICRO_SPRINTS_HREF,
  newClientSprintId,
  saveSprint,
  type SprintDoc,
} from "@/lib/micro-sprints/client";

const SKIP_KEY = "pt-sweep-ask-off";

export type SweepPromptItem = { id: string; title: string };

/** Shown after a Mind Sweep item is added: keep it here, make it a micro sprint, or add it to a matching line. */
export function SweepToSprintPrompt({ item, onClose }: { item: SweepPromptItem | null; onClose: () => void }) {
  const [sprints, setSprints] = useState<SprintDoc[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ item: SweepPromptItem; text: string } | null>(null);
  const [off, setOff] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(SKIP_KEY) === "1");
  const done = result && result.item === item ? result.text : null;

  useEffect(() => {
    if (!item || off) {
      return;
    }
    let live = true;
    fetchSprints()
      .then((docs) => live && setSprints(docs))
      .catch(() => live && setSprints([]));
    return () => {
      live = false;
    };
  }, [item, off]);

  useEffect(() => {
    if (!done) {
      return;
    }
    const timer = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timer);
  }, [done, onClose]);

  if (!item || off) {
    return null;
  }

  const match = sprints ? bestMatchingLine(item.title, sprints) : null;
  const active = sprints?.filter((sprint) => sprint.data.status !== "done") ?? [];

  const setDone = (text: string) => item && setResult({ item, text });

  async function makeSprint() {
    if (!item) return;
    setSaving(true);
    try {
      const day = localToday();
      const order = active.reduce((max, sprint) => Math.max(max, Number(sprint.data.order) || 0), 0) + 1;
      await saveSprint(newClientSprintId(), {
        name: item.title,
        start: day,
        day,
        order,
        status: "active",
        doneAt: null,
        sweepId: item.id,
        tasks: [],
        activity: [],
        links: [],
      });
      setDone("It's on the T as a new line. Add its first small step there.");
    } catch {
      setDone("Couldn't reach the T just now. It's safe in your Mind Sweep.");
    } finally {
      setSaving(false);
    }
  }

  async function addToLine(line: SprintDoc) {
    if (!item) return;
    setSaving(true);
    try {
      const tasks = [...(line.data.tasks ?? []), { text: item.title, done: false, sweepId: item.id }];
      await saveSprint(line.id, { ...line.data, tasks, status: "active", doneAt: null });
      setDone(`Added as a step on "${line.data.name}".`);
    } catch {
      setDone("Couldn't reach the T just now. It's safe in your Mind Sweep.");
    } finally {
      setSaving(false);
    }
  }

  function stopAsking() {
    window.localStorage.setItem(SKIP_KEY, "1");
    setOff(true);
    onClose();
  }

  return (
    <Card padding="sm" className="flex flex-col gap-3" aria-live="polite">
      {done ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text variant="bodySmall">{done}</Text>
          <div className="flex gap-2">
            <Button size="sm" look="clear" href={MICRO_SPRINTS_HREF}>
              Open the T
            </Button>
            <Button size="sm" look="clear" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Text variant="bodySmall">
            Where should <strong>{item.title}</strong> go?
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" look="outline" onClick={onClose} disabled={saving}>
              Keep in Mind Sweep
            </Button>
            <Button size="sm" look="outline" onClick={makeSprint} disabled={saving || !sprints}>
              Make it a micro sprint
            </Button>
            {match ? (
              <Button size="sm" look="outline" onClick={() => addToLine(match)} disabled={saving}>
                Add to {match.data.name}
              </Button>
            ) : null}
          </div>
          <button type="button" className="self-start text-xs text-foreground-muted underline" onClick={stopAsking}>
            Don&apos;t ask again
          </button>
        </>
      )}
    </Card>
  );
}
