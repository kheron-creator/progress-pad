import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
};

export function Radio({ label, className, disabled, id, ...props }: RadioProps) {
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
      <span className="relative inline-flex size-[var(--pp-checkbox-md)] shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="radio"
          disabled={disabled}
          className="peer absolute inset-0 z-10 cursor-pointer appearance-none disabled:cursor-not-allowed"
          {...props}
        />
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-full border border-border bg-surface",
            "peer-checked:border-primary",
            "peer-disabled:border-border-disabled peer-disabled:bg-background-subtle",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring",
            "after:size-1.5 after:rounded-full after:bg-primary after:content-[''] after:opacity-0 peer-checked:after:opacity-100",
          )}
        />
      </span>
      {label ? <span className="type-label">{label}</span> : null}
    </label>
  );
}
