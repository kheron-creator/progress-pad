import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { value: "sweep", label: "Mind Sweep", href: "/active-mind-sweep" },
  { value: "micro-sprints", label: "Micro sprints", href: "/active-mind-sweep/micro-sprints" },
] as const;

export function MindSweepTabs({ current }: { current: (typeof TABS)[number]["value"] }) {
  return (
    <nav aria-label="Mind Sweep views" className="inline-flex w-fit items-center rounded-md bg-background-subtle p-1">
      {TABS.map((tab) => {
        const selected = tab.value === current;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "type-label inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 transition-colors",
              selected ? "bg-surface text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
