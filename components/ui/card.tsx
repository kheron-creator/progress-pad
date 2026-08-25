import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type CardVariant = "default" | "elevated" | "interactive";

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
};

const variantClass: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-none",
  elevated: "border border-border-subtle bg-surface-elevated shadow-md",
  interactive:
    "border border-border bg-surface shadow-sm transition-shadow hover:shadow-md",
};

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <section
      className={cn("rounded-md p-card", variantClass[variant], className)}
      {...props}
    />
  );
}
