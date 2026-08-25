"use client";

import { cn } from "@/lib/utils/cn";

type TabOption = {
  value: string;
  label: string;
};

type TabsProps = {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
};

export function Tabs({ options, value, onChange, label }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-full bg-background-subtle p-0.5"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "type-label h-[var(--pp-chip-height-lg)] rounded-full px-3 transition-colors",
              selected
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
