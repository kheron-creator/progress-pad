"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckCircleIcon, CloseIcon, DragHandleIcon, UploadIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

export type DroppedTrigger = {
  id: string;
  name: string;
};

type TriggerDropzoneProps = {
  state?: "default" | "added";
  items?: DroppedTrigger[];
  onRemove?: (id: string) => void;
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
};

export function TriggerDropzone({
  state = "default",
  items = [],
  onRemove,
  className,
  icon,
  title,
  description,
}: TriggerDropzoneProps) {
  const count = items.length;
  const added = state === "added" || count > 0;

  return (
    <div
      role="region"
      aria-label={added ? `${count} triggers added` : "Drop triggers here"}
      className={cn(
        "flex w-full flex-col gap-3 rounded-md bg-surface p-5",
        added ? "border border-border" : "border-2 border-dashed border-primary",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        {icon ??
          (added ? (
            <CheckCircleIcon size={28} className="text-primary" weight="fill" />
          ) : (
            <UploadIcon size={28} className="text-primary" />
          ))}
        <Text variant="subtitle" className="text-primary">
          {title ?? (added ? `${count} Triggers Added` : "Drop Triggers here")}
        </Text>
        {description ? (
          <Text variant="caption" className="text-foreground-muted">
            {description}
          </Text>
        ) : null}
      </div>
      {added && items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md bg-background-subtle px-3 py-2"
            >
              <span className="text-foreground-muted" aria-hidden>
                <DragHandleIcon />
              </span>
              <Text variant="label" className="min-w-0 flex-1 truncate">
                {item.name}
              </Text>
              <IconButton
                label={`Remove ${item.name}`}
                variant="danger"
                look="clear"
                size="md"
                onClick={() => onRemove?.(item.id)}
              >
                <CloseIcon />
              </IconButton>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
