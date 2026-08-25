"use client";

import { useMemo, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Chip } from "./chip";
import { ChevronLeftIcon, ChevronRightIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

export type CalendarView = "week" | "month";

export type CalendarMarker = {
  dot?: boolean;
  count?: number;
  icon?: ReactNode;
};

type CalendarStripProps = {
  value: Date;
  onChange: (date: Date) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  markers?: Record<string, CalendarMarker>;
  weekStartsOn?: 0 | 1;
  className?: string;
};

const WEEKDAYS_SUN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_MON = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 0) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? 6 : day - 1) : day;
  start.setDate(start.getDate() - diff);
  return start;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarStrip({
  value,
  onChange,
  view = "week",
  onViewChange,
  markers,
  weekStartsOn = 0,
  className,
}: CalendarStripProps) {
  const selected = startOfDay(value);
  const weekdayLabels = weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN;

  const weekDays = useMemo(() => {
    const start = startOfWeek(selected, weekStartsOn);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selected, weekStartsOn]);

  const monthCells = useMemo(() => {
    const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const start = startOfWeek(first, weekStartsOn);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [selected, weekStartsOn]);

  function shift(amount: number) {
    if (view === "week") {
      onChange(addDays(selected, amount * 7));
      return;
    }
    onChange(new Date(selected.getFullYear(), selected.getMonth() + amount, selected.getDate()));
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-[64rem] flex-col gap-3 rounded-md border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <IconButton label="Previous" look="clear" size="md" onClick={() => shift(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Text variant="label">{view === "week" ? "This week" : monthLabel(selected)}</Text>
          <IconButton label="Next" look="clear" size="md" onClick={() => shift(1)}>
            <ChevronRightIcon />
          </IconButton>
        </div>
        <div className="flex items-center gap-1">
          <Chip
            size="sm"
            state={view === "week" ? "selected" : "default"}
            onClick={() => onViewChange?.("week")}
          >
            Week
          </Chip>
          <Chip
            size="sm"
            state={view === "month" ? "selected" : "default"}
            onClick={() => onViewChange?.("month")}
          >
            Month
          </Chip>
        </div>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const active = isSameDay(day, selected);
            const marker = markers?.[isoDate(day)];

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onChange(day)}
                className="flex flex-col items-center gap-1 py-1"
              >
                <Text variant="overline" className="text-foreground-muted">
                  {weekdayLabels[index]}
                </Text>
                <span className="relative inline-flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full type-label",
                      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary-muted",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {marker?.count != null ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-sm bg-primary px-0.5 text-[0.625rem] text-primary-foreground">
                      {marker.count}
                    </span>
                  ) : null}
                  {marker?.icon ? (
                    <span className="text-foreground-muted">{marker.icon}</span>
                  ) : marker?.dot ? (
                    <span className="size-1 rounded-full bg-foreground-muted" />
                  ) : (
                    <span className="size-1" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7 gap-1">
            {weekdayLabels.map((day) => (
              <Text key={day} variant="overline" className="text-center text-foreground-muted">
                {day}
              </Text>
            ))}
            {monthCells.map((day) => {
              const inMonth = day.getMonth() === selected.getMonth();
              const active = isSameDay(day, selected);
              const marker = markers?.[isoDate(day)];

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onChange(day)}
                  className="flex flex-col items-center justify-self-center gap-0.5 py-0.5"
                >
                  <span className="relative">
                    <span
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full type-label",
                        active
                          ? "bg-primary text-primary-foreground"
                          : inMonth
                            ? "text-foreground hover:bg-primary-muted"
                            : "text-foreground-disabled",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {marker?.count != null ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-sm bg-primary px-0.5 text-[0.625rem] text-primary-foreground">
                        {marker.count}
                      </span>
                    ) : null}
                  </span>
                  {marker?.icon ? (
                    <span className="text-foreground-muted">{marker.icon}</span>
                  ) : marker?.dot ? (
                    <span className="size-1 rounded-full bg-foreground-muted" />
                  ) : (
                    <span className="size-1" />
                  )}
                </button>
              );
            })}
          </div>
          <Text variant="caption" className="text-foreground-muted">
            Selected Date: {isoDate(selected)}
          </Text>
        </div>
      )}
    </div>
  );
}
