"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { IconButton } from "./icon-button";
import { TrashIcon } from "./icon";
import { Tag } from "./tag";
import { Text } from "./text";

export type WrittenItemVariant = "default" | "striked";

type WrittenItemProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: string;
  notes?: string;
  variant?: WrittenItemVariant;
  leftIcon?: ReactNode;
  achieved?: boolean;
  checkbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onDelete?: () => void;
};

export function WrittenItem({
  title,
  notes,
  variant = "default",
  leftIcon,
  achieved = false,
  checkbox = true,
  checked,
  onCheckedChange,
  onDelete,
  className,
  ...props
}: WrittenItemProps) {
  const striked = variant === "striked";

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2",
        className,
      )}
      {...props}
    >
      {checkbox ? (
        <Checkbox
          size="xs"
          tone="accent"
          checked={checked}
          onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
          aria-label={title}
        />
      ) : null}
      {leftIcon}
      <div className="min-w-0 flex-1">
        <Text
          variant="label"
          className={cn(striked && "text-success-foreground line-through")}
        >
          {title}
        </Text>
        {notes ? (
          <Text
            variant="caption"
            className={cn(striked ? "text-success-foreground line-through" : "text-foreground-muted")}
          >
            {notes}
          </Text>
        ) : null}
      </div>
      {achieved ? (
        <Tag variant="primary" size="xs">
          Achieved
        </Tag>
      ) : null}
      {onDelete ? (
        <IconButton label={`Delete ${title}`} variant="danger" look="clear" size="sm" onClick={onDelete}>
          <TrashIcon />
        </IconButton>
      ) : null}
    </article>
  );
}
