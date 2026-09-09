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

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={cn(
        "fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none overflow-hidden overscroll-none border-0 bg-transparent p-0",
        "open:flex open:items-center open:justify-center open:px-page-x",
        "lg:open:items-stretch lg:open:justify-end lg:open:px-0",
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
          "flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg",
          "max-h-[90dvh]",
          "lg:h-full lg:max-h-none lg:w-[min(100%,26.25rem)] lg:max-w-none lg:rounded-none lg:border-0 lg:border-l",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
}
