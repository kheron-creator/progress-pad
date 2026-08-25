import { cn } from "@/lib/utils/cn";

export type ActivityGridRow = {
  id?: string;
  values: boolean[];
};

type ActivityGridProps = {
  rows: ActivityGridRow[];
  label?: string;
  className?: string;
};

export function ActivityGrid({ rows, label = "Activity", className }: ActivityGridProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {rows.map((row, rowIndex) => (
        <div key={row.id ?? rowIndex} className="flex gap-1">
          {row.values.map((filled, cellIndex) => (
            <span
              key={cellIndex}
              className={cn(
                "h-2.5 min-w-0 flex-1 rounded-sm",
                filled ? "bg-primary" : "bg-background-subtle",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
