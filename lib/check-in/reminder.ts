import type { CheckInTime } from "@/lib/onboarding/draft";

export const CHECK_IN_HOUR: Record<CheckInTime, number> = {
  morning: 10,
  afternoon: 14,
  evening: 19,
};

export function checkInFireAt(checkIn: CheckInTime, now: Date) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    CHECK_IN_HOUR[checkIn],
    0,
    0,
    0,
  );
}

export function nextDayCheckInFireAt(checkIn: CheckInTime, now: Date) {
  const fire = checkInFireAt(checkIn, now);
  fire.setDate(fire.getDate() + 1);
  return fire;
}

export function nextLocalMidnight(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function checkInReminderMessage(openCount: number) {
  if (openCount === 1) {
    return "You still have a trigger left for today.";
  }

  return `You still have ${openCount} triggers left for today.`;
}

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) {
    return "unsupported";
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showCheckInNotification(body: string, onClick?: () => void) {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return;
  }

  if (document.visibilityState === "visible") {
    return;
  }

  try {
    const notification = new Notification("Progress Pad", {
      body,
      icon: `${window.location.origin}/brand/logo-light.png`,
      tag: "progresspad-checkin",
    });
    notification.onclick = () => {
      notification.close();
      window.focus();
      onClick?.();
    };
  } catch {
    // Some browsers throw if the document is not allowed to notify.
  }
}
