import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import {
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "./icon";

export type ToastTone = "success" | "error" | "info" | "warning";

type ToastProps = HTMLAttributes<HTMLDivElement> & {
  tone?: ToastTone;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  children: ReactNode;
};

const toneClass: Record<ToastTone, string> = {
  success: "bg-toast-success",
  error: "bg-toast-error",
  info: "bg-toast-info",
  warning: "bg-toast-warning",
};

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircleIcon size={16} weight="fill" />,
  error: <XCircleIcon size={16} weight="fill" />,
  info: <InfoIcon size={16} weight="fill" />,
  warning: <WarningCircleIcon size={16} weight="fill" />,
};

export function Toast({
  tone = "success",
  action,
  onAction,
  onDismiss,
  className,
  children,
  ...props
}: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "type-body-small pointer-events-auto flex w-full items-center gap-2 rounded-md px-3.5 py-3 text-toast shadow-md",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      <span className="inline-flex shrink-0 text-toast">{toneIcon[tone]}</span>
      <span className="min-w-0 flex-1 text-left">{children}</span>
      {action || onDismiss ? (
        <span className="inline-flex shrink-0 items-center gap-1">
          {action ? (
            <button
              type="button"
              className="type-overline px-2 font-bold text-toast"
              onClick={onAction}
            >
              {action}
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              aria-label="Dismiss"
              className="inline-flex size-7 items-center justify-center rounded-sm text-toast hover:bg-white/15"
              onClick={onDismiss}
            >
              <CloseIcon size={14} />
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
