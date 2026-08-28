"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import {
  ChatIcon,
  CheckCircleIcon,
  ChevronRightIcon,
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
  href?: string;
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
  layout?: "bar" | "stack";
  className?: string;
};

export function NavLinks({
  items = defaultNavItems,
  selected,
  onSelect,
  layout = "bar",
  className,
}: NavLinksProps) {
  const stacked = layout === "stack";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        stacked
          ? "flex w-full flex-col gap-1 px-5 py-4"
          : "flex w-max max-w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 min-[1000px]:gap-3 min-[1000px]:px-4 lg:px-5 xl:px-6",
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = item.id === selected;
        const featured = Boolean(item.featured);
        const itemClassName = stacked
          ? "flex h-9 w-full items-center gap-2.5 px-1 py-2 text-left text-foreground hover:bg-background-subtle"
          : cn(
            "flex shrink-0 items-center justify-center gap-1.5 px-2.5 py-2 transition-colors min-[1000px]:gap-2 min-[1000px]:px-4 lg:px-5 xl:gap-2.5 xl:px-6 xl:py-3",
            isSelected
              ? "rounded-md bg-surface text-primary"
              : featured
                ? "rounded-md bg-primary-hover text-foreground-on-brand"
                : "text-foreground-on-brand hover:bg-white/10",
          );
        const label = stacked
          ? item.label
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
          : item.label;
        const content = (
          <>
            <span className={cn("inline-flex shrink-0 items-center justify-center", stacked && "size-5 text-primary [&_svg]:size-5")}>
              {item.icon}
            </span>
            {featured && !stacked ? (
              <span className="flex flex-col items-center font-heading text-(length:--pp-font-size-11) font-bold leading-tight tracking-wide lg:text-(length:--pp-font-size-12)">
                {item.label.split(/\s+/).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            ) : (
              <Text
                as="span"
                variant={stacked ? "bodySmall" : "label"}
                className={cn(
                  stacked
                    ? "min-w-0 flex-1 truncate font-medium"
                    : "whitespace-nowrap text-(length:--pp-font-size-11) lg:text-(length:--pp-font-size-12) xl:text-(length:--pp-font-size-14)",
                )}
              >
                {stacked ? label : item.label}
              </Text>
            )}
            {stacked ? (
              <span className="inline-flex shrink-0 items-center gap-2">
                {item.badge != null ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-(length:--pp-font-size-11) font-medium text-foreground-on-brand">
                    {item.badge}
                  </span>
                ) : null}
                <ChevronRightIcon size={12} className="text-foreground-muted" />
              </span>
            ) : item.badge != null ? (
              <span
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-(length:--pp-font-size-11) font-medium text-foreground-on-brand",
                  isSelected ? "bg-primary" : "bg-primary-active",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isSelected ? "page" : undefined}
              className={itemClassName}
              onClick={() => onSelect?.(item.id)}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isSelected ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
            className={itemClassName}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
