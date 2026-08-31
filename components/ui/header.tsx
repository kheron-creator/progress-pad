"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import { Avatar } from "./avatar";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "./icon";
import { IconMark } from "./icon-mark";
import { Logo } from "./logo";
import { defaultNavItems, NavLinks, type NavLinkItem } from "./nav-links";

type HeaderProps = {
  selected?: string;
  onSelect?: (id: string) => void;
  items?: NavLinkItem[];
  homeHref?: string;
  onThemeToggle?: () => void;
  theme?: "light" | "dark";
  initials?: string;
  avatarSrc?: string;
  account?: ReactNode;
  className?: string;
};

export function Header({
  selected = "progress-today",
  onSelect,
  items = defaultNavItems,
  homeHref,
  onThemeToggle,
  theme = "light",
  initials = "PP",
  avatarSrc,
  account,
  className,
}: HeaderProps) {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const logo = <Logo variant="auto" size="sm" className="h-8 w-auto md:h-auto md:w-24 min-[1000px]:w-32 xl:w-40" />;

  const brand = homeHref ? (
    <Link href={homeHref} className="flex shrink-0 items-center" aria-label="Progress Today home">
      {logo}
    </Link>
  ) : (
    <span className="flex items-center">{logo}</span>
  );

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSelect(id: string) {
    onSelect?.(id);
    closeMenu();
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.matchMedia("(min-width: 48rem)").matches) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  return (
    <header className={cn("relative w-full min-w-0 overflow-x-clip md:overflow-visible", className)}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden={!menuOpen}
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-0 bg-overlay transition-opacity duration-300 ease-out md:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMenu}
      />

      <div className="relative z-10 bg-surface">
        <div
          className={cn(
            "relative flex h-16 min-w-0 items-center justify-between border-b border-border px-4",
            "md:grid md:h-auto md:grid-cols-[1fr_auto_1fr] md:items-center md:px-6 md:py-2 min-[1000px]:px-8 lg:px-10",
            "gap-3 md:gap-4 min-[1000px]:gap-6 xl:gap-12 2xl:gap-20",
          )}
        >
          <div className="relative z-20 flex w-max shrink-0 items-center self-center md:justify-self-start">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className="inline-flex size-10 shrink-0 items-center justify-center text-foreground md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <IconMark size="md" tone="primary-muted">
                  <CloseIcon size={18} />
                </IconMark>
              ) : (
                <MenuIcon size={24} />
              )}
            </button>
            <span className="hidden md:flex md:items-center">{brand}</span>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-12 right-12 z-10 flex items-center justify-center md:hidden">
            <span className="pointer-events-auto max-w-full">{brand}</span>
          </div>

          <div className="hidden min-w-0 md:flex md:justify-center">
            <NavLinks items={items} selected={selected} onSelect={onSelect} />
          </div>

          <div className="relative z-20 flex w-max shrink-0 items-center self-center md:justify-self-end md:gap-2">
            <button
              type="button"
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              className="hidden size-9 items-center justify-center rounded-full bg-background-subtle p-0 leading-none text-foreground hover:bg-border-strong md:inline-flex"
              onClick={onThemeToggle}
            >
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
            {account ?? <Avatar src={avatarSrc} initials={initials} size="sm" />}
          </div>
        </div>

        <div
          id={menuId}
          aria-hidden={!menuOpen}
          className={cn(
            "absolute inset-x-0 top-full z-10 grid md:hidden",
            "transition-[grid-template-rows] duration-300 ease-out",
            menuOpen ? "grid-rows-[1fr]" : "pointer-events-none grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="rounded-b-lg bg-surface shadow-md">
              <NavLinks layout="stack" items={items} selected={selected} onSelect={handleSelect} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
