import { cn } from "@/lib/utils/cn";

type ProgressProps = {
  value: number;
  label: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClass = {
  sm: "h-[var(--pp-progress-height-sm)]",
  md: "h-[var(--pp-progress-height-md)]",
} as const;

export function Progress({ value, label, size = "md", className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        "overflow-hidden rounded-full bg-background-subtle",
        sizeClass[size],
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
