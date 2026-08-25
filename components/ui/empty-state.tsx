import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Text } from "./text";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-[var(--pp-space-12)] rounded-md border border-border-subtle bg-surface p-card text-center",
        className,
      )}
    >
      <Text variant="quote">{title}</Text>
      {description ? <Text variant="description">{description}</Text> : null}
      {action}
    </div>
  );
}
