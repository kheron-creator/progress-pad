"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";

type LeaveGuard = {
  blockInApp: boolean;
  blockUnload: boolean;
};

const EMPTY_GUARD: LeaveGuard = { blockInApp: false, blockUnload: false };

const UnsavedLeaveContext = createContext<{
  setGuard: (guard: LeaveGuard) => void;
  confirmLeave: (proceed: () => void) => void;
  guardedPush: (href: string) => void;
} | null>(null);

function samePage(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

function leaveHrefFromClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) {
    return null;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || samePage(url)) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function UnsavedLeaveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const guardRef = useRef<LeaveGuard>(EMPTY_GUARD);
  const [pendingLeave, setPendingLeave] = useState<{ proceed: () => void } | null>(null);

  const setGuard = useCallback((next: LeaveGuard) => {
    guardRef.current = next;
  }, []);

  const confirmLeave = useCallback((proceed: () => void) => {
    if (!guardRef.current.blockInApp && !guardRef.current.blockUnload) {
      proceed();
      return;
    }

    setPendingLeave({ proceed });
  }, []);

  const guardedPush = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin && samePage(url)) {
        return;
      }

      const next = `${url.pathname}${url.search}${url.hash}`;
      confirmLeave(() => router.push(next));
    },
    [confirmLeave, router],
  );

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!guardRef.current.blockUnload) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function onClick(event: MouseEvent) {
      if (!guardRef.current.blockInApp) {
        return;
      }

      const href = leaveHrefFromClick(event);
      if (!href) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setPendingLeave({ proceed: () => router.push(href) });
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  const value = useMemo(
    () => ({ setGuard, confirmLeave, guardedPush }),
    [setGuard, confirmLeave, guardedPush],
  );

  return (
    <UnsavedLeaveContext.Provider value={value}>
      {children}
      <Dialog
        open={pendingLeave !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingLeave(null);
          }
        }}
        title="Leave without saving?"
        description="You have unsaved changes that will be lost."
      >
        <DialogConfirmActions
          danger
          confirmLabel="Leave"
          cancelLabel="Stay"
          onCancel={() => setPendingLeave(null)}
          onConfirm={() => {
            const proceed = pendingLeave?.proceed;
            setPendingLeave(null);
            proceed?.();
          }}
        />
      </Dialog>
    </UnsavedLeaveContext.Provider>
  );
}

export function useUnsavedLeave() {
  const context = useContext(UnsavedLeaveContext);
  if (!context) {
    throw new Error("useUnsavedLeave must be used inside UnsavedLeaveProvider.");
  }

  return context;
}

export function useRegisterUnsavedLeave(dirty: boolean) {
  const { setGuard, confirmLeave, guardedPush } = useUnsavedLeave();
  setGuard({ blockInApp: dirty, blockUnload: dirty });

  useEffect(() => {
    return () => setGuard(EMPTY_GUARD);
  }, [setGuard]);

  return { confirmLeave, guardedPush };
}
