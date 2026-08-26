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
  sm: "h-12 w-full max-w-[420px] px-4 py-4",
  lg: "h-14 w-full max-w-[420px] px-3 py-2 sm:h-[72px] sm:px-4 sm:py-4",
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
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <label
      className={cn(
        "flex items-center gap-4 rounded-sm border text-left",
        sizeClass[size],
        selected
          ? "border-(--pp-spring-green-600) bg-(--pp-spring-green-10)"
          : "border-(--pp-grey-50) bg-(--pp-grey-25)",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <IconMark
        size={size === "sm" ? "sm" : "md"}
        shape="square"
        tone="surface"
        className="text-(--pp-spring-green-600)"
        aria-hidden
      >
        {icon ?? <PencilIcon size={iconSize} />}
      </IconMark>
      <Text as="span" variant={size === "sm" ? "label" : "body"} className="min-w-0 flex-1 truncate">
        {label}
      </Text>
      <Checkbox
        checked={selected}
        disabled={disabled}
        size={size === "sm" ? "lg" : "xl"}
        boxClassName={
          selected
            ? "border-[var(--pp-spring-green-600)] bg-[var(--pp-spring-green-600)] text-primary-foreground"
            : "border-[var(--pp-grey-300)] bg-transparent text-primary-foreground"
        }
        onChange={() => onClick?.()}
      />
    </label>
  );
}
