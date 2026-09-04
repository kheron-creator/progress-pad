"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";

import type { AppSession } from "@/lib/app/session";
import { createSessionStore, type SessionState, type SessionStore } from "@/lib/app/session-store";

const SessionStoreContext = createContext<SessionStore | null>(null);

export function SessionStoreProvider({
  initial,
  children,
}: {
  initial: AppSession;
  children: ReactNode;
}) {
  const [store] = useState(() => createSessionStore(initial));

  return <SessionStoreContext.Provider value={store}>{children}</SessionStoreContext.Provider>;
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error("useSessionStore must be used inside SessionStoreProvider.");
  }

  return useStore(store, selector);
}
