"use client";

import { cloneElement, isValidElement, useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  CloseIcon,
  CompassIcon,
} from "./icon";
import { Text } from "./text";

export type FlowNavItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type FlowNavigatorProps = {
  items?: FlowNavItem[];
  selected?: string;
  onSelect?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onJumpTop?: () => void;
  onJumpBottom?: () => void;
  onStepPrev?: () => void;
  onStepNext?: () => void;
  currentLabel?: string;
  className?: string;
};

function itemIcon(icon: ReactNode) {
  return isValidElement(icon) ? cloneElement(icon) : icon;
}

function GoToPill({
  label,
  items,
  onClick,
  className,
}: {
  label: string;
  items: FlowNavItem[];
  onClick?: () => void;
  className?: string;
}) {
  const options = items.length > 0 ? items : [{ id: label, label }];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-8 items-center justify-items-center rounded-full bg-surface px-4 text-accent-text",
        className,
      )}
    >
      {options.map((item) => (
        <span
          key={item.id}
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-accent-text",
            item.label === label ? "visible" : "invisible",
          )}
        >
          {item.icon ? (
            <span className="inline-flex size-4 shrink-0 items-center justify-center text-accent-text">
              {itemIcon(item.icon)}
            </span>
          ) : null}
          <span className="type-caption text-accent-text">
            <span className="font-medium">{item.label}</span>
          </span>
        </span>
      ))}
    </button>
  );
}

export function FlowNavigator({
  items = [],
  selected,
  onSelect,
  open = false,
  onOpenChange,
  onJumpTop,
  onJumpBottom,
  onStepPrev,
  onStepNext,
  currentLabel = "Overview",
  className,
}: FlowNavigatorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange?.(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onOpenChange]);

  const bar = (
    <div className="inline-flex h-11 w-max max-w-full shrink-0 items-center self-start rounded-full bg-accent p-1 text-accent-foreground shadow-md">
      <button
        type="button"
        aria-label="Previous section"
        className="grid size-7 shrink-0 place-items-center rounded-full text-inherit"
        onClick={onStepPrev}
      >
        <ArrowUpIcon size={14} />
      </button>
      <GoToPill
        label={currentLabel}
        items={items}
        onClick={() => onOpenChange?.(!open)}
      />
      <button
        type="button"
        aria-label="Next section"
        className="grid size-7 shrink-0 place-items-center rounded-full text-inherit"
        onClick={onStepNext}
      >
        <ArrowDownIcon size={14} />
      </button>
    </div>
  );

  const shell = cn(
    "w-max max-w-[calc(100vw-2rem)] [&_button]:outline-none [&_button]:focus-visible:outline-none",
    className,
  );

  if (!open) {
    return (
      <div ref={rootRef} className={shell}>
        {bar}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-1.5", shell)}>
      <aside className="flex w-max max-w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-md">
        <div className="flex items-start gap-2 bg-accent px-4 py-3 text-accent-foreground">
          <span className="mt-px grid size-7 shrink-0 place-items-center rounded-full border border-white/80">
            <CompassIcon size={12} />
          </span>
          <div className="min-w-0 flex-1">
            <Text variant="caption" className="tracking-wide text-inherit uppercase">
              Flow Navigator
            </Text>
            <Text variant="caption" className="text-inherit opacity-90">
              Jump to any section instantly
            </Text>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-inherit"
            onClick={() => onOpenChange?.(false)}
          >
            <CloseIcon size={12} />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-3 py-2">
          <div className="grid grid-cols-2 gap-1.5 py-1">
            <button
              type="button"
              className="type-caption inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-primary-foreground"
              onClick={onJumpTop}
            >
              <ArrowUpIcon size={12} />
              Jump to Top
            </button>
            <button
              type="button"
              className="type-caption inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-primary-foreground"
              onClick={onJumpBottom}
            >
              <ArrowDownIcon size={12} />
              Jump to Bottom
            </button>
          </div>

          <div className="flex max-h-52 min-h-0 flex-col gap-1 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, index) => {
              const isSelected = item.id === selected;
              const number = String(index + 1).padStart(2, "0");

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  className={cn(
                    "flex min-h-8 w-full items-center gap-2 rounded-xl px-2 py-1 text-left",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-background-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-md",
                      isSelected ? "bg-surface text-accent-text" : "bg-accent text-accent-foreground",
                    )}
                  >
                    {item.icon}
                  </span>
                  <Text as="span" variant="caption" className="min-w-0 flex-1 truncate text-inherit">
                    {item.label}
                  </Text>
                  <span
                    className={cn(
                      "type-caption inline-flex shrink-0 items-center gap-px tabular-nums",
                      isSelected ? "text-inherit" : "text-foreground-secondary",
                    )}
                  >
                    {number}
                    {isSelected ? <ChevronRightIcon size={10} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      {bar}
    </div>
  );
}
