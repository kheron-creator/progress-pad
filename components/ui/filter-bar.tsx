"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Chip } from "./chip";
import { CloseIcon, PlusIcon } from "./icon";

export type FilterChip = {
  id: string;
  label: string;
  removable?: boolean;
};

type FilterBarProps = {
  filters: FilterChip[];
  onRemove?: (id: string) => void;
  onAdd?: () => void;
  addLabel?: ReactNode;
  className?: string;
};

export function FilterBar({
  filters,
  onRemove,
  onAdd,
  addLabel = "Add filter",
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex h-[3.6875rem] w-full items-center gap-2 rounded-md border border-border bg-surface px-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-hidden">
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            size="md"
            state="outlined"
            onClick={filter.removable !== false ? () => onRemove?.(filter.id) : undefined}
            rightIcon={filter.removable !== false ? <CloseIcon size={12} /> : undefined}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
      <Button size="md" look="clear" onClick={onAdd}>
        <PlusIcon size={14} />
        {addLabel}
      </Button>
    </div>
  );
}
