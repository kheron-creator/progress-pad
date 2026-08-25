import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ChipState = "default" | "selected" | "outlined";
export type ChipSize = "xs" | "sm" | "md" | "lg";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: ChipState;
  size?: ChipSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const sizeClass: Record<ChipSize, string> = {
  xs: "h-[var(--pp-chip-height-xs)] gap-1 px-2 text-[length:var(--pp-text-overline-size)]",
  sm: "h-[var(--pp-chip-height-sm)] gap-1 px-2 text-[length:var(--pp-text-overline-size)]",
  md: "h-[var(--pp-chip-height-md)] gap-1.5 px-2.5 text-[length:var(--pp-text-caption-size)]",
  lg: "h-[var(--pp-chip-height-lg)] gap-2 px-3 text-[length:var(--pp-text-label-size)]",
};

const stateClass: Record<ChipState, string> = {
  default: "border-transparent bg-background-subtle text-secondary",
  selected: "border-transparent bg-secondary text-secondary-foreground",
  outlined: "border-secondary bg-secondary-muted text-secondary",
};

export function Chip({
  state = "default",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  type = "button",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={state === "selected"}
      className={cn(
        "type-label inline-flex items-center justify-center rounded-full border transition-colors",
        "disabled:pointer-events-none disabled:text-foreground-disabled",
        sizeClass[size],
        stateClass[state],
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
