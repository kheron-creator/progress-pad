"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { CloseIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

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
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "m-auto w-[min(100%-2rem,27.5rem)] max-h-[90dvh] overflow-auto rounded-lg border border-border bg-surface p-card shadow-lg",
        "text-foreground backdrop:bg-overlay",
      )}
      onClose={() => onOpenChange(false)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Text as="h2" id={titleId} variant="cardTitle">
            {title}
          </Text>
          {description ? (
            <Text id={descriptionId} variant="description">
              {description}
            </Text>
          ) : null}
        </div>
        <IconButton label="Close" look="clear" size="sm" onClick={() => onOpenChange(false)}>
          <CloseIcon />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}

type DialogActionsProps = {
  children: ReactNode;
};

export function DialogActions({ children }: DialogActionsProps) {
  return <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>;
}

type ConfirmActionsProps = {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function DialogConfirmActions({
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmActionsProps) {
  return (
    <DialogActions>
      <Button variant="secondary" look="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </DialogActions>
  );
}
