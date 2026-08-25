import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckIcon } from "./icon";

export type CheckboxSize = "xs" | "sm" | "md" | "lg";
export type CheckboxTone = "primary" | "accent";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ReactNode;
  size?: CheckboxSize;
  tone?: CheckboxTone;
};

const boxSize: Record<CheckboxSize, string> = {
  xs: "size-[var(--pp-checkbox-xs)]",
  sm: "size-[var(--pp-checkbox-sm)]",
  md: "size-[var(--pp-checkbox-md)]",
  lg: "size-[var(--pp-checkbox-lg)]",
};

export function Checkbox({
  label,
  size = "sm",
  tone = "primary",
  className,
  disabled,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-[var(--pp-space-8)]",
        disabled ? "cursor-not-allowed text-foreground-disabled" : "cursor-pointer",
        className,
      )}
    >
      <span className={cn("relative inline-flex shrink-0 items-center justify-center", boxSize[size])}>
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 z-10 cursor-pointer appearance-none disabled:cursor-not-allowed"
          {...props}
        />
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-xs border border-border bg-surface",
            tone === "accent"
              ? "text-accent-foreground peer-checked:border-accent peer-checked:bg-accent"
              : "text-primary-foreground peer-checked:border-primary peer-checked:bg-primary",
            "peer-checked:[&_svg]:opacity-100",
            "peer-disabled:border-border-disabled peer-disabled:bg-background-subtle",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring",
          )}
        >
          <CheckIcon className="size-3 opacity-0" />
        </span>
      </span>
      {label ? <span className="type-label">{label}</span> : null}
    </label>
  );
}
