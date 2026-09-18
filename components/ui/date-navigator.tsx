"use client";

import { cn } from "@/lib/utils/cn";

import {
  DatePicker,
  formatIsoDate,
  isSameDay,
  parseIsoDate,
  startOfDay,
} from "./date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "./icon";

type DateNavigatorProps = {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
};

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function navLabel(date: Date, today: Date) {
  if (isSameDay(date, today)) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DateNavigator({ value, onChange, className }: DateNavigatorProps) {
  const today = startOfDay(new Date());
  const selected = startOfDay(value);
  const label = navLabel(selected, today);

  return (
    <div
      className={cn(
        "inline-flex h-11 w-max max-w-full shrink-0 items-center rounded-full bg-accent p-1 text-accent-foreground shadow-md",
        "[&_button]:outline-none [&_button]:focus-visible:outline-none",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Previous day"
        className="grid size-7 shrink-0 place-items-center rounded-full text-inherit"
        onClick={() => onChange(addDays(selected, -1))}
      >
        <ChevronLeftIcon size={14} />
      </button>
      <DatePicker
        variant="chip"
        showLabel={false}
        value={formatIsoDate(selected)}
        displayLabel={label}
        onChange={(next) => {
          const parsed = parseIsoDate(next);
          if (parsed) {
            onChange(parsed);
          }
        }}
        className={cn(
          "shrink-0 text-foreground",
          "[&>button]:h-8 [&>button]:gap-1.5 [&>button]:rounded-full [&>button]:border-transparent",
          "[&>button]:bg-surface [&>button]:px-4 [&>button]:text-accent-text [&>button]:shadow-none",
          "[&>button]:hover:bg-surface",
        )}
        aria-label={`Change date, currently ${label}`}
      />
      <button
        type="button"
        aria-label="Next day"
        className="grid size-7 shrink-0 place-items-center rounded-full text-inherit"
        onClick={() => onChange(addDays(selected, 1))}
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
}
