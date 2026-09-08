"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BellIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type StoredNotification,
} from "@/lib/notifications/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

import { useSessionStore } from "./session-store-provider";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationsMenu() {
  const router = useRouter();
  const notifications = useSessionStore((state) => state.notifications);
  const setNotifications = useSessionStore((state) => state.setNotifications);
  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function openNotification(item: StoredNotification) {
    if (pendingId) {
      return;
    }

    setPendingId(item.id);
    const previous = notifications;
    if (!item.read_at) {
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((row) => (row.id === item.id ? { ...row, read_at: readAt } : row)),
      );
      try {
        await markNotificationRead(createClient(), item.id);
      } catch {
        setNotifications(previous);
        setPendingId(null);
        return;
      }
    }

    setOpen(false);
    router.push(item.href || "/home");
    setPendingId(null);
  }

  async function handleMarkAll() {
    if (markingAll || unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    const previous = notifications;
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
    );

    try {
      await markAllNotificationsRead(createClient());
    } catch {
      setNotifications(previous);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-full p-0 leading-none text-foreground hover:bg-background-subtle",
          open && "bg-background-subtle",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <BellIcon size={16} />
        {unreadCount > 0 ? (
          <span className="absolute top-0.5 right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-(length:--pp-font-size-11) font-medium leading-4 text-foreground-on-brand">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-md"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <Text variant="label">Notifications</Text>
            {unreadCount > 0 ? (
              <button
                type="button"
                role="menuitem"
                className="type-caption text-primary hover:underline disabled:opacity-60"
                disabled={markingAll}
                onClick={() => void handleMarkAll()}
              >
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <Text variant="caption" className="px-3 py-3 text-foreground-muted">
              No notifications yet.
            </Text>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((item) => {
                const unread = !item.read_at;
                return (
                  <li key={item.id} className="border-b border-border last:border-b-0 my-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`${item.title}, ${unread ? "unread" : "read"}`}
                      className={cn(
                        "flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-background-subtle disabled:opacity-60 rounded-sm",
                        unread && "bg-(--pp-spring-green-10)",
                      )}
                      disabled={pendingId === item.id}
                      onClick={() => void openNotification(item)}
                    >

                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-start justify-between gap-2">
                          <Text
                            variant="label"
                            className={unread ? undefined : "font-normal"}
                          >
                            {item.title}
                          </Text>
                          <Text variant="caption" className="shrink-0 text-foreground-muted">
                            {formatNotificationTime(item.created_at)}
                          </Text>
                        </span>
                        <Text
                          variant="caption"
                          className={unread ? "text-foreground" : "text-foreground"}
                        >
                          {item.body}
                        </Text>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
