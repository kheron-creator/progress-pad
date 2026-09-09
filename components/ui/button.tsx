import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { type ControlSize } from "./field";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonLook = "filled" | "outline" | "clear" | "ghost" | "icon";
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

const iconCompactClass: Record<ButtonSize, string> = {
  sm: "size-(--pp-icon-button-sm) shrink-0 p-0",
  md: "size-(--pp-icon-button-md) shrink-0 p-0",
  lg: "size-(--pp-icon-button-lg) shrink-0 p-0",
  xl: "size-(--pp-icon-button-xl) shrink-0 p-0",
};

const iconControlClass: Record<ButtonSize, string> = {
  sm: "size-[var(--pp-control-height-sm)] min-w-[var(--pp-control-height-sm)] shrink-0 p-0",
  md: "size-[var(--pp-control-height-md)] min-w-[var(--pp-control-height-md)] shrink-0 p-0",
  lg: "size-[var(--pp-control-height-lg)] min-w-[var(--pp-control-height-lg)] shrink-0 p-0",
  xl: "size-[var(--pp-control-height-xl)] min-w-[var(--pp-control-height-xl)] shrink-0 p-0",
};

const spinnerSize: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

const iconClearClass: Record<ButtonVariant, string> = {
  primary: "bg-transparent text-primary hover:bg-transparent",
  secondary: "bg-transparent text-secondary hover:bg-transparent",
  danger: "bg-transparent text-error hover:bg-transparent",
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
  if (look === "ghost") {
    return "clear";
  }

  if (look === "icon") {
    return "outline";
  }

  return look;
}

function iconSizeClass(size: ButtonSize, look: ButtonLook) {
  if (look === "icon") {
    return iconControlClass[size];
  }

  return iconCompactClass[size];
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
  const isIcon = iconOnly || look === "icon";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "type-button inline-flex cursor-pointer items-center justify-center transition-colors",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-subtle disabled:text-foreground-disabled",
        isIcon && resolvedLook === "clear" ? "rounded-none" : "rounded-sm",
        isIcon ? iconSizeClass(size, look) : sizeClass[size],
        fullWidth && "w-full",
        isIcon && resolvedLook === "clear"
          ? iconClearClass[variant]
          : lookClass[`${variant}-${resolvedLook}`],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={spinnerSize[size]} /> : null}
      {isIcon && loading ? null : children}
    </button>
  );
}
