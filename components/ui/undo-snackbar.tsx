"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { CloseIcon } from "./icon";

export type UndoSnackbarState = {
  id: number;
  message: string;
};

type PendingUndo = {
  id: number;
  message: string;
  onUndo: () => void | Promise<void>;
  onCommit?: () => void | Promise<void>;
};

export function useUndoSnackbar(duration = 5000) {
  const [banner, setBanner] = useState<UndoSnackbarState | null>(null);
  const pendingRef = useRef<PendingUndo | null>(null);
  const timeoutRef = useRef<number>(null);

  const clearTimeoutId = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const commitPending = useCallback(async () => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    clearTimeoutId();
    if (!pending?.onCommit) {
      return;
    }
    try {
      await pending.onCommit();
    } catch {
      // Callers handle commit errors inside onCommit.
    }
  }, [clearTimeoutId]);

  const dismissBanner = useCallback(() => {
    void commitPending();
    setBanner(null);
  }, [commitPending]);

  const showUndo = useCallback(
    (input: {
      message: string;
      onUndo: () => void | Promise<void>;
      onCommit?: () => void | Promise<void>;
    }) => {
      void commitPending();

      const id = Date.now() + Math.random();
      pendingRef.current = {
        id,
        message: input.message,
        onUndo: input.onUndo,
        onCommit: input.onCommit,
      };
      setBanner({ id, message: input.message });

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        void commitPending();
        setBanner((current) => (current?.id === id ? null : current));
      }, duration);
    },
    [commitPending, duration],
  );

  const undo = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    clearTimeoutId();
    setBanner(null);
    if (!pending) {
      return;
    }
    void pending.onUndo();
  }, [clearTimeoutId]);

  useEffect(() => {
    return () => {
      clearTimeoutId();
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending?.onCommit) {
        void pending.onCommit();
      }
    };
  }, [clearTimeoutId]);

  return { banner, showUndo, undo, dismissBanner };
}

export function UndoSnackbar({
  message,
  onUndo,
  onDismiss,
  className,
}: {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed bottom-6 left-1/2 z-50 flex w-[min(calc(100%-2rem),24rem)] -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-foreground shadow-md",
        className,
      )}
    >
      <span className="type-body-small min-w-0 flex-1 text-foreground-muted">{message}</span>
      <button
        type="button"
        className="type-label shrink-0 font-semibold text-primary hover:underline"
        onClick={onUndo}
      >
        Undo
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-foreground-muted hover:bg-background-subtle hover:text-foreground"
        onClick={onDismiss}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
