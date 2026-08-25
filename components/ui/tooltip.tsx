import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type TooltipProps = {
  content: string;
  children: ReactNode;
};

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative inline-flex">
      <span className="peer">{children}</span>
      <span
        role="tooltip"
        className={cn(
          "type-caption pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap",
          "rounded-sm bg-foreground px-2 py-1 text-background opacity-0 shadow-sm",
          "peer-hover:opacity-100 peer-focus-within:opacity-100",
        )}
      >
        {content}
      </span>
    </span>
  );
}
