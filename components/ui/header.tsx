"use client";

import { cn } from "@/lib/utils/cn";

import { Avatar } from "./avatar";
import { BellIcon, MoonIcon } from "./icon";
import { Logo } from "./logo";
import { defaultNavItems, NavLinks } from "./nav-links";

type HeaderProps = {
  selected?: string;
  onSelect?: (id: string) => void;
  onNotifications?: () => void;
  onThemeToggle?: () => void;
  initials?: string;
  avatarSrc?: string;
  className?: string;
};

export function Header({
  selected = "progress-today",
  onSelect,
  onNotifications,
  onThemeToggle,
  initials = "PP",
  avatarSrc,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "grid h-24 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-surface px-4",
        className,
      )}
    >
      <Logo variant="light" size="sm" className="h-7" />
      <NavLinks items={defaultNavItems} selected={selected} onSelect={onSelect} />
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex size-9 items-center justify-center rounded-full text-foreground hover:bg-background-subtle"
          onClick={onNotifications}
        >
          <BellIcon size={16} />
        </button>
        <button
          type="button"
          aria-label="Toggle theme"
          className="inline-flex size-9 items-center justify-center rounded-full bg-background-subtle text-foreground hover:bg-border-subtle"
          onClick={onThemeToggle}
        >
          <MoonIcon size={16} />
        </button>
        <Avatar src={avatarSrc} initials={initials} size="sm" />
      </div>
    </header>
  );
}
