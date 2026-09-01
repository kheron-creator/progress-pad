"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { IconMark } from "./icon-mark";
import { PencilIcon } from "./icon";
import { Text } from "./text";

export type ChoiceItemSize = "sm" | "lg";

type ChoiceItemProps = {
  label: string;
  selected?: boolean;
  size?: ChoiceItemSize;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const sizeClass: Record<ChoiceItemSize, string> = {
  sm: "min-h-12 w-full px-3 py-3 sm:max-w-[420px] sm:px-4 sm:py-4",
  lg: "min-h-14 w-full px-3 py-2.5 sm:min-h-[72px] sm:max-w-[420px] sm:px-4 sm:py-4",
};

export function ChoiceItem({
  label,
  selected = false,
  size = "lg",
  icon,
  disabled = false,
  className,
  onClick,
}: ChoiceItemProps) {
  const iconSize = size === "sm" ? 14 : 20;

  return (
    <label
      className={cn(
        "flex items-center gap-(--pp-space-16) rounded-sm border text-left",
        sizeClass[size],
        selected
          ? "border-(--pp-spring-green-600) bg-primary-muted"
          : "border-border bg-background-subtle",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <IconMark
        size="sm"
        shape="square"
        tone="surface"
        className={cn(
          "shrink-0 text-(--pp-spring-green-600) [&_svg]:size-3.5",
          size === "lg" && "sm:size-9 sm:[&_svg]:size-5",
        )}
        aria-hidden
      >
        {icon ?? <PencilIcon size={iconSize} />}
      </IconMark>
      <Text
        as="span"
        variant={size === "sm" ? "label" : "body"}
        className={cn(
          "min-w-0 flex-1 text-pretty text-(length:--pp-font-size-14) leading-(--pp-font-size-14)",
          size === "lg" &&
          "sm:text-(length:--pp-text-body-size) sm:leading-(--pp-text-body-leading)",
        )}
      >
        {label}
      </Text>
      <Checkbox
        checked={selected}
        disabled={disabled}
        size="sm"
        className={cn(
          "shrink-0",
          size === "lg" && "sm:size-(--pp-checkbox-xl) sm:[&_svg]:size-3.5",
        )}
        boxClassName={
          selected
            ? "border-transparent bg-[var(--pp-spring-green-600)] text-primary-foreground"
            : "border-[var(--pp-grey-300)] bg-transparent text-primary-foreground"
        }
        onChange={() => onClick?.()}
      />
    </label>
  );
}
