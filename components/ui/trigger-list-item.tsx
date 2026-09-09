"use client";

import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";

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
  meta?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  checkbox?: boolean;
  leftEmoji?: boolean | ReactNode;
  status?: TriggerListStatus | false;
  onDelete?: () => void;
  draggable?: boolean;
  look?: "default" | "library";
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
  meta,
  checked = false,
  onCheckedChange,
  checkbox = true,
  leftEmoji = true,
  status = false,
  onDelete,
  draggable = false,
  look = "default",
  className,
  ...props
}: TriggerListItemProps) {
  const emoji =
    leftEmoji === false ? null : leftEmoji === true ? <DefaultEmoji /> : leftEmoji;
  const library = look === "library";
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (!draggable) {
      setFinePointer(false);
      return;
    }

    const media = window.matchMedia("(pointer: fine)");
    function update() {
      setFinePointer(media.matches);
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [draggable]);

  const nativeDrag = draggable && finePointer;

  return (
    <article
      draggable={nativeDrag}
      className={cn(
        "flex w-full items-center gap-3 overflow-hidden rounded-md",
        nativeDrag && "cursor-grab select-none active:cursor-grabbing",
        library
          ? "min-h-(--pp-trigger-item-height) border border-border bg-(--pp-grey-25) px-(--pp-space-16) py-(--pp-space-12) in-data-[theme=dark]:bg-background-subtle"
          : "border border-border bg-surface px-(--pp-space-16) py-(--pp-space-12)",
        className,
      )}
      {...props}
    >
      {checkbox ? (
        <span
          className="shrink-0"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            size="lg"
            checked={checked}
            onChange={(event) => {
              event.stopPropagation();
              onCheckedChange?.(event.currentTarget.checked);
            }}
            aria-label={title}
          />
        </span>
      ) : null}
      {emoji}
      <div className="min-w-0 flex-1">
        <Text
          variant="bodySmall"
          className="truncate font-(--pp-font-weight-medium) text-foreground"
        >
          {title}
        </Text>
        {description ? (
          <Text variant="bodySmall" className="truncate text-foreground-muted">
            {description}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" className="truncate text-foreground-muted">
            {meta}
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
        <IconButton
          label={`Delete ${title}`}
          variant="danger"
          look="clear"
          size="md"
          onClick={onDelete}
        >
          <TrashIcon />
        </IconButton>
      ) : null}
      {draggable ? (
        <span className="hidden text-foreground-muted pointer-fine:inline-flex" aria-hidden>
          <DragHandleIcon />
        </span>
      ) : null}
    </article>
  );
}
