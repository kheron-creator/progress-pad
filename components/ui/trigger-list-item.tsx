"use client";

import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { DragHandleIcon, PencilIcon, PlusIcon, TrashIcon } from "./icon";
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
  onAdd?: () => void;
  adding?: boolean;
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
  onAdd,
  adding = false,
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
        "flex w-full items-center rounded-md",
        library ? "gap-3 self-start" : "gap-3",
        nativeDrag && "cursor-grab select-none active:cursor-grabbing",
        library
          ? "min-h-(--pp-trigger-item-height) border border-border bg-(--pp-grey-25) px-(--pp-space-12) py-(--pp-space-8) in-data-[theme=dark]:bg-background-subtle"
          : "border border-border bg-surface px-(--pp-space-16) py-(--pp-space-12)",
        className,
      )}
      {...props}
    >
      {checkbox ? (
        <span
          className={cn("inline-flex shrink-0 items-center justify-center", library && "size-5")}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            size={library ? "md" : "lg"}
            checked={checked}
            onChange={(event) => {
              event.stopPropagation();
              onCheckedChange?.(event.currentTarget.checked);
            }}
            aria-label={title}
          />
        </span>
      ) : null}
      {emoji ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center",
            library &&
            "size-5 [&>span]:size-5 [&>span]:[&_svg]:size-(--pp-font-size-10) [&_span[aria-hidden]]:text-(length:--pp-font-size-12) [&_span[aria-hidden]]:leading-none",
          )}
        >
          {emoji}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <Text
          variant={library ? "caption" : "bodySmall"}
          className="wrap-break-word whitespace-pre-wrap font-(--pp-font-weight-medium) text-foreground"
        >
          {title}
        </Text>
        {description ? (
          <Text
            variant={library ? "caption" : "bodySmall"}
            className="wrap-break-word whitespace-pre-wrap text-foreground-muted"
          >
            {description}
          </Text>
        ) : null}
        {meta ? (
          <Text
            variant={library ? "status" : "caption"}
            className="wrap-break-word whitespace-pre-wrap text-foreground-muted"
          >
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
      {onAdd ? (
        <IconButton
          label={`Add ${title} to your library`}
          look="clear"
          size={library ? "sm" : "md"}
          className="shrink-0"
          loading={adding}
          disabled={adding}
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
        >
          <PlusIcon size={library ? 14 : undefined} />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          label={`Delete ${title}`}
          variant="danger"
          look="clear"
          size={library ? "sm" : "md"}
          className="shrink-0"
          onClick={onDelete}
        >
          <TrashIcon size={library ? 14 : undefined} />
        </IconButton>
      ) : null}
      {draggable ? (
        <span className="hidden text-foreground-muted pointer-fine:inline-flex" aria-hidden>
          <DragHandleIcon size={library ? 14 : undefined} />
        </span>
      ) : null}
    </article>
  );
}
