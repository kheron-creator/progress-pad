import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Text } from "./text";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  media?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, media, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-(--pp-space-12) rounded-md border border-border-subtle bg-surface p-card text-center",
        className,
      )}
    >
      {media}
      <Text as="h3" variant={media ? "cardTitle" : "quote"}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" className="max-w-sm text-foreground-secondary">
          {description}
        </Text>
      ) : null}
      {action}
    </div>
  );
}
