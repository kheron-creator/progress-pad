"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { FlowNavigator } from "@/components/ui/flow-navigator";
import {
  BrainIcon,
  CalendarBlankIcon,
  ChartLineIcon,
  ChecksIcon,
  LightbulbIcon,
  LightningIcon,
  NoteIcon,
  QuotesIcon,
  SparkleIcon,
} from "@/components/ui/icon";

import { useUnsavedLeave } from "./unsaved-leave-provider";

export const FLOW_SECTIONS = [
  { id: "overview", label: "Overview", icon: <CalendarBlankIcon size={12} /> },
  { id: "triggers", label: "Trigger List", icon: <LightningIcon size={12} /> },
  { id: "gratitude", label: "Daily Gratitude", icon: <SparkleIcon size={12} /> },
  { id: "mind-sweep", label: "Mind Sweep", icon: <BrainIcon size={12} /> },
  { id: "done-list", label: "Done List", icon: <ChecksIcon size={12} /> },
  { id: "quotes", label: "Impactful Quotes", icon: <QuotesIcon size={12} /> },
  { id: "journal", label: "Let’s Journal", icon: <NoteIcon size={12} /> },
  { id: "reflections", label: "Reflections", icon: <LightbulbIcon size={12} /> },
  { id: "pillars", label: "Progression Pillars", icon: <ChartLineIcon size={12} /> },
] as const;

export function flowSectionDomId(id: string) {
  return `flow-${id}`;
}

function scrollToDomId(domId: string) {
  document.getElementById(domId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function activeSectionId(nodes: HTMLElement[]) {
  const line = 112;
  const viewportBottom = window.innerHeight;
  const atBottom = window.scrollY + viewportBottom >= document.documentElement.scrollHeight - 4;

  if (atBottom) {
    return nodes.at(-1)?.id.replace(/^flow-/, "");
  }

  let best: HTMLElement | undefined;
  let bestDist = Infinity;
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.bottom <= line || rect.top >= viewportBottom) {
      continue;
    }
    const dist = Math.abs(rect.top - line);
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }

  return (best ?? nodes[0])?.id.replace(/^flow-/, "");
}

export function AppFlowNavigator() {
  const pathname = usePathname();
  const { guardedPush } = useUnsavedLeave();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(FLOW_SECTIONS[0].id);
  const selectedRef = useRef(selected);
  const pinnedIdRef = useRef<string | null>(null);
  const current = FLOW_SECTIONS.find((item) => item.id === selected) ?? FLOW_SECTIONS[0];
  selectedRef.current = selected;

  useEffect(() => {
    if (pathname !== "/home") {
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const nodes = FLOW_SECTIONS.map((item) => document.getElementById(flowSectionDomId(item.id))).filter(
      (node): node is HTMLElement => node != null,
    );
    if (nodes.length === 0) {
      return;
    }

    function sync() {
      if (pinnedIdRef.current) {
        return;
      }
      const id = activeSectionId(nodes);
      if (id && id !== selectedRef.current) {
        setSelected(id);
      }
    }

    function releasePin() {
      if (!pinnedIdRef.current) {
        return;
      }
      pinnedIdRef.current = null;
      sync();
    }

    function handleKey(event: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        releasePin();
      }
    }

    const observer = new IntersectionObserver(sync, {
      rootMargin: "-15% 0px -65% 0px",
      threshold: [0, 0.1, 0.25, 1],
    });

    for (const node of nodes) {
      observer.observe(node);
    }

    window.addEventListener("wheel", releasePin, { passive: true });
    window.addEventListener("touchmove", releasePin, { passive: true });
    window.addEventListener("keydown", handleKey);

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", releasePin);
      window.removeEventListener("touchmove", releasePin);
      window.removeEventListener("keydown", handleKey);
    };
  }, [pathname]);

  function goTo(id: string) {
    pinnedIdRef.current = id;
    selectedRef.current = id;
    setSelected(id);

    if (!pathname.startsWith("/home")) {
      guardedPush(`/home#${flowSectionDomId(id)}`);
      return;
    }

    scrollToDomId(flowSectionDomId(id));
  }

  function step(direction: -1 | 1) {
    const index = FLOW_SECTIONS.findIndex((item) => item.id === selectedRef.current);
    const next = FLOW_SECTIONS[Math.min(FLOW_SECTIONS.length - 1, Math.max(0, index + direction))];
    if (next) {
      goTo(next.id);
    }
  }

  if (pathname !== "/home") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-30">
      <div className="pointer-events-auto">
        <FlowNavigator
          open={open}
          onOpenChange={setOpen}
          items={FLOW_SECTIONS.map((item) => ({ id: item.id, label: item.label, icon: item.icon }))}
          selected={selected}
          onSelect={goTo}
          currentLabel={current.label}
          onJumpTop={() => goTo(FLOW_SECTIONS[0].id)}
          onJumpBottom={() => goTo(FLOW_SECTIONS[FLOW_SECTIONS.length - 1].id)}
          onStepPrev={() => step(-1)}
          onStepNext={() => step(1)}
        />
      </div>
    </div>
  );
}
