import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type DividerProps = HTMLAttributes<HTMLHRElement> & {
  label?: string;
};

export function Divider({ label, className, ...props }: DividerProps) {
  if (!label) {
    return (
      <hr
        className={cn("h-px w-full border-0 bg-border", className)}
        {...props}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-[var(--pp-space-12)]", className)} role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="type-label text-foreground-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
