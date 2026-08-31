"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { ChartLineIcon, ChevronDownIcon, MicrophoneIcon } from "./icon";
import { IconMark } from "./icon-mark";
import { Input } from "./input";
import { Text } from "./text";

type PillarRowProps = {
  title: string;
  description?: string;
  placeholder?: string;
  icon?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  notes?: string;
  onNotesChange?: (value: string) => void;
  max?: number;
  accent?: string;
  className?: string;
};

export function PillarRow({
  title,
  description,
  placeholder,
  icon,
  value,
  onChange,
  notes = "",
  onNotesChange,
  max = 10,
  accent = "var(--pp-magenta-400)",
  className,
}: PillarRowProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const scaleId = useId();
  const numbers = Array.from({ length: max }, (_, index) => index + 1);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <article
      ref={rootRef}
      className={cn(
        "flex w-full flex-col gap-(--pp-space-16) rounded-md border border-border bg-surface p-(--pp-space-16)",
        className,
      )}
    >
      <div className="flex flex-col gap-(--pp-space-16) lg:flex-row lg:items-center">
        <div className="flex w-full min-w-0 items-center justify-between gap-(--pp-space-16) lg:contents">
          <div className="flex min-w-0 flex-1 items-center gap-(--pp-space-16) lg:w-72 lg:flex-none lg:shrink-0">
            {icon ?? (
              <IconMark size="sm" tone="accent">
                <ChartLineIcon />
              </IconMark>
            )}
            <div className="min-w-0 flex-1">
              <Text variant="label">{title}</Text>
              {description ? (
                <Text variant="caption" className="text-(--pp-spring-green-600)">
                  {description}
                </Text>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={scaleId}
            aria-label={`${title} rating`}
            className="inline-flex h-auto min-h-0 w-auto shrink-0 cursor-pointer items-center gap-(--pp-space-4) rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-50) px-(--pp-space-16) py-(--pp-space-4) text-(length:--pp-font-size-12) font-(--pp-font-weight-semibold) leading-none text-(--pp-bondi-blue-600)"
            onClick={() => setOpen((current) => !current)}
          >
            {value}/{max}
            <ChevronDownIcon size={12} className={cn("transition-transform", open && "rotate-180")} />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-(--pp-space-16)">
          <div className="min-w-0 flex-1">
            <Input
              value={notes}
              onChange={(event) => onNotesChange?.(event.currentTarget.value)}
              placeholder={placeholder}
              aria-label={placeholder ?? `${title} context`}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            look="icon"
            size="md"
            aria-label={`Dictate ${title} context`}
            style={{ borderColor: accent, color: accent }}
          >
            <MicrophoneIcon size={20} />
          </Button>
        </div>
      </div>
      {open ? (
        <div
          id={scaleId}
          role="radiogroup"
          aria-label={`${title} rating scale`}
          className="flex w-full gap-(--pp-space-8)"
        >
          {numbers.map((number) => {
            const selected = number === value;

            return (
              <button
                key={number}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "type-label flex h-(--pp-control-height-md) min-w-0 flex-1 cursor-pointer items-center justify-center rounded-sm",
                  selected
                    ? "bg-(--pp-bondi-blue-600) text-white"
                    : "bg-background-subtle text-foreground",
                )}
                onClick={() => onChange(number)}
              >
                {number}
              </button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
