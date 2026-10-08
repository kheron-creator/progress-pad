import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type CardVariant = "default" | "elevated" | "interactive";
export type CardPadding = "default" | "sm";

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
};

const variantClass: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-none",
  elevated: "border border-border-subtle bg-surface-elevated shadow-md",
  interactive:
    "border border-border bg-surface shadow-sm transition-shadow hover:shadow-md",
};

const paddingClass: Record<CardPadding, string> = {
  default: "p-card",
  sm: "p-4",
};

export function Card({
  variant = "default",
  padding = "default",
  className,
  ...props
}: CardProps) {
  return (
    <section
      className={cn("rounded-md", paddingClass[padding], variantClass[variant], className)}
      {...props}
    />
  );
}
