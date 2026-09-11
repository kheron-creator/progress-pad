"use client";

import type { ReactNode } from "react";

import { TRIGGERS_PICK_COPY } from "@/lib/triggers/content";
import { cn } from "@/lib/utils/cn";

import { IconMark } from "./icon-mark";
import { LightningIcon } from "./icon";
import { Text } from "./text";
import { TriggerListItem } from "./trigger-list-item";

export type SuggestedTrigger = {
  id: string;
  name: string;
  icon?: ReactNode;
};

type SuggestedTriggersProps = {
  items?: SuggestedTrigger[];
  onAdd?: (id: string) => void;
  addingId?: string | null;
  className?: string;
};

export function SuggestedTriggers({
  items = [],
  onAdd,
  addingId = null,
  className,
}: SuggestedTriggersProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <Text as="h2" variant="body" className="min-w-0 truncate font-(--pp-font-weight-semibold)">
        {TRIGGERS_PICK_COPY.suggested}
      </Text>
      <div className="flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <div key={item.id} className="w-56 shrink-0">
            <TriggerListItem
              look="library"
              title={item.name}
              checkbox={false}
              leftEmoji={
                item.icon ?? (
                  <IconMark size="xs" tone="surface">
                    <LightningIcon size={10} />
                  </IconMark>
                )
              }
              onAdd={onAdd ? () => onAdd(item.id) : undefined}
              adding={addingId === item.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
