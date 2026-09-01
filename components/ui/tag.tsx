import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type TagVariant = "default" | "primary" | "secondary" | "tertiary" | "error";
export type TagStyle = "default" | "outline";
export type TagSize = "xs" | "sm" | "lg";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  look?: TagStyle;
  size?: TagSize;
  leftIcon?: ReactNode;
};

const lookClass: Record<`${TagVariant}-${TagStyle}`, string> = {
  "default-default": "border-border bg-surface text-foreground",
  "default-outline": "border-border-strong bg-surface text-foreground",
  "primary-default": "border-transparent bg-success text-foreground-inverse",
  "primary-outline": "border-success bg-success-muted text-success-foreground",
  "secondary-default": "border-transparent bg-accent text-accent-foreground",
  "secondary-outline": "border-accent bg-accent-muted text-accent-text",
  "tertiary-default": "border-transparent bg-secondary text-secondary-foreground",
  "tertiary-outline": "border-secondary bg-secondary-muted text-secondary",
  "error-default": "border-transparent bg-error text-foreground-inverse",
  "error-outline": "border-error bg-transparent text-error-foreground",
};

export function Tag({
  variant = "default",
  look = "default",
  size: _size = "sm",
  leftIcon,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--pp-radius-6) border px-(--pp-space-8) py-(--pp-space-6)",
        "gap-(--pp-space-4) text-(length:--pp-font-size-10) font-(--pp-font-weight-medium) leading-none",
        "[&_svg]:size-2",
        lookClass[`${variant}-${look}`],
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </span>
  );
}
