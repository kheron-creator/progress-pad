"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import {
  Field,
  FieldHint,
  FieldLabel,
  fieldPaddingClass,
  fieldStatusClass,
  type FieldSize,
  type FieldStatus,
} from "./field";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  size?: FieldSize;
  status?: FieldStatus;
};

const minHeightClass: Record<FieldSize, string> = {
  sm: "min-h-[var(--pp-control-height-sm)]",
  md: "min-h-[var(--pp-control-height-md)]",
  lg: "min-h-[var(--pp-control-height-lg)]",
  xl: "min-h-[var(--pp-control-height-xl)]",
};

export function Textarea({
  label,
  hint,
  size = "md",
  status = "default",
  className,
  disabled,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <Field>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <textarea
        id={inputId}
        disabled={disabled}
        rows={rows}
        aria-invalid={status === "error" || undefined}
        aria-describedby={hintId}
        className={cn(
          "type-body pp-control resize-y py-3",
          minHeightClass[size],
          fieldPaddingClass[size],
          fieldStatusClass[status],
          className,
        )}
        {...props}
      />
      {hint ? (
        <FieldHint id={hintId} error={status === "error"}>
          {hint}
        </FieldHint>
      ) : null}
    </Field>
  );
}
