"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Header } from "@/components/ui/header";
import { defaultNavItems } from "@/components/ui/nav-links";
import { Text } from "@/components/ui/text";

import { useCurrentUser } from "./current-user-provider";
import { useSignOut } from "./logout-button";

type Theme = "light" | "dark";

const appNavItems = defaultNavItems.map((item) =>
  item.id === "progress-today" ? { ...item, href: "/home" } : item,
);

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
}: {
  name: string;
  email: string | null;
  initials: string;
  avatarSrc?: string;
}) {
  const { signOut, pending, error } = useSignOut();
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="rounded-full outline-offset-2"
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
            className="block border-b border-border px-3 py-2 hover:bg-background-subtle"
            onClick={() => setOpen(false)}
          >
            <Text variant="label" className="truncate">
              {name}
            </Text>
            {email ? (
              <Text variant="caption" className="truncate">
                {email}
              </Text>
            ) : null}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="type-label flex w-full px-3 py-2 text-left text-foreground hover:bg-background-subtle disabled:opacity-60"
            disabled={pending}
            onClick={() => {
              void signOut();
            }}
          >
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
  const [theme, setTheme] = useState<Theme>("light");
  const initials = initialsFromUser(user.name, user.email);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  return (
    <Header
      className="sticky top-0 z-20"
      selected="progress-today"
      items={appNavItems}
      homeHref="/home"
      theme={theme}
      onThemeToggle={toggleTheme}
      initials={initials}
      avatarSrc={user.avatarUrl}
      account={
        <AccountMenu
          name={user.name}
          email={user.email}
          initials={initials}
          avatarSrc={user.avatarUrl}
        />
      }
    />
  );
}
