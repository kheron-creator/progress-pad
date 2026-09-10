"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { Chip } from "./chip";
import { Field, FieldLabel, fieldPaddingClass, fieldSizeClass, fieldStateClass } from "./field";
import { CalendarBlankIcon, ChevronLeftIcon, ChevronRightIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

type DatePickerProps = {
  showLabel?: boolean;
  open?: boolean;
  label?: string;
  value?: string;
  displayLabel?: string;
  variant?: "field" | "chip";
  onChange?: (value: string) => void;
  className?: string;
};

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

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

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

function monthCells(view: Date) {
  const start = startOfWeek(new Date(view.getFullYear(), view.getMonth(), 1));
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

function displayDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePicker({
  showLabel = true,
  open,
  label = "Date",
  value,
  displayLabel,
  variant = "field",
  onChange,
  className,
}: DatePickerProps) {
  const buttonId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  const selected = parseIsoDate(value);
  const [internalOpen, setInternalOpen] = useState(false);
  const [placement, setPlacement] = useState<"below" | "above">("below");
  const [view, setView] = useState(() =>
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const isControlled = open !== undefined;
  const isOpen = open ?? internalOpen;
  const days = useMemo(() => monthCells(view), [view]);
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      rows.push(days.slice(index, index + 7));
    }
    return rows;
  }, [days]);

  function setOpenState(next: boolean) {
    if (!isControlled) setInternalOpen(next);
  }

  useEffect(() => {
    if (!isOpen || isControlled) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setInternalOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, isControlled]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement("below");
      return;
    }

    function updatePlacement() {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel) {
        return;
      }

      const rect = root.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const needs = panelHeight + gap;
      const fitsBelow = spaceBelow >= needs;
      const fitsAbove = spaceAbove >= needs;

      setPlacement(!fitsBelow && (fitsAbove || spaceAbove > spaceBelow) ? "above" : "below");
    }

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isOpen]);

  function selectDay(day: Date) {
    onChange?.(formatIsoDate(day));
    setView(new Date(day.getFullYear(), day.getMonth(), 1));
    setOpenState(false);
  }

  function shiftMonth(amount: number) {
    setView((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  const triggerLabel = displayLabel ?? (selected ? displayDate(selected) : "Select a date");
  const calendar = isOpen ? (
    <div
      ref={panelRef}
      className={cn(
        "absolute z-30 overflow-hidden rounded-md border border-border bg-surface shadow-md",
        variant === "chip" ? "right-0 w-64" : "left-0 w-full",
        placement === "above" ? "bottom-full mb-2" : "top-full mt-2",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <Text variant="overline" className="text-foreground-muted">
          {monthLabel(view)}
        </Text>
        <div className="flex items-center">
          <IconButton look="clear" size="sm" label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeftIcon size={16} />
          </IconButton>
          <IconButton look="clear" size="sm" label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRightIcon size={16} />
          </IconButton>
        </div>
      </div>
      <div className="flex w-full px-1.5 pb-1">
        {WEEKDAYS.map((day) => (
          <span key={day} className="flex min-w-0 flex-1 items-center justify-center">
            <Text variant="overline" className="text-foreground-muted">
              {day}
            </Text>
          </span>
        ))}
      </div>
      <div className="select-none pb-1.5" role="listbox" aria-label="Choose a date">
        {weeks.map((week) => (
          <div
            key={week[0] ? formatIsoDate(week[0]) : week.map((day) => day.getDate()).join("-")}
            className="flex w-full px-1.5 py-0.5"
          >
            {week.map((day) => {
              const inMonth = day.getMonth() === view.getMonth();
              const active = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={formatIsoDate(day)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "inline-flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-sm border border-transparent type-label hover:bg-background-subtle",
                    !inMonth && "text-foreground-muted",
                    active && "border-border-focus bg-background-subtle",
                    isToday && !active && "text-primary",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex min-h-9 items-center justify-between gap-2 bg-background-subtle px-3 py-1.5">
        <Text variant="caption" className="truncate text-foreground-muted">
          {selected ? displayDate(selected) : "Pick a date"}
        </Text>
        <button
          type="button"
          className="type-label shrink-0 cursor-pointer text-primary"
          onClick={() => selectDay(today)}
        >
          Today
        </button>
      </div>
    </div>
  ) : null;

  if (variant === "chip") {
    return (
      <div ref={rootRef} className={cn("relative w-fit shrink-0", className)}>
        <Chip
          id={buttonId}
          size="sm"
          state="outlined"
          leftIcon={<CalendarBlankIcon size={12} />}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close calendar" : `Change date, currently ${triggerLabel}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpenState(!isOpen);
          }}
        >
          {triggerLabel}
        </Chip>
        {calendar}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative flex min-w-0 flex-col gap-2", className ?? "w-full")}>
      <Field>
        {showLabel && label ? <FieldLabel htmlFor={buttonId}>{label}</FieldLabel> : null}
        <div className="relative">
          <div
            className={cn(
              "type-body pp-control flex w-full items-center text-left",
              fieldPaddingClass.md,
              fieldSizeClass.md,
              fieldStateClass.default,
              "pr-9",
            )}
          >
            {triggerLabel}
          </div>
          <IconButton
            id={buttonId}
            look="clear"
            size="sm"
            label={isOpen ? "Close calendar" : "Open calendar"}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={() => setOpenState(!isOpen)}
          >
            <CalendarBlankIcon />
          </IconButton>
        </div>
      </Field>
      {calendar}
    </div>
  );
}
