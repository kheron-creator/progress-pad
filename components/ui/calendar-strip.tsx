"use client";

import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";

import { TRIGGERS_PICK_COPY } from "@/lib/triggers/content";
import { readLibraryDragItems, type LibraryDragPayload } from "@/lib/triggers/drag";
import { cn } from "@/lib/utils/cn";

import { CalendarBlankIcon, ChevronLeftIcon, ChevronRightIcon, LightbulbIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Tabs } from "./tabs";
import { Text } from "./text";

export type CalendarView = "week" | "month";

export type CalendarAssignedItem = {
  kind: "trigger" | "scenario";
  id: string;
  name?: string;
  icon?: ReactNode;
};

export type CalendarMarker = {
  dot?: boolean;
  count?: number;
  icon?: ReactNode;
  icons?: ReactNode[];
  items?: CalendarAssignedItem[];
};

type CalendarStripProps = {
  value: Date;
  onChange: (date: Date) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  markers?: Record<string, CalendarMarker>;
  weekStartsOn?: 0 | 1;
  look?: "horizon" | "intention";
  onDropOnDate?: (date: Date, items: LibraryDragPayload[]) => void;
  selectionCount?: number;
  onDayClick?: (date: Date) => void;
  onClear?: () => void;
  className?: string;
};

const WEEKDAYS_SUN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEKDAYS_MON = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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

function addMonths(date: Date, amount: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? 6 : day - 1) : day;
  start.setDate(start.getDate() - diff);
  return start;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function weekdayShort(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function monthName(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long" });
}

export function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function assignedFromMarker(marker?: CalendarMarker): CalendarAssignedItem[] {
  if (marker?.items?.length) {
    return marker.items.filter((item) => item.icon);
  }

  return (marker?.icons ?? []).flatMap((icon, index) =>
    icon ? [{ kind: "trigger" as const, id: `icon-${index}`, icon }] : [],
  );
}

export function CalendarStrip({
  value,
  onChange,
  view = "week",
  onViewChange,
  markers,
  weekStartsOn = 1,
  look = "horizon",
  onDropOnDate,
  selectionCount = 0,
  onDayClick,
  onClear,
  className,
}: CalendarStripProps) {
  const selected = startOfDay(value);
  const today = startOfDay(new Date());
  const weekdayLabels = weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN;
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const canDrop = Boolean(onDropOnDate);
  const canAssignOnTap = canDrop && selectionCount > 0;

  useEffect(() => {
    if (!canDrop) return;

    function end() {
      setDropTarget(null);
    }

    document.addEventListener("dragend", end);
    document.addEventListener("drop", end);
    return () => {
      document.removeEventListener("dragend", end);
      document.removeEventListener("drop", end);
    };
  }, [canDrop]);

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
    if (look !== "intention" && view === "week") {
      onChange(addDays(selected, amount * 7));
      return;
    }
    onChange(addMonths(selected, amount));
  }

  function allowDateDrop(event: DragEvent<HTMLElement>, day: Date) {
    if (!canDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropTarget(isoDate(day));
  }

  function handleDateDrop(event: DragEvent<HTMLElement>, day: Date) {
    if (!canDrop || !onDropOnDate) return;
    event.preventDefault();
    setDropTarget(null);
    const items = readLibraryDragItems(event);
    if (items.length === 0) return;
    onDropOnDate(day, items);
    onChange(day);
  }

  function selectDay(day: Date) {
    onChange(day);
    onDayClick?.(day);
  }

  const monthGrid = (
    <div className="flex flex-col gap-(--pp-space-16)">
      <div className="flex items-center gap-(--pp-space-8) text-primary">
        <button
          type="button"
          aria-label="Previous month"
          className="inline-flex cursor-pointer items-center text-primary"
          onClick={() => shift(-1)}
        >
          <ChevronLeftIcon size={16} />
        </button>
        <Text
          variant="label"
          className={cn(
            "min-w-24 shrink-0 text-center text-primary",
            look === "intention" && "font-(--pp-font-weight-semibold)",
          )}
        >
          {monthLabel(selected)}
        </Text>
        <button
          type="button"
          aria-label="Next month"
          className="inline-flex cursor-pointer items-center text-primary"
          onClick={() => shift(1)}
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>
      <div
        className={cn(
          "grid grid-cols-7 gap-(--pp-space-8)",
          look === "intention" ? "max-sm:gap-2" : "max-sm:gap-1",
        )}
      >
        {weekdayLabels.map((day) => (
          <Text key={day} variant="overline" className="text-center text-foreground-muted">
            {day}
          </Text>
        ))}
        {monthCells.map((day) => {
          const inMonth = day.getMonth() === selected.getMonth();
          const active = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const marker = markers?.[isoDate(day)];

          if (look === "intention") {
            const over = dropTarget === isoDate(day);
            const assigned = assignedFromMarker(marker);

            return (
              <div
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-current={isToday ? "date" : undefined}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  selectDay(day);
                }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectDay(day);
                  }
                }}
                onDragEnter={(event) => allowDateDrop(event, day)}
                onDragOver={(event) => allowDateDrop(event, day)}
                onDrop={(event) => handleDateDrop(event, day)}
                className={cn(
                  "relative flex min-h-16 w-full cursor-pointer flex-col items-start gap-1 rounded-md p-0.5 text-left sm:min-h-14 sm:p-1 lg:min-h-16",
                  inMonth
                    ? over && canDrop
                      ? "bg-primary-muted"
                      : canAssignOnTap
                        ? "bg-background-subtle ring-1 ring-primary/30 ring-inset hover:bg-primary-muted"
                        : "bg-background-subtle hover:bg-primary-muted"
                    : "bg-transparent",
                )}
              >
                <div className="flex w-full items-center justify-between gap-0.5">
                  {isToday ? (
                    <span className="type-caption inline-flex size-5 items-center justify-center rounded-full bg-primary p-0.5 text-primary-foreground sm:size-6">
                      {day.getDate()}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "type-caption inline-flex size-5 items-center justify-center p-0.5 leading-none sm:size-6",
                        inMonth ? "text-foreground" : "text-foreground-muted",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  )}
                </div>
                {assigned.length > 0 ? (
                  <span className="grid w-full grid-cols-3 justify-items-center gap-px self-center lg:flex lg:flex-wrap lg:justify-center lg:gap-0.5">
                    {assigned.map((item) => (
                      <span key={`${item.kind}-${item.id}`} className="relative inline-flex shrink-0">
                        <span className="inline-flex size-2 items-center justify-center leading-none *:size-full *:min-h-0 *:min-w-0 *:bg-transparent *:leading-none **:text-[6px] **:leading-none lg:size-3.5 lg:overflow-hidden lg:**:text-(length:--pp-font-size-10)">
                          {item.icon}
                        </span>
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            );
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={active}
              aria-current={isToday ? "date" : undefined}
              onClick={() => onChange(day)}
              className={cn(
                "relative flex h-(--pp-control-height-md) w-full items-center justify-center rounded-md type-label max-sm:h-8",
                active
                  ? "bg-primary text-primary-foreground"
                  : inMonth
                    ? "bg-background-subtle text-foreground hover:bg-primary-muted"
                    : "bg-transparent text-foreground-muted",
              )}
            >
              {isToday && !active ? (
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {day.getDate()}
                </span>
              ) : (
                day.getDate()
              )}
            </button>
          );
        })}
      </div>
      {look === "intention" ? (
        <button
          type="button"
          className="type-label w-fit cursor-pointer text-error underline decoration-error/40 underline-offset-2"
          onClick={() => (onClear ? onClear() : onChange(startOfDay(new Date())))}
        >
          Clear calendar
        </button>
      ) : (
        <Text variant="caption" className="text-foreground-muted">
          Selected Date:{" "}
          <span className="font-(--pp-font-weight-semibold) text-secondary">{isoDate(selected)}</span>
        </Text>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-(--pp-space-16) rounded-md border border-border bg-surface p-card",
        className,
      )}
    >
      {look === "intention" ? (
        <>
          <div className="flex flex-col gap-2">
            <Text as="h2" variant="cardTitle" className="min-w-0 truncate font-(--pp-font-weight-semibold)">
              Plan with Intention
            </Text>
            <div
              className={cn(
                "flex items-center gap-2 overflow-hidden rounded-sm bg-secondary-muted py-1.5 pr-3 pl-2 text-secondary-hover",
                "border-l-[3px] border-secondary",
                selectionCount === 0 && "invisible",
              )}
              aria-hidden={selectionCount === 0}
            >
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-secondary">
                <LightbulbIcon size={12} />
              </span>
              <Text variant="caption" className="min-w-0 text-secondary-hover">
                {TRIGGERS_PICK_COPY.assignSelected(Math.max(selectionCount, 1))}
                <span className="hidden pointer-fine:inline">{TRIGGERS_PICK_COPY.assignDragHint}</span>
              </Text>
            </div>
          </div>
          {monthGrid}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-(--pp-space-8)">
              <CalendarBlankIcon size={16} className="text-foreground max-sm:hidden" />
              <Text variant="overline" className="text-foreground">
                CALENDAR
              </Text>
              <ChevronRightIcon size={12} className="shrink-0 text-foreground-muted" />
              {view === "week" ? (
                <button
                  type="button"
                  className="type-label shrink-0 cursor-pointer text-primary"
                  onClick={() => onChange(startOfDay(new Date()))}
                >
                  Today
                </button>
              ) : (
                <Text variant="label" className="min-w-0 truncate text-primary">
                  {monthLabel(selected)}
                </Text>
              )}
            </div>
            <div className="shrink-0">
              <Tabs
                label="Calendar view"
                tone="primary"
                size="sm"
                value={view}
                onChange={(next) => onViewChange?.(next as CalendarView)}
                options={[
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ]}
              />
            </div>
          </div>

          {view === "week" ? (
            <div className="flex items-center gap-(--pp-space-8) max-sm:gap-1">
              <IconButton
                label="Previous week"
                look="clear"
                size="md"
                className="max-sm:size-8 max-sm:min-h-8 max-sm:min-w-8"
                onClick={() => shift(-1)}
              >
                <ChevronLeftIcon />
              </IconButton>
              <div className="grid min-w-0 flex-1 grid-cols-7 gap-(--pp-space-8) max-sm:gap-0.5">
                {weekDays.map((day) => {
                  const active = isSameDay(day, selected);
                  const isToday = isSameDay(day, today);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      aria-pressed={active}
                      aria-current={isToday ? "date" : undefined}
                      onClick={() => onChange(day)}
                      className={cn(
                        "flex min-w-0 flex-col items-center justify-center gap-(--pp-space-4) rounded-md border px-(--pp-space-8) py-(--pp-space-12)",
                        "max-sm:gap-0.5 max-sm:border-0 max-sm:bg-transparent max-sm:px-0 max-sm:py-1",
                        active
                          ? "border-transparent bg-primary text-primary-foreground max-sm:bg-transparent"
                          : "border-border bg-surface text-foreground hover:bg-primary-muted max-sm:hover:bg-transparent",
                      )}
                    >
                      <Text
                        variant="overline"
                        className={cn(
                          "truncate text-center",
                          active
                            ? "text-primary-foreground max-sm:text-foreground-muted"
                            : "text-foreground-muted",
                        )}
                      >
                        {weekdayShort(day)}
                      </Text>
                      <span
                        className={cn(
                          "type-section-title leading-none",
                          "max-sm:inline-flex max-sm:size-8 max-sm:items-center max-sm:justify-center max-sm:rounded-full max-sm:text-(length:--pp-font-size-16)",
                          active
                            ? "inline-flex size-9 items-center justify-center rounded-full max-sm:size-7 text-primary-foreground max-sm:bg-primary max-sm:text-primary-foreground"
                            : isToday
                              ? "inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground max-sm:size-7"
                              : "inline-flex size-9 items-center justify-center rounded-full text-foreground max-sm:size-7",
                        )}
                      >
                        {day.getDate()}
                      </span>
                      <Text
                        variant="label"
                        className={cn(
                          "max-sm:hidden",
                          active ? "text-primary-foreground" : "text-foreground-muted",
                        )}
                      >
                        {monthName(day)}
                      </Text>
                    </button>
                  );
                })}
              </div>
              <IconButton
                label="Next week"
                look="clear"
                size="md"
                className="max-sm:size-8 max-sm:min-h-8 max-sm:min-w-8"
                onClick={() => shift(1)}
              >
                <ChevronRightIcon />
              </IconButton>
            </div>
          ) : (
            monthGrid
          )}
        </>
      )}
    </div>
  );
}
