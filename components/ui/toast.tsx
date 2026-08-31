import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckIcon } from "./icon";

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
        "type-status flex items-center gap-2 rounded-md border px-4 py-3 shadow-md",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {tone === "success" ? <CheckIcon size={14} /> : null}
      {children}
    </div>
  );
}
