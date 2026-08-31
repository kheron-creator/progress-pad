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
  tone?: "neutral" | "primary";
  size?: "sm" | "md";
};

export function Tabs({
  options,
  value,
  onChange,
  label,
  tone = "neutral",
  size = "md",
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-sm bg-background-subtle p-0.5"
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
              "cursor-pointer rounded-sm px-3 py-1 transition-colors",
              size === "sm"
                ? "font-(--pp-font-weight-medium) text-(length:--pp-text-overline-size) leading-(--pp-text-overline-leading)"
                : "type-label",
              selected
                ? tone === "primary"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground shadow-sm"
                : "text-foreground hover:text-foreground",
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
