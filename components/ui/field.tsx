import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ControlSize = "sm" | "md" | "lg" | "xl";
export type FieldSize = ControlSize;
export type FieldStatus = "default" | "success" | "error";
export type FieldState = FieldStatus | "filled" | "focus" | "disabled";

export const controlSizes: ControlSize[] = ["sm", "md", "lg", "xl"];

export const fieldTextClass: Record<FieldSize, string> = {
  sm: "text-[length:var(--pp-text-control-sm-size)]",
  md: "text-[length:var(--pp-text-control-md-size)]",
  lg: "text-[length:var(--pp-text-control-lg-size)]",
  xl: "text-[length:var(--pp-text-control-xl-size)]",
};

export const fieldSizeClass: Record<FieldSize, string> = {
  sm: `h-[var(--pp-control-height-sm)] ${fieldTextClass.sm}`,
  md: `h-[var(--pp-control-height-md)] ${fieldTextClass.md}`,
  lg: `h-[var(--pp-control-height-lg)] ${fieldTextClass.lg}`,
  xl: `h-[var(--pp-control-height-xl)] ${fieldTextClass.xl}`,
};

export const fieldPaddingClass: Record<FieldSize, string> = {
  sm: "px-2.5",
  md: "px-3",
  lg: "px-3.5",
  xl: "px-4",
};

export const fieldStatusClass: Record<FieldStatus, string> = {
  default: "focus:border-border-focus",
  success: "border-border-success focus:border-border-success",
  error: "border-border-error focus:border-border-error",
};

export const fieldStateClass: Record<FieldState, string> = {
  ...fieldStatusClass,
  filled: "focus:border-border-focus",
  focus: "border-border-focus",
  disabled: "",
};

export function Field({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-[var(--pp-space-8)]", className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("type-label text-foreground", className)} {...props} />;
}

export function FieldHint({
  error = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { error?: boolean; children: ReactNode }) {
  return (
    <p
      className={cn("type-caption", error ? "text-error" : "text-foreground-muted", className)}
      {...props}
    >
      {children}
    </p>
  );
}
