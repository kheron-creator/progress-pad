"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { IconMark } from "./icon-mark";
import { Input } from "./input";
import { LightningIcon, PlusIcon } from "./icon";
import { Progress } from "./progress";
import { Text } from "./text";
import { TriggerListItem } from "./trigger-list-item";

export type ProgressSectionItem = {
  id: string;
  title: string;
  icon?: ReactNode;
};

type ProgressSectionProps = {
  heading?: string;
  description?: string;
  progress?: number;
  name?: string;
  onNameChange?: (value: string) => void;
  detail?: string;
  onDetailChange?: (value: string) => void;
  onAdd?: () => void;
  onUpdate?: () => void;
  items?: ProgressSectionItem[];
  onDelete?: (id: string) => void;
  className?: string;
};

export function ProgressSection({
  heading = "Heading",
  description = "Subtitle / detail",
  progress = 50,
  name,
  onNameChange,
  detail,
  onDetailChange,
  onAdd,
  onUpdate,
  items = [],
  onDelete,
  className,
}: ProgressSectionProps) {
  return (
    <Card className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-start gap-3">
        <IconMark>
          <LightningIcon size={14} />
        </IconMark>
        <div className="min-w-0 flex-1">
          <Text variant="subtitle">{heading}</Text>
          <Text variant="caption" className="text-foreground-muted">
            {description}
          </Text>
        </div>
        <Button size="md" variant="secondary" onClick={onUpdate}>
          Update
        </Button>
      </div>
      <Progress value={progress} size="sm" label={`${heading} progress`} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1 basis-40">
          <Input
            label="Short name"
            placeholder="Short name"
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
        </div>
        <div className="min-w-0 flex-1 basis-40">
          <Input
            label="Subtitle / Detail (Optional)"
            placeholder="Subtitle / Detail (Optional)"
            value={detail}
            onChange={(event) => onDetailChange?.(event.currentTarget.value)}
          />
        </div>
        <Button size="md" onClick={onAdd}>
          <PlusIcon size={14} />
          Add Item
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <TriggerListItem
              key={item.id}
              title={item.title}
              checkbox={false}
              leftEmoji={
                item.icon ?? (
                  <IconMark size="xs">
                    <LightningIcon size={12} />
                  </IconMark>
                )
              }
              onDelete={() => onDelete?.(item.id)}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
