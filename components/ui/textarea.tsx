"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";

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
  autoSize?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
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

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "0px";
  element.style.height = `${element.scrollHeight}px`;
}

export function Textarea({
  label,
  labelClassName,
  hint,
  size = "md",
  state = "default",
  autoSize = false,
  className,
  disabled,
  id,
  ref,
  rows = 4,
  onInput,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const isDisabled = disabled || state === "disabled";
  const resolvedState: FieldState = isDisabled ? "disabled" : state;
  const innerRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!autoSize) {
      return;
    }

    resizeTextarea(innerRef.current);
  }, [autoSize, props.value]);

  return (
    <Field>
      {label ? (
        <FieldLabel htmlFor={inputId} className={labelClassName}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea
        id={inputId}
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
        disabled={isDisabled}
        rows={autoSize ? 1 : rows}
        aria-invalid={resolvedState === "error" || undefined}
        aria-describedby={hintId}
        onInput={(event) => {
          if (autoSize) {
            resizeTextarea(event.currentTarget);
          }
          onInput?.(event);
        }}
        className={cn(
          "type-body pp-control w-full wrap-break-word",
          autoSize ? "field-sizing-content resize-none overflow-hidden" : "resize-y",
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
