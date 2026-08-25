"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import {
  ChatIcon,
  CheckCircleIcon,
  GridIcon,
  LightningIcon,
  ListBulletsIcon,
} from "./icon";
import { Text } from "./text";

export type NavLinkItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  featured?: boolean;
};

export const defaultNavItems: NavLinkItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <GridIcon size={14} /> },
  { id: "habit-sweep", label: "Active Mind Sweep", icon: <ListBulletsIcon size={14} /> },
  {
    id: "progress-today",
    label: "PROGRESS TODAY",
    icon: <CheckCircleIcon size={16} />,
    badge: 3,
    featured: true,
  },
  { id: "triggers", label: "Triggers", icon: <LightningIcon size={14} weight="regular" /> },
  { id: "assistant", label: "Assistant", icon: <ChatIcon size={14} /> },
];

type NavLinksProps = {
  items?: NavLinkItem[];
  selected?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function NavLinks({
  items = defaultNavItems,
  selected,
  onSelect,
  className,
}: NavLinksProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "grid h-20 w-full min-w-0 grid-cols-5 items-center gap-6 rounded-lg bg-primary px-4",
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = item.id === selected;
        const featured = Boolean(item.featured);

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isSelected ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "flex h-11 min-w-0 w-full items-center justify-center gap-1.5 rounded-md transition-colors",
              isSelected
                ? featured ? "bg-surface text-primary h-16" : "bg-surface text-primary"
                : featured
                  ? "bg-primary-hover text-foreground-on-brand h-16"
                  : "text-foreground-on-brand hover:bg-white/10",
            )}
          >
            <span className="inline-flex shrink-0">{item.icon}</span>
            {featured ? (
              <span className="flex flex-col items-center font-heading text-[length:var(--pp-font-size-12)] font-bold leading-tight tracking-wide">
                {item.label.split(/\s+/).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            ) : (
              <Text as="span" variant="label" className="truncate">
                {item.label}
              </Text>
            )}
            {item.badge != null ? (
              <span
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[length:var(--pp-font-size-11)] font-medium text-foreground-on-brand",
                  isSelected ? "bg-primary" : "bg-primary-active",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
