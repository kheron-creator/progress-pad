import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type IconMarkSize = "xs" | "sm" | "md" | "lg";
export type IconMarkShape = "square" | "circle";
export type IconMarkTone = "accent" | "primary" | "secondary" | "success";

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
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-foreground-inverse",
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
