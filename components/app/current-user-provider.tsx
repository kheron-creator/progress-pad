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

    function onVisible() {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (!hasBrowserAuthCookie()) {
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

function hasBrowserAuthCookie() {
  return document.cookie.split(";").some((part) => {
    const name = part.trim().split("=")[0];
    return name.startsWith("sb-") && name.includes("auth-token");
  });
}
