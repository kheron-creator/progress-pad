"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";

import { cn } from "@/lib/utils/cn";

import {
  Field,
  FieldHint,
  FieldLabel,
  fieldPaddingClass,
  fieldSizeClass,
  fieldStateClass,
  type FieldSize,
  type FieldState,
} from "./field";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  size?: FieldSize;
  state?: FieldState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

const iconInsetClass: Record<FieldSize, { left: string; right: string; both: string }> = {
  sm: { left: "pl-8 pr-2.5", right: "pl-2.5 pr-8", both: "px-8" },
  md: { left: "pl-9 pr-3", right: "pl-3 pr-9", both: "px-9" },
  lg: { left: "pl-10 pr-3.5", right: "pl-3.5 pr-10", both: "px-10" },
  xl: { left: "pl-11 pr-4", right: "pl-4 pr-11", both: "px-11" },
};

const iconOffsetClass: Record<FieldSize, { left: string; right: string }> = {
  sm: { left: "left-2.5", right: "right-2.5" },
  md: { left: "left-3", right: "right-3" },
  lg: { left: "left-3.5", right: "right-3.5" },
  xl: { left: "left-4", right: "right-4" },
};

export function Input({
  label,
  hint,
  size = "md",
  state = "default",
  leftIcon,
  rightIcon,
  className,
  disabled,
  id,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const isDisabled = disabled || state === "disabled";
  const resolvedState: FieldState = isDisabled ? "disabled" : state;
  const padding =
    leftIcon && rightIcon
      ? iconInsetClass[size].both
      : leftIcon
        ? iconInsetClass[size].left
        : rightIcon
          ? iconInsetClass[size].right
          : fieldPaddingClass[size];

  const control = (
    <input
      id={inputId}
      ref={ref}
      disabled={isDisabled}
      aria-invalid={resolvedState === "error" || undefined}
      aria-describedby={hintId}
      className={cn(
        "type-body pp-control",
        fieldSizeClass[size],
        fieldStateClass[resolvedState],
        padding,
        className,
      )}
      {...props}
    />
  );

  return (
    <Field>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      {leftIcon || rightIcon ? (
        <div className="relative">
          {leftIcon ? (
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-foreground-muted [&>button]:pointer-events-auto",
                iconOffsetClass[size].left,
                isDisabled && "text-foreground-disabled",
              )}
            >
              {leftIcon}
            </span>
          ) : null}
          {control}
          {rightIcon ? (
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-foreground-muted [&>button]:pointer-events-auto",
                iconOffsetClass[size].right,
                isDisabled && "text-foreground-disabled",
              )}
            >
              {rightIcon}
            </span>
          ) : null}
        </div>
      ) : (
        control
      )}
      {hint ? (
        <FieldHint id={hintId} error={resolvedState === "error"}>
          {hint}
        </FieldHint>
      ) : null}
    </Field>
  );
}
