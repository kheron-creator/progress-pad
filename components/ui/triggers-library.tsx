"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { IconMark } from "./icon-mark";
import { Input } from "./input";
import { LightningIcon, PlusIcon, SearchIcon } from "./icon";
import { Text } from "./text";
import { TriggerListItem } from "./trigger-list-item";

export type LibraryTrigger = {
  id: string;
  name: string;
  icon?: ReactNode;
};

type TriggersLibraryProps = {
  state?: "default" | "add";
  title?: string;
  items?: LibraryTrigger[];
  name?: string;
  onNameChange?: (value: string) => void;
  query?: string;
  onQueryChange?: (value: string) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export function TriggersLibrary({
  state = "default",
  title = "Triggers Library",
  items = [],
  name,
  onNameChange,
  query,
  onQueryChange,
  onAdd,
  onSave,
  onDelete,
  className,
}: TriggersLibraryProps) {
  return (
    <Card className={cn("flex w-full max-w-[31.375rem] flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Text variant="cardTitle">{title}</Text>
        {state === "add" ? (
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
        ) : (
          <Button size="sm" onClick={onAdd}>
            <PlusIcon size={14} />
            Add New Trigger
          </Button>
        )}
      </div>

      {state === "add" ? (
        <div className="flex flex-col gap-3">
          <Input
            label="Trigger Name"
            placeholder="Trigger Name"
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <Input
            label="Icon"
            placeholder="Select an Icon"
            leftIcon={<SearchIcon />}
            readOnly
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {onQueryChange || query != null ? (
            <Input
              placeholder="Search..."
              value={query}
              onChange={(event) => onQueryChange?.(event.currentTarget.value)}
              leftIcon={<SearchIcon />}
            />
          ) : null}
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <TriggerListItem
                key={item.id}
                title={item.name}
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
        </div>
      )}
    </Card>
  );
}
