"use client";

import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";

import { useCurrentUser } from "./current-user-provider";
import { LogoutButton } from "./logout-button";

export function AppHeader() {
  const { name } = useCurrentUser();

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-page-x">
      <Logo size="sm" className="h-7" />
      <div className="flex min-w-0 items-center gap-3">
        <Text variant="label" className="truncate">
          {name}
        </Text>
        <LogoutButton />
      </div>
    </header>
  );
}
