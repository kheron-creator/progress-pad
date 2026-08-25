"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { DragHandleIcon, PencilIcon, TrashIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Tag } from "./tag";
import { Text } from "./text";

export type TriggerListStatus = "active" | "inactive";

type TriggerListItemProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  checkbox?: boolean;
  leftEmoji?: boolean | ReactNode;
  status?: TriggerListStatus | false;
  onDelete?: () => void;
  draggable?: boolean;
};

function DefaultEmoji() {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center text-warning" aria-hidden>
      <PencilIcon size={14} />
    </span>
  );
}

export function TriggerListItem({
  title,
  description,
  checked = false,
  onCheckedChange,
  checkbox = true,
  leftEmoji = true,
  status = false,
  onDelete,
  draggable = false,
  className,
  ...props
}: TriggerListItemProps) {
  const emoji =
    leftEmoji === false ? null : leftEmoji === true ? <DefaultEmoji /> : leftEmoji;

  return (
    <article
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-border bg-surface px-3 py-2",
        className,
      )}
      {...props}
    >
      {checkbox ? (
        <Checkbox
          size="xs"
          checked={checked}
          onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
          aria-label={title}
        />
      ) : null}
      {emoji}
      <div className="min-w-0 flex-1">
        <Text variant="label" className="truncate">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" className="truncate text-foreground-muted">
            {description}
          </Text>
        ) : null}
      </div>
      {status === "inactive" ? (
        <Tag variant="error" look="outline" size="xs">
          Inactive
        </Tag>
      ) : null}
      {status === "active" ? (
        <Tag variant="primary" size="xs">
          Active
        </Tag>
      ) : null}
      {onDelete ? (
        <IconButton label={`Delete ${title}`} variant="danger" look="clear" size="sm" onClick={onDelete}>
          <TrashIcon />
        </IconButton>
      ) : null}
      {draggable ? (
        <span className="text-foreground-muted" aria-hidden>
          <DragHandleIcon />
        </span>
      ) : null}
    </article>
  );
}
