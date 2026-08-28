"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { CurrentUser } from "@/lib/auth/user";
import { clearRememberPreference } from "@/lib/auth/remember";
import { createClient } from "@/lib/supabase/client";

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    function leaveApp() {
      clearRememberPreference();
      router.replace("/login");
      router.refresh();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        leaveApp();
      }
    });

    async function onVisible() {
      if (document.visibilityState !== "visible") {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        leaveApp();
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [router]);

  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used inside the app layout.");
  }

  return user;
}

