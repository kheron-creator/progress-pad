"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { isoDate } from "@/components/ui/calendar-strip";
import { Header } from "@/components/ui/header";
import { MoonIcon, SignOutIcon, SunIcon, UserIcon } from "@/components/ui/icon";
import { defaultNavItems } from "@/components/ui/nav-links";
import { Text } from "@/components/ui/text";
import type { Theme } from "@/lib/theme";
import { flattenDayTriggers } from "@/lib/triggers/store";

import { useCurrentUser } from "./current-user-provider";
import { useSignOut } from "./logout-button";
import { NotificationsMenu } from "./notifications-menu";
import { useSessionStore } from "./session-store-provider";
import { useTheme } from "./theme-provider";
import { useUnsavedLeave } from "./unsaved-leave-provider";

const navHrefs: Record<string, string> = {
  dashboard: "/dashboard",
  "active-mind-sweep": "/active-mind-sweep",
  "progress-today": "/home",
  triggers: "/triggers",
  assistant: "/assistant",
};

function selectedNavId(pathname: string) {
  if (pathname.startsWith("/triggers")) {
    return "triggers";
  }
  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }
  if (pathname.startsWith("/active-mind-sweep")) {
    return "active-mind-sweep";
  }
  if (pathname.startsWith("/assistant")) {
    return "assistant";
  }
  if (pathname.startsWith("/profile")) {
    return "";
  }
  if (pathname.startsWith("/coming-soon")) {
    return "";
  }
  return "progress-today";
}

function initialsFromUser(name: string, email: string | null) {
  const words = name.trim().split(/\s+/).filter((part) => part.length > 0);
  if (words.length >= 2 && name !== email) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const source = words[0] && words[0].toLowerCase() !== "there" ? words[0] : (email ?? "PP");
  return source.slice(0, 2).toUpperCase();
}

function AccountMenu({
  name,
  email,
  initials,
  avatarSrc,
  theme,
  onThemeToggle,
}: {
  name: string;
  email: string | null;
  initials: string;
  avatarSrc?: string;
  theme: Theme;
  onThemeToggle: () => void;
}) {
  const { signOut, pending, error } = useSignOut();
  const { confirmLeave } = useUnsavedLeave();
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="inline-flex size-(--pp-avatar-sm) shrink-0 items-center justify-center rounded-full p-0 leading-none outline-offset-2"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar src={avatarSrc} alt="" initials={initials} size="sm" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-md"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-start gap-2 border-b border-border px-3 py-2 hover:bg-background-subtle"
            onClick={() => setOpen(false)}
          >
            <UserIcon size={16} className="mt-0.5 shrink-0 text-foreground" />
            <span className="min-w-0 flex-1">
              <Text variant="label" className="truncate">
                {name}
              </Text>
              {email ? (
                <Text variant="caption" className="truncate">
                  {email}
                </Text>
              ) : null}
            </span>
          </Link>
          <button
            type="button"
            role="menuitem"
            className="type-label flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-foreground hover:bg-background-subtle md:hidden"
            onClick={onThemeToggle}
          >
            {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="type-label flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-background-subtle disabled:opacity-60"
            disabled={pending}
            onClick={() => {
              confirmLeave(() => {
                void signOut();
              });
            }}
          >
            <SignOutIcon size={16} className="shrink-0 text-foreground" />
            {pending ? "Signing out…" : "Log out"}
          </button>
          {error ? (
            <Text variant="caption" className="px-3 pb-1 text-error" role="alert">
              {error}
            </Text>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AppHeader() {
  const user = useCurrentUser();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const initials = initialsFromUser(user.name, user.email);
  const remainingToday = useSessionStore((state) => {
    const today = isoDate(new Date());
    return flattenDayTriggers(
      state.assignments[today] ?? [],
      state.planTriggers,
      state.planScenarios,
      state.states[today],
    ).filter((trigger) => trigger.status !== "achieved").length;
  });
  const items = useMemo(
    () =>
      defaultNavItems.map((item) => {
        const href = navHrefs[item.id];
        const withHref = href ? { ...item, href } : item;
        if (item.id !== "progress-today") {
          return withHref;
        }
        return { ...withHref, badge: remainingToday };
      }),
    [remainingToday],
  );

  return (
    <Header
      className="sticky top-0 z-20"
      selected={selectedNavId(pathname)}
      items={items}
      homeHref="/home"
      theme={theme}
      onThemeToggle={toggleTheme}
      initials={initials}
      avatarSrc={user.avatarUrl?.trim() || undefined}
      tools={<NotificationsMenu />}
      account={
        <AccountMenu
          name={user.name}
          email={user.email}
          initials={initials}
          avatarSrc={user.avatarUrl?.trim() || undefined}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      }
    />
  );
}
