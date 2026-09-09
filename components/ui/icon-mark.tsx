import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type IconMarkSize = "xs" | "sm" | "md" | "lg";
export type IconMarkShape = "square" | "circle";
export type IconMarkLook = "filled" | "outline";
export type IconMarkTone =
  | "accent"
  | "primary"
  | "primary-muted"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "surface";

type IconMarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: IconMarkSize;
  shape?: IconMarkShape;
  tone?: IconMarkTone;
  look?: IconMarkLook;
  children: ReactNode;
};

const sizeClass: Record<IconMarkSize, string> = {
  xs: "size-(--pp-space-20) [&_svg]:size-(--pp-font-size-10)",
  sm: "size-[1.625rem] [&_svg]:size-(--pp-font-size-14)",
  md: "size-(--pp-space-36) [&_svg]:size-(--pp-font-size-16)",
  lg: "size-(--pp-space-40) [&_svg]:size-(--pp-font-size-22)",
};

const filledToneClass: Record<IconMarkTone, string> = {
  accent: "bg-accent text-accent-foreground",
  primary: "bg-primary text-primary-foreground",
  "primary-muted": "bg-primary-muted text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-foreground-inverse",
  warning: "bg-warning text-foreground-inverse",
  info: "bg-info text-foreground-inverse",
  surface: "bg-surface text-foreground",
};

const outlineToneClass: Record<IconMarkTone, string> = {
  accent: "border-accent bg-accent-muted text-accent",
  primary: "border-primary bg-primary-muted text-primary",
  "primary-muted": "border-primary bg-primary-muted text-primary",
  secondary: "border-secondary bg-secondary-muted text-secondary",
  success: "border-success bg-success-muted text-success-foreground",
  warning: "border-warning bg-warning-muted text-warning-foreground",
  info: "border-info bg-info-muted text-info-foreground",
  surface: "border-border bg-surface text-foreground",
};

export function IconMark({
  size = "sm",
  shape = "square",
  tone = "accent",
  look = "filled",
  className,
  children,
  ...props
}: IconMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        sizeClass[size],
        look === "outline" ? cn("border", outlineToneClass[tone]) : filledToneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
