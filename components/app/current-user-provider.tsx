"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { CurrentUser } from "@/lib/auth/user";
import { clearRememberPreference } from "@/lib/auth/remember";
import type { CheckInTime } from "@/lib/onboarding/draft";
import { createClient } from "@/lib/supabase/client";

const CurrentUserContext = createContext<CurrentUser | null>(null);
const SetCheckInContext = createContext<(checkIn: CheckInTime | null) => void>(() => {});

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckInTime | null>(user.onboarding.checkIn);

  useEffect(() => {
    setCheckIn(user.onboarding.checkIn);
  }, [user.onboarding.checkIn]);

  const value = useMemo<CurrentUser>(
    () => ({
      ...user,
      onboarding: { ...user.onboarding, checkIn },
    }),
    [user, checkIn],
  );

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

  return (
    <CurrentUserContext.Provider value={value}>
      <SetCheckInContext.Provider value={setCheckIn}>{children}</SetCheckInContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used inside the app layout.");
  }

  return user;
}

export function useSetCheckIn() {
  return useContext(SetCheckInContext);
}

