"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { isoDate } from "@/components/ui/calendar-strip";
import { Toast } from "@/components/ui/toast";
import { isCheckInTime } from "@/lib/onboarding/draft";
import {
  checkInFireAt,
  checkInReminderMessage,
  ensureNotificationPermission,
  nextDayCheckInFireAt,
  nextLocalMidnight,
  showCheckInNotification,
} from "@/lib/check-in/reminder";
import {
  checkInDedupeKey,
  insertCheckInNotification,
  markNotificationRead,
} from "@/lib/notifications/store";
import { flattenDayTriggers } from "@/lib/triggers/store";
import { createClient } from "@/lib/supabase/client";

import { useCurrentUser } from "./current-user-provider";
import { useSessionStore } from "./session-store-provider";

export function CheckInReminder() {
  const router = useRouter();
  const checkIn = useCurrentUser().onboarding.checkIn;
  const assignments = useSessionStore((state) => state.assignments);
  const planTriggers = useSessionStore((state) => state.planTriggers);
  const planScenarios = useSessionStore((state) => state.planScenarios);
  const states = useSessionStore((state) => state.states);
  const notifications = useSessionStore((state) => state.notifications);
  const addNotification = useSessionStore((state) => state.addNotification);
  const setNotifications = useSessionStore((state) => state.setNotifications);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [presentedId, setPresentedId] = useState<string | null>(null);
  const planRef = useRef({ assignments, planTriggers, planScenarios, states });
  planRef.current = { assignments, planTriggers, planScenarios, states };
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;
  const pendingKeys = useRef(new Set<string>());

  const today = isoDate(new Date());
  const openCount = flattenDayTriggers(
    assignments[today] ?? [],
    planTriggers,
    planScenarios,
    states[today],
  ).filter((trigger) => trigger.status !== "achieved").length;

  useEffect(() => {
    if (openCount === 0) {
      setVisible(false);
    }
  }, [openCount]);

  useEffect(() => {
    if (!isCheckInTime(checkIn)) {
      setVisible(false);
      return;
    }

    const preference = checkIn;
    let fireTimer = 0;
    let midnightTimer = 0;

    function openCountOn(date: string) {
      const plan = planRef.current;
      return flattenDayTriggers(
        plan.assignments[date] ?? [],
        plan.planTriggers,
        plan.planScenarios,
        plan.states[date],
      ).filter((trigger) => trigger.status !== "achieved").length;
    }

    function alreadyRecorded(key: string) {
      return (
        pendingKeys.current.has(key) ||
        notificationsRef.current.some((item) => item.dedupe_key === key)
      );
    }

    async function present(onDate: string, open: number) {
      const key = checkInDedupeKey(onDate, preference);
      if (alreadyRecorded(key)) {
        return;
      }

      pendingKeys.current.add(key);
      const nextMessage = checkInReminderMessage(open);

      try {
        const result = await insertCheckInNotification(createClient(), {
          date: onDate,
          checkIn: preference,
          body: nextMessage,
        });

        if (result.row) {
          addNotification(result.row);
        }

        if (!result.created) {
          if (!result.row) {
            pendingKeys.current.delete(key);
          }
          return;
        }

        setPresentedId(result.row.id);
        setMessage(nextMessage);
        setVisible(true);

        if (document.visibilityState === "visible") {
          void ensureNotificationPermission();
        } else {
          showCheckInNotification(nextMessage, () => router.push("/home"));
        }
      } catch {
        pendingKeys.current.delete(key);
      }
    }

    function tick() {
      const now = new Date();
      const onDate = isoDate(now);
      const fire = checkInFireAt(preference, now);
      const key = checkInDedupeKey(onDate, preference);
      const open = openCountOn(onDate);

      if (open === 0) {
        setVisible(false);
      }

      if (now.getTime() < fire.getTime()) {
        window.clearTimeout(fireTimer);
        fireTimer = window.setTimeout(tick, fire.getTime() - now.getTime());
        return;
      }

      if (!alreadyRecorded(key) && open > 0) {
        void present(onDate, open);
      }

      window.clearTimeout(fireTimer);
      const nextFire = nextDayCheckInFireAt(preference, now);
      fireTimer = window.setTimeout(tick, nextFire.getTime() - now.getTime());
    }

    function armMidnight() {
      window.clearTimeout(midnightTimer);
      const now = new Date();
      midnightTimer = window.setTimeout(() => {
        setVisible(false);
        tick();
        armMidnight();
      }, nextLocalMidnight(now).getTime() - now.getTime());
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        tick();
      }
    }

    tick();
    armMidnight();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(fireTimer);
      window.clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [addNotification, checkIn, openCount, router]);

  async function markPresentedRead() {
    if (!presentedId) {
      return;
    }

    const id = presentedId;
    const previous = notificationsRef.current;
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read_at: item.read_at ?? readAt } : item)),
    );

    try {
      await markNotificationRead(createClient(), id);
    } catch {
      setNotifications(previous);
    }
  }

  function dismissPresented() {
    setVisible(false);
    void markPresentedRead();
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(calc(100%-2rem),18rem)] flex-col gap-2">
      <Toast
        tone="info"
        action="View"
        onAction={() => {
          dismissPresented();
          router.push("/home");
        }}
        onDismiss={dismissPresented}
      >
        {message}
      </Toast>
    </div>
  );
}
