"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { CloseIcon, LightningIcon, SearchIcon } from "./icon";
import { IconMark } from "./icon-mark";
import { Input } from "./input";
import { Text } from "./text";

export type FlowNavItem = {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type FlowNavigatorProps = {
  items?: FlowNavItem[];
  selected?: string;
  onSelect?: (id: string) => void;
  query?: string;
  onQueryChange?: (value: string) => void;
  view?: "templates" | "library";
  onViewChange?: (view: "templates" | "library") => void;
  onClose?: () => void;
  onSave?: () => void;
  className?: string;
};

export function FlowNavigator({
  items = [],
  selected,
  onSelect,
  query,
  onQueryChange,
  view = "templates",
  onViewChange,
  onClose,
  onSave,
  className,
}: FlowNavigatorProps) {
  return (
    <aside
      className={cn(
        "flex w-full max-w-[22.125rem] flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between bg-accent px-4 py-3 text-accent-foreground">
        <Text variant="label" className="tracking-wide text-inherit">
          FLOW NAVIGATOR
        </Text>
        <button
          type="button"
          aria-label="Close"
          className="inline-flex size-8 items-center justify-center rounded-sm text-inherit"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <Input
          placeholder="Search"
          value={query}
          onChange={(event) => onQueryChange?.(event.currentTarget.value)}
          leftIcon={<SearchIcon />}
        />
        <div className="grid grid-cols-2 gap-2">
          {(["templates", "library"] as const).map((option) => {
            const active = option === view;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onViewChange?.(option)}
                className={cn(
                  "type-label h-9 rounded-full",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary bg-surface text-primary",
                )}
              >
                {option === "templates" ? "Templates" : "Create new"}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const isSelected = item.id === selected;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item.id)}
                className={cn(
                  "flex h-[3.125rem] w-full items-center gap-3 rounded-md px-3 text-left",
                  isSelected ? "bg-accent-muted" : "hover:bg-background-subtle",
                )}
              >
                {item.icon ?? (
                  <IconMark size="xs">
                    <LightningIcon size={12} />
                  </IconMark>
                )}
                <Text variant="label" className="min-w-0 flex-1 truncate">
                  {item.label}
                </Text>
                {item.count != null ? (
                  <Text variant="caption" className="text-foreground-muted">
                    {item.count}
                  </Text>
                ) : null}
              </button>
            );
          })}
        </div>
        <Button fullWidth onClick={onSave}>
          Save
        </Button>
      </div>
    </aside>
  );
}
