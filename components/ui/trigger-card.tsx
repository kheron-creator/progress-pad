"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckIcon, DragHandleIcon, LightningIcon, PencilIcon, TrashIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Tag } from "./tag";
import { Text } from "./text";

export type TriggerCardKind = "section" | "item";
export type TriggerCardState = "todo" | "achieved" | "select";

type TriggerCardProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  kind?: TriggerCardKind;
  state?: TriggerCardState;
  showDescription?: boolean;
  status?: boolean;
  leftIcon?: boolean | ReactNode;
  leftEmoji?: boolean | ReactNode;
  tag?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  onDelete?: () => void;
};

function DefaultLeftIcon({ state }: { state: TriggerCardState }) {
  if (state === "todo") {
    return (
      <IconMark size="xs">
        <LightningIcon size={12} />
      </IconMark>
    );
  }

  return (
    <IconMark size="xs" tone="success">
      <CheckIcon size={12} weight="bold" />
    </IconMark>
  );
}

function DefaultLeftEmoji() {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center text-warning" aria-hidden>
      <PencilIcon size={14} />
    </span>
  );
}

function DefaultStatus({ state }: { state: TriggerCardState }) {
  if (state === "select") {
    return (
      <span className="text-foreground-muted" aria-hidden>
        <DragHandleIcon />
      </span>
    );
  }

  if (state === "achieved") {
    return (
      <Tag variant="primary" size="xs" leftIcon={<CheckIcon size={12} weight="bold" />}>
        ACHIEVED
      </Tag>
    );
  }

  return (
    <Tag variant="secondary" look="outline" size="xs">
      TO DO
    </Tag>
  );
}

function resolveSlot(value: boolean | ReactNode | undefined, fallback: ReactNode) {
  if (value === false) return null;
  if (value === true || value === undefined) return fallback;
  return value;
}

export function TriggerCard({
  title,
  description,
  kind = "section",
  state = "todo",
  showDescription,
  status = true,
  leftIcon,
  leftEmoji,
  tag,
  action,
  secondaryAction,
  onDelete,
  className,
  ...props
}: TriggerCardProps) {
  const isItem = kind === "item";
  const descriptionVisible =
    Boolean(description) && (showDescription ?? (isItem ? true : Boolean(description)));

  const leadingIcon = isItem
    ? resolveSlot(leftIcon, <DefaultLeftIcon state={state} />)
    : leftIcon && leftIcon !== true
      ? leftIcon
      : leftIcon === true
        ? <DefaultLeftIcon state={state} />
        : leftIcon;
  const emoji = isItem ? resolveSlot(leftEmoji, <DefaultLeftEmoji />) : leftEmoji && leftEmoji !== true ? leftEmoji : null;
  const statusSlot = isItem && status ? <DefaultStatus state={state} /> : tag;
  const deleteButton =
    isItem && state !== "select" ? (
      <IconButton label={`Delete ${title}`} variant="danger" look="clear" size="sm" onClick={onDelete}>
        <TrashIcon />
      </IconButton>
    ) : (
      action
    );

  return (
    <article
      className={cn(
        "flex w-full items-center gap-3 rounded-md border bg-surface px-3",
        isItem ? "min-h-[var(--pp-trigger-item-height)] py-2" : "py-2",
        isItem && state === "select"
          ? "border-accent"
          : isItem && state === "achieved"
            ? "border-border-success"
            : "border-border",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {emoji}
      <div className="min-w-0 flex-1">
        <Text
          variant={isItem ? "label" : "subtitle"}
          className={cn("truncate", state === "achieved" && isItem && "text-success-foreground")}
        >
          {title}
        </Text>
        {descriptionVisible ? (
          <Text variant="caption" className="truncate text-foreground-muted">
            {description}
          </Text>
        ) : null}
      </div>
      {statusSlot}
      {secondaryAction}
      {deleteButton}
    </article>
  );
}
