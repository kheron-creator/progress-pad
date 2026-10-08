"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import {
  HOME_CONTENT_SECTIONS,
  isHomeContentSection,
  useHomeSectionOrder,
  type HomeContentSectionId,
  type HomeSectionId,
} from "@/lib/home/section-order";

import { useUnsavedLeave } from "./unsaved-leave-provider";

type FlowSection = {
  id: string;
  label: string;
  icon: ReactNode;
};

const OVERVIEW_SECTION: FlowSection = {
  id: "overview",
  label: "Overview",
  icon: <CalendarBlankIcon size={12} />,
};

const CONTENT_FLOW_META: Record<HomeContentSectionId, Omit<FlowSection, "id">> = {
  triggers: { label: "Trigger List", icon: <LightningIcon size={12} /> },
  "mind-sweep": { label: "Mind Sweep", icon: <BrainIcon size={12} /> },
  "done-list": { label: "Done List", icon: <ChecksIcon size={12} /> },
  gratitude: { label: "Daily Gratitude", icon: <SparkleIcon size={12} /> },
  quotes: { label: "Impactful Quotes", icon: <QuotesIcon size={12} /> },
  journal: { label: "Let’s Journal", icon: <NoteIcon size={12} /> },
  reflections: { label: "Reflections", icon: <LightbulbIcon size={12} /> },
  pillars: { label: "Progression Pillars", icon: <ChartLineIcon size={12} /> },
};

export const FLOW_SECTIONS: FlowSection[] = [
  OVERVIEW_SECTION,
  ...HOME_CONTENT_SECTIONS.map((id) => ({ id, ...CONTENT_FLOW_META[id] })),
];

export function flowSectionsForOrder(order: readonly HomeSectionId[]): FlowSection[] {
  return [
    OVERVIEW_SECTION,
    ...order
      .filter(isHomeContentSection)
      .map((id) => ({ id, ...CONTENT_FLOW_META[id] })),
  ];
}

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
  const [sectionOrder] = useHomeSectionOrder();
  const flowSections = useMemo(() => flowSectionsForOrder(sectionOrder), [sectionOrder]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(OVERVIEW_SECTION.id);
  const selectedRef = useRef(selected);
  const pinnedIdRef = useRef<string | null>(null);
  const current = flowSections.find((item) => item.id === selected) ?? flowSections[0]!;
  selectedRef.current = selected;

  useEffect(() => {
    if (pathname !== "/home") {
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const nodes = flowSections
      .map((item) => document.getElementById(flowSectionDomId(item.id)))
      .filter((node): node is HTMLElement => node != null);
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
  }, [flowSections, pathname]);

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
    const index = flowSections.findIndex((item) => item.id === selectedRef.current);
    const next = flowSections[Math.min(flowSections.length - 1, Math.max(0, index + direction))];
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
          items={flowSections.map((item) => ({ id: item.id, label: item.label, icon: item.icon }))}
          selected={selected}
          onSelect={goTo}
          currentLabel={current.label}
          onJumpTop={() => goTo(flowSections[0]!.id)}
          onJumpBottom={() => goTo(flowSections[flowSections.length - 1]!.id)}
          onStepPrev={() => step(-1)}
          onStepNext={() => step(1)}
        />
      </div>
    </div>
  );
}
