"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { Field, FieldHint, FieldLabel, fieldStatusClass, type FieldStatus } from "./field";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  status?: FieldStatus;
};

export function Textarea({
  label,
  hint,
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
          "type-body pp-control min-h-[var(--pp-control-height-lg)] resize-y px-3.5 py-3",
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
