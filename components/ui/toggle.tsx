import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
};

export function Toggle({ label, className, disabled, id, ...props }: ToggleProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-[var(--pp-space-12)]",
        disabled ? "cursor-not-allowed text-foreground-disabled" : "cursor-pointer",
        className,
      )}
    >
      <span
        className="relative inline-flex h-[var(--pp-toggle-track-height)] w-[var(--pp-toggle-track-width)] shrink-0 items-center"
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className="peer absolute inset-0 z-10 cursor-pointer appearance-none disabled:cursor-not-allowed"
          {...props}
        />
        <span
          className={cn(
            "flex h-full w-full items-center rounded-full bg-background-subtle px-0.5 transition-colors",
            "peer-checked:bg-primary",
            "peer-disabled:bg-background-subtle",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring",
            "after:size-[var(--pp-toggle-thumb)] after:rounded-full after:bg-surface after:shadow-sm after:content-[''] after:transition-transform",
            "peer-checked:after:translate-x-[calc(var(--pp-toggle-track-width)-var(--pp-toggle-thumb)-0.25rem)]",
          )}
        />
      </span>
      {label ? <span className="type-label">{label}</span> : null}
    </label>
  );
}
