import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { type ControlSize } from "./field";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonLook = "filled" | "outline" | "clear" | "ghost";
export type ButtonSize = ControlSize;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  look?: ButtonLook;
  size?: ButtonSize;
  iconOnly?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-[var(--pp-control-height-sm)] min-h-[var(--pp-control-height-sm)] min-w-[var(--pp-control-height-sm)] gap-1 px-10.5 text-[length:var(--pp-text-control-sm-size)]",
  md: "h-[var(--pp-control-height-md)] min-h-[var(--pp-control-height-md)] min-w-[var(--pp-control-height-md)] gap-1 px-11 text-[length:var(--pp-text-control-md-size)]",
  lg: "h-[var(--pp-control-height-lg)] min-h-[var(--pp-control-height-lg)] min-w-[var(--pp-control-height-lg)] gap-1.5 px-12 text-[length:var(--pp-text-control-lg-size)]",
  xl: "h-[var(--pp-control-height-xl)] min-h-[var(--pp-control-height-xl)] min-w-[var(--pp-control-height-xl)] gap-2 px-13 text-[length:var(--pp-text-control-xl-size)]",
};

const iconSizeClass: Record<ButtonSize, string> = {
  sm: "h-[var(--pp-icon-button-sm)] w-[var(--pp-icon-button-sm)] p-0",
  md: "h-[var(--pp-icon-button-md)] w-[var(--pp-icon-button-md)] p-0",
  lg: "h-[var(--pp-icon-button-lg)] w-[var(--pp-icon-button-lg)] p-0",
  xl: "h-[var(--pp-icon-button-xl)] w-[var(--pp-icon-button-xl)] p-0",
};

const spinnerSize: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

const lookClass: Record<`${ButtonVariant}-${"filled" | "outline" | "clear"}`, string> = {
  "primary-filled":
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  "primary-outline":
    "border border-primary bg-transparent text-primary hover:bg-primary-muted",
  "primary-clear": "bg-transparent text-primary hover:bg-primary-muted",
  "secondary-filled":
    "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  "secondary-outline":
    "border border-secondary bg-transparent text-secondary hover:bg-secondary-muted",
  "secondary-clear": "bg-transparent text-secondary hover:bg-secondary-muted",
  "danger-filled": "bg-error text-foreground-inverse hover:bg-error-hover",
  "danger-outline": "border border-error bg-transparent text-error hover:bg-error-muted",
  "danger-clear": "bg-transparent text-error hover:bg-error-muted",
};

function resolveLook(look: ButtonLook): "filled" | "outline" | "clear" {
  return look === "ghost" ? "clear" : look;
}

export function Button({
  variant = "primary",
  look = "filled",
  size = "md",
  iconOnly = false,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const resolvedLook = resolveLook(look);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "type-button inline-flex cursor-pointer items-center justify-center rounded-sm transition-colors",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-subtle disabled:text-foreground-disabled",
        iconOnly ? iconSizeClass[size] : sizeClass[size],
        fullWidth && "w-full",
        lookClass[`${variant}-${resolvedLook}`],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={spinnerSize[size]} /> : null}
      {iconOnly && loading ? null : children}
    </button>
  );
}
