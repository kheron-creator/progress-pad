"use client";

import { useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { Field, FieldHint, FieldLabel, fieldSizeClass, fieldStatusClass, type FieldSize, type FieldStatus } from "./field";
import { ChevronDownIcon } from "./icon";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: string;
  hint?: string;
  size?: FieldSize;
  status?: FieldStatus;
};

export function Select({
  label,
  hint,
  size = "md",
  status = "default",
  className,
  disabled,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;

  return (
    <Field>
      {label ? <FieldLabel htmlFor={selectId}>{label}</FieldLabel> : null}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={status === "error" || undefined}
          aria-describedby={hintId}
          className={cn(
            "type-body pp-control appearance-none",
            fieldSizeClass[size],
            fieldStatusClass[status],
            size === "sm" ? "pl-2.5 pr-8" : size === "md" ? "pl-3 pr-9" : size === "xl" ? "pl-4 pr-11" : "pl-3.5 pr-10",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground-muted" />
      </div>
      {hint ? (
        <FieldHint id={hintId} error={status === "error"}>
          {hint}
        </FieldHint>
      ) : null}
    </Field>
  );
}
