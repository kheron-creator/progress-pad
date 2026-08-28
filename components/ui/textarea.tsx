"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import {
  Field,
  FieldHint,
  FieldLabel,
  fieldPaddingClass,
  fieldStateClass,
  fieldTextClass,
  type FieldSize,
  type FieldState,
} from "./field";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelClassName?: string;
  hint?: string;
  size?: FieldSize;
  state?: FieldState;
};

const minHeightClass: Record<FieldSize, string> = {
  sm: "min-h-[var(--pp-control-height-sm)]",
  md: "min-h-[var(--pp-control-height-md)]",
  lg: "min-h-[var(--pp-control-height-lg)]",
  xl: "min-h-[var(--pp-control-height-xl)]",
};

const fieldBlockPaddingClass: Record<FieldSize, string> = {
  sm: "py-[calc((var(--pp-control-height-sm)-var(--pp-text-body-leading))/2)]",
  md: "py-[calc((var(--pp-control-height-md)-var(--pp-text-body-leading))/2)]",
  lg: "py-[calc((var(--pp-control-height-lg)-var(--pp-text-body-leading))/2)]",
  xl: "py-[calc((var(--pp-control-height-xl)-var(--pp-text-body-leading))/2)]",
};

export function Textarea({
  label,
  labelClassName,
  hint,
  size = "md",
  state = "default",
  className,
  disabled,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const isDisabled = disabled || state === "disabled";
  const resolvedState: FieldState = isDisabled ? "disabled" : state;

  return (
    <Field>
      {label ? (
        <FieldLabel htmlFor={inputId} className={labelClassName}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea
        id={inputId}
        disabled={isDisabled}
        rows={rows}
        aria-invalid={resolvedState === "error" || undefined}
        aria-describedby={hintId}
        className={cn(
          "type-body pp-control w-full resize-y",
          fieldTextClass[size],
          fieldPaddingClass[size],
          fieldBlockPaddingClass[size],
          fieldStateClass[resolvedState],
          minHeightClass[size],
          className,
        )}
        {...props}
      />
      {hint ? (
        <FieldHint id={hintId} error={resolvedState === "error"}>
          {hint}
        </FieldHint>
      ) : null}
    </Field>
  );
}
