import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type IconMarkSize = "xs" | "sm" | "md" | "lg";
export type IconMarkShape = "square" | "circle";
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
  children: ReactNode;
};

const sizeClass: Record<IconMarkSize, string> = {
  xs: "size-5",
  sm: "size-[1.625rem]",
  md: "size-9",
  lg: "size-10",
};

const toneClass: Record<IconMarkTone, string> = {
  accent: "bg-accent text-accent-foreground",
  primary: "bg-primary text-primary-foreground",
  "primary-muted": "bg-primary-muted text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-foreground-inverse",
  warning: "bg-warning text-foreground-inverse",
  info: "bg-info text-foreground-inverse",
  surface: "bg-surface",
};

export function IconMark({
  size = "sm",
  shape = "square",
  tone = "accent",
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
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
