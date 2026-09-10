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
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "font-(--pp-font-weight-medium) text-(length:--pp-text-overline-size) leading-(--pp-text-overline-leading) px-3 py-1",
  md: "type-label px-3 py-1",
  lg: "type-overline h-full px-4",
} as const;

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
      className={cn(
        "inline-flex bg-background-subtle",
        size === "lg"
          ? "h-10 max-h-10 items-stretch rounded-md p-1"
          : "rounded-xs p-0.5",
      )}
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
              "cursor-pointer transition-colors",
              size === "lg" ? "rounded-md" : "rounded-sm",
              sizeClass[size],
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
