import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
export type BadgeLook = "filled" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  look?: BadgeLook;
  size?: BadgeSize;
};

const sizeClass: Record<BadgeSize, string> = {
  sm: "h-[var(--pp-badge-height-sm)] px-2 text-[length:var(--pp-text-overline-size)]",
  md: "h-[var(--pp-badge-height-md)] px-2.5 text-[length:var(--pp-text-caption-size)]",
  lg: "h-[var(--pp-badge-height-lg)] px-3 text-[length:var(--pp-text-label-size)]",
};

const toneClass: Record<`${BadgeTone}-${BadgeLook}`, string> = {
  "default-filled": "bg-background-subtle text-foreground-secondary",
  "default-outline": "border border-border text-foreground-secondary",
  "primary-filled": "bg-primary-muted text-primary",
  "primary-outline": "border border-primary text-primary",
  "secondary-filled": "bg-secondary-muted text-secondary",
  "secondary-outline": "border border-secondary text-secondary",
  "success-filled": "bg-success-muted text-success-foreground",
  "success-outline": "border border-success text-success-foreground",
  "warning-filled": "bg-warning-muted text-warning-foreground",
  "warning-outline": "border border-warning text-warning-foreground",
  "error-filled": "bg-error-muted text-error-foreground",
  "error-outline": "border border-error text-error-foreground",
  "info-filled": "bg-info-muted text-info-foreground",
  "info-outline": "border border-info text-info-foreground",
};

export function Badge({
  tone = "default",
  look = "filled",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "type-label inline-flex items-center justify-center rounded-full",
        sizeClass[size],
        toneClass[`${tone}-${look}`],
        className,
      )}
      {...props}
    />
  );
}
