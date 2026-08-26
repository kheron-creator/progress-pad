import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { type ControlSize } from "./field";
import { CheckIcon } from "./icon";

export type CheckboxSize = ControlSize;
export type CheckboxTone = "primary" | "accent";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ReactNode;
  size?: CheckboxSize;
  tone?: CheckboxTone;
  invalid?: boolean;
  boxClassName?: string;
};

const boxSize: Record<CheckboxSize, string> = {
  sm: "size-[var(--pp-checkbox-sm)]",
  md: "size-[var(--pp-checkbox-md)]",
  lg: "size-[var(--pp-checkbox-lg)]",
  xl: "size-[var(--pp-checkbox-xl)]",
};

const iconSize: Record<CheckboxSize, number> = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
};

export function Checkbox({
  label,
  size = "md",
  tone = "primary",
  invalid = false,
  boxClassName,
  className,
  disabled,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const control = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        boxSize[size],
        !label && className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className="peer absolute inset-0 z-10 cursor-pointer appearance-none disabled:cursor-not-allowed"
        {...props}
        aria-invalid={invalid || undefined}
      />
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-xs border",
          boxClassName ??
            cn(
              invalid ? "border-border-error" : "border-border",
              tone === "accent"
                ? "text-accent-foreground peer-checked:border-accent peer-checked:bg-accent"
                : "text-primary-foreground peer-checked:border-primary peer-checked:bg-primary",
            ),
          "peer-checked:[&_svg]:opacity-100",
          "peer-disabled:border-border-disabled peer-disabled:bg-background-subtle",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring",
        )}
      >
        <CheckIcon size={iconSize[size]} className="opacity-0" />
      </span>
    </span>
  );

  if (!label) {
    return control;
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex min-w-0 items-center gap-(--pp-space-8)",
        disabled ? "cursor-not-allowed text-foreground-disabled" : "cursor-pointer",
        className,
      )}
    >
      {control}
      <span className="type-label min-w-0 text-pretty">{label}</span>
    </label>
  );
}
