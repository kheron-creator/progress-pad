import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ToastTone = "success" | "error" | "info";

type ToastProps = HTMLAttributes<HTMLDivElement> & {
  tone?: ToastTone;
  children: ReactNode;
};

const toneClass: Record<ToastTone, string> = {
  success: "border-success bg-success-muted text-success-foreground",
  error: "border-error bg-error-muted text-error-foreground",
  info: "border-info bg-info-muted text-info-foreground",
};

export function Toast({ tone = "success", className, children, ...props }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "type-status rounded-md border px-4 py-3 shadow-md",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
