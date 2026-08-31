"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { IconButton } from "./icon-button";
import { CheckIcon, TrashIcon } from "./icon";
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
  accent?: string;
  checkboxLocked?: boolean;
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
  accent,
  checkboxLocked = false,
  className,
  style,
  ...props
}: WrittenItemProps) {
  const isDone = Boolean(achieved || checked);
  const striked = variant === "striked" || isDone;
  const doneText = "font-(--pp-font-weight-semibold) text-(--pp-spring-green-600) line-through";
  const itemStyle = {
    ...(accent && !isDone ? { borderColor: accent, "--pp-item-accent": accent } : null),
    ...style,
  } as CSSProperties;

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-md border bg-surface px-(--pp-space-16) py-(--pp-space-12)",
        isDone ? "border-(--pp-spring-green-600)" : accent ? undefined : "border-border",
        className,
      )}
      style={itemStyle}
      {...props}
    >
      {checkbox ? (
        <Checkbox
          size="xl"
          tone="accent"
          checked={checked ?? achieved}
          disabled={checkboxLocked}
          onChange={
            checkboxLocked ? undefined : (event) => onCheckedChange?.(event.currentTarget.checked)
          }
          aria-label={title}
          className="size-[1.625rem]!"
          boxClassName={
            accent || isDone
              ? cn(
                  "rounded-sm text-white",
                  isDone
                    ? "border-transparent! bg-(--pp-spring-green-600)! peer-checked:border-transparent peer-checked:bg-(--pp-spring-green-600) peer-disabled:border-transparent! peer-disabled:bg-(--pp-spring-green-600)!"
                    : "border-(--pp-item-accent) peer-checked:border-transparent peer-checked:bg-(--pp-spring-green-600)",
                )
              : undefined
          }
        />
      ) : null}
      {leftIcon}
      <div className="min-w-0 flex-1">
        <Text variant="label" className={cn(striked && doneText)}>
          {title}
        </Text>
        {notes ? (
          <Text
            variant="caption"
            className={cn(striked ? doneText : "text-foreground-muted")}
          >
            {notes}
          </Text>
        ) : null}
      </div>
      {isDone ? (
        <Tag
          size="xs"
          className="border-transparent! bg-(--pp-spring-green-600)! text-white!"
          leftIcon={<CheckIcon size={8} weight="bold" />}
        >
          ACHIEVED
        </Tag>
      ) : null}
      {onDelete ? (
        <IconButton label={`Delete ${title}`} variant="danger" look="clear" size="md" onClick={onDelete}>
          <TrashIcon />
        </IconButton>
      ) : null}
    </article>
  );
}
