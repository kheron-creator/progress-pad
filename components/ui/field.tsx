import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type FieldSize = "sm" | "md" | "lg";
export type FieldStatus = "default" | "success" | "error";
export type FieldState = FieldStatus | "filled" | "focus" | "disabled";

export const fieldSizeClass: Record<FieldSize, string> = {
  sm: "h-[var(--pp-input-height-sm)] text-[length:var(--pp-text-control-sm-size)]",
  md: "h-[var(--pp-input-height-md)]",
  lg: "h-[var(--pp-input-height-lg)] text-[length:var(--pp-text-control-lg-size)]",
};

export const fieldPaddingClass: Record<FieldSize, string> = {
  sm: "px-3",
  md: "px-3.5",
  lg: "px-4",
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
