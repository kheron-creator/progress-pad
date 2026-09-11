"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import {
  WEEKDAYS,
  displayDate,
  formatIsoDate,
  isSameDay,
  monthCells,
  monthLabel,
  parseIsoDate,
  startOfDay,
} from "./date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

type DateRange = {
  from: string;
  to: string;
};

type DateRangePickerProps = {
  from: string;
  to: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (range: DateRange) => void;
};

function compareIso(a: string, b: string) {
  return a.localeCompare(b);
}

function orderedRange(from: string, to: string) {
  return compareIso(from, to) <= 0 ? { from, to } : { from: to, to: from };
}

function monthView(from: string, fallback: Date) {
  const parsed = parseIsoDate(from);
  const source = parsed ?? fallback;
  return new Date(source.getFullYear(), source.getMonth(), 1);
}

function shortMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

function MonthGrid({
  view,
  today,
  start,
  end,
  leading,
  trailing,
  onPick,
  onHover,
}: {
  view: Date;
  today: Date;
  start: Date | null;
  end: Date | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPick: (day: Date) => void;
  onHover: (day: Date | null) => void;
}) {
  const days = useMemo(() => monthCells(view), [view]);
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      rows.push(days.slice(index, index + 7));
    }
    return rows;
  }, [days]);
  const startTime = start?.getTime() ?? null;
  const endTime = end?.getTime() ?? null;

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-0.5 pb-1 sm:pb-2">
        {leading ?? <span className="size-7 shrink-0" />}
        <Text variant="overline" className="min-w-0 flex-1 px-0.5 text-center text-foreground-muted sm:px-1">
          <span className="sm:hidden">{shortMonthLabel(view)}</span>
          <span className="hidden sm:inline">{monthLabel(view)}</span>
        </Text>
        {trailing ?? <span className="size-7 shrink-0" />}
      </div>
      <div className="flex w-full pb-0.5 sm:pb-1">
        {WEEKDAYS.map((day) => (
          <span key={day} className="flex min-w-0 flex-1 items-center justify-center">
            <Text variant="overline" className="text-foreground-muted">
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day}</span>
            </Text>
          </span>
        ))}
      </div>
      <div className="select-none" role="listbox" aria-label={monthLabel(view)}>
        {weeks.map((week) => (
          <div
            key={week[0] ? formatIsoDate(week[0]) : week.map((day) => day.getDate()).join("-")}
            className="flex w-full"
          >
            {week.map((day) => {
              const inMonth = day.getMonth() === view.getMonth();
              const time = startOfDay(day).getTime();
              const isStart = startTime != null && time === startTime;
              const isEnd = endTime != null && time === endTime;
              const inRange =
                startTime != null &&
                endTime != null &&
                time >= Math.min(startTime, endTime) &&
                time <= Math.max(startTime, endTime);
              const isToday = isSameDay(day, today);
              const roundedStart = inRange && isStart;
              const roundedEnd = inRange && isEnd;

              return (
                <div
                  key={formatIsoDate(day)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-center py-px sm:py-0.5",
                    inRange && "bg-primary-muted",
                    roundedStart && "rounded-l-full",
                    roundedEnd && "rounded-r-full",
                  )}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isStart || isEnd}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => onPick(day)}
                    onMouseEnter={() => onHover(day)}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      "inline-flex size-6 cursor-pointer items-center justify-center rounded-full type-overline sm:size-8 sm:text-(length:--pp-text-label-size) sm:leading-(--pp-text-label-leading)",
                      !inMonth && "text-foreground-muted",
                      (isStart || isEnd) && "bg-primary text-primary-foreground",
                      isToday && !isStart && !isEnd && "text-primary",
                      !isStart && !isEnd && "hover:bg-background-subtle",
                    )}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateRangePicker({ from, to, open, onOpenChange, onApply }: DateRangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState(() => monthView(from, today));
  const [placement, setPlacement] = useState<"below" | "above">("below");

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraftFrom(from);
    setDraftTo(to);
    setHover(null);
    setView(monthView(from, today));
  }, [from, open, to]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const panel = rootRef.current;
      const anchor = panel?.parentElement;
      if (!anchor?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onOpenChange, open]);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement("below");
      return;
    }

    function updatePlacement() {
      const panel = rootRef.current;
      if (!panel?.parentElement) {
        return;
      }
      const rect = panel.parentElement.getBoundingClientRect();
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
  }, [open]);

  const previewTo = draftFrom && !draftTo && hover ? hover : draftTo;
  const preview = draftFrom && previewTo ? orderedRange(draftFrom, previewTo) : null;
  const start = preview ? parseIsoDate(preview.from) : parseIsoDate(draftFrom);
  const end = preview ? parseIsoDate(preview.to) : null;
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const canApply = Boolean(draftFrom && draftTo);

  function pick(day: Date) {
    const iso = formatIsoDate(day);
    if (!draftFrom || draftTo) {
      setDraftFrom(iso);
      setDraftTo("");
      setHover(null);
      return;
    }
    const next = orderedRange(draftFrom, iso);
    setDraftFrom(next.from);
    setDraftTo(next.to);
    setHover(null);
  }

  function clear() {
    setDraftFrom("");
    setDraftTo("");
    setHover(null);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "absolute z-30 w-[min(calc(100vw-2rem),40rem)] overflow-hidden rounded-md border border-border bg-surface shadow-md",
        "right-0 max-md:left-0 max-md:right-0 max-md:w-auto",
        placement === "above" ? "bottom-full mb-2" : "top-full mt-2",
      )}
    >
      <div className="grid grid-cols-2 gap-2 px-2 py-1.5 sm:gap-6 sm:px-3 sm:py-2">
        <MonthGrid
          view={view}
          today={today}
          start={start}
          end={end}
          leading={
            <IconButton
              look="clear"
              size="sm"
              label="Previous month"
              onClick={() => setView((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              <ChevronLeftIcon size={16} />
            </IconButton>
          }
          onPick={pick}
          onHover={(day) => setHover(day ? formatIsoDate(day) : null)}
        />
        <MonthGrid
          view={nextMonth}
          today={today}
          start={start}
          end={end}
          trailing={
            <IconButton
              look="clear"
              size="sm"
              label="Next month"
              onClick={() => setView((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              <ChevronRightIcon size={16} />
            </IconButton>
          }
          onPick={pick}
          onHover={(day) => setHover(day ? formatIsoDate(day) : null)}
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-border bg-background-subtle px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Text variant="label">Start</Text>
          <span className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-2 py-1 sm:px-3 sm:py-1.5">
            <Text variant="caption" className="truncate">
              {draftFrom ? displayDate(parseIsoDate(draftFrom) ?? today) : "Select"}
            </Text>
          </span>
          <Text variant="label">End</Text>
          <span className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-2 py-1 sm:px-3 sm:py-1.5">
            <Text variant="caption" className="truncate">
              {draftTo ? displayDate(parseIsoDate(draftTo) ?? today) : "Select"}
            </Text>
          </span>
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <Button size="sm" look="outline" onClick={clear}>
            Clear
          </Button>
          <Button
            size="sm"
            disabled={!canApply}
            onClick={() => {
              if (!draftFrom || !draftTo) {
                return;
              }
              onApply(orderedRange(draftFrom, draftTo));
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
