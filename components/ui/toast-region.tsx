"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Toast, type ToastTone } from "./toast";

export type ToastMessage = {
  id: number;
  tone: ToastTone;
  message: string;
};

export function useToasts(duration = 4000) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    const ids = timeouts.current;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, tone, message }]);
      const timeout = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
      timeouts.current.push(timeout);
    },
    [duration],
  );

  return { toasts, showToast };
}

export function ToastRegion({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(calc(100%-2rem),22rem)] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          tone={toast.tone}
          role={toast.tone === "error" ? "alert" : "status"}
        >
          {toast.message}
        </Toast>
      ))}
    </div>
  );
}
