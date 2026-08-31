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
  if (state === "achieved") {
    return (
      <IconMark size="sm" className="bg-(--pp-spring-green-600)! text-white">
        <CheckIcon weight="bold" />
      </IconMark>
    );
  }

  return (
    <IconMark size="sm" tone="surface" className="text-(--pp-magenta-500)!">
      <LightningIcon />
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
      <Tag
        size="xs"
        className="border-transparent! bg-(--pp-spring-green-600)! text-white!"
        leftIcon={<CheckIcon size={8} weight="bold" />}
      >
        ACHIEVED
      </Tag>
    );
  }

  return (
    <Tag variant="secondary" look="outline" size="xs" className="bg-surface!">
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
      <IconButton
        label={`Delete ${title}`}
        variant="danger"
        look="clear"
        size="md"
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.();
        }}
      >
        <TrashIcon />
      </IconButton>
    ) : (
      action
    );

  const Comp = isItem ? "article" : "header";

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-3",
        isItem
          ? cn(
            "min-h-(--pp-trigger-item-height) rounded-md border bg-(--pp-grey-25) px-(--pp-space-16) py-(--pp-space-12) in-data-[theme=dark]:bg-background-subtle",
            state === "select"
              ? "border-accent"
              : state === "achieved"
                ? "border-(--pp-spring-green-600)"
                : "border-border",
          )
          : "py-2",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {emoji}
      <div className="min-w-0 flex-1">
        <Text
          as={isItem ? undefined : "h4"}
          variant={isItem ? "bodySmall" : "cardTitle"}
          className={cn(
            "truncate",
            isItem
              ? state === "achieved"
                ? "font-(--pp-font-weight-semibold) text-(--pp-spring-green-600) line-through"
                : "font-(--pp-font-weight-medium) text-foreground"
              : "font-(--pp-font-weight-semibold)",
          )}
        >
          {title}
        </Text>
        {descriptionVisible ? (
          <Text
            variant={isItem ? "caption" : "bodySmall"}
            className="truncate text-foreground-muted"
          >
            {description}
          </Text>
        ) : null}
      </div>
      {statusSlot ? <div className="shrink-0">{statusSlot}</div> : null}
      {secondaryAction}
      {deleteButton}
    </Comp>
  );
}
