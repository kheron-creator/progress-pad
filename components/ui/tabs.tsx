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
  fullWidth?: boolean;
  className?: string;
};

const sizeClass = {
  sm: "font-(--pp-font-weight-medium) text-(length:--pp-text-overline-size) leading-(--pp-text-overline-leading) px-3 py-1",
  md: "type-label px-3 py-1",
  lg: "type-overline h-full",
} as const;

export function Tabs({
  options,
  value,
  onChange,
  label,
  tone = "neutral",
  size = "md",
  fullWidth = false,
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "bg-(--pp-grey-25)",
        size === "lg"
          ? "h-8 max-h-8 rounded-md p-0.5 sm:h-10 sm:max-h-10 sm:p-1"
          : "rounded-sm p-0.5",
        fullWidth ? "flex w-full items-center" : "inline-flex w-fit items-center",
        className,
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
              "inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-colors",
              size === "lg" ? "rounded-md" : "rounded-sm",
              sizeClass[size],
              fullWidth ? "min-w-0 flex-1 px-1.5 sm:flex-none sm:px-4" : size === "lg" && "px-2.5 sm:px-4",
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
