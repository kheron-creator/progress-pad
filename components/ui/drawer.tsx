"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
};

export function Drawer({ open, onOpenChange, labelledBy, children, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
    }

    if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={cn(
        "m-0 h-dvh max-h-dvh w-full max-w-none border-0 bg-transparent p-0",
        "open:flex open:justify-end",
        "text-foreground backdrop:bg-overlay",
      )}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={cn(
          "flex h-full w-[min(100%,26.25rem)] flex-col border-l border-border bg-surface shadow-lg",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
}
