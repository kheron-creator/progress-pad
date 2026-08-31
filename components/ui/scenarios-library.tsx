"use client";

import type { ReactNode } from "react";

import { beginLibraryDrag } from "@/lib/triggers/drag";
import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { EmojiPicker } from "./emoji-picker";
import { IconMark } from "./icon-mark";
import { PlusIcon, LightningIcon } from "./icon";
import { Input } from "./input";
import { Text } from "./text";
import { Toast } from "./toast";
import { TriggerDropzone, type DroppedTrigger } from "./trigger-dropzone";
import { TriggerListItem } from "./trigger-list-item";

export type LibraryScenario = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  triggerCount?: number;
  icon?: ReactNode;
};

type ScenariosLibraryProps = {
  state?: "default" | "add" | "pick";
  title?: string;
  items?: LibraryScenario[];
  notice?: string;
  name?: string;
  onNameChange?: (value: string) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  selectedIcon?: string;
  onIconSelect?: (emoji: string) => void;
  droppedTriggers?: DroppedTrigger[];
  onDropTrigger?: (item: DroppedTrigger) => void;
  onRemoveTrigger?: (id: string) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
  assigning?: boolean;
  className?: string;
};

export function ScenariosLibrary({
  state = "default",
  title = "Scenarios Library",
  items = [],
  notice,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  selectedIcon,
  onIconSelect,
  droppedTriggers = [],
  onDropTrigger,
  onRemoveTrigger,
  onAdd,
  onSave,
  onCancel,
  onDelete,
  assigning = false,
  className,
}: ScenariosLibraryProps) {
  const pick = state === "pick" || assigning;
  const canSave = Boolean(name?.trim() && selectedIcon && droppedTriggers.length > 0);

  return (
    <Card className={cn("flex w-full flex-col gap-section", className)}>
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" variant="cardTitle" className="min-w-0 truncate font-(--pp-font-weight-semibold)">
          {title}
        </Text>
        {state === "add" && !assigning ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button size="md" variant="primary" look="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="md" onClick={onSave} disabled={!canSave}>
              Save
            </Button>
          </div>
        ) : (
          <Button size="md" className="shrink-0" onClick={onAdd} disabled={assigning}>
            <PlusIcon size={14} />
            Add New Scenario
          </Button>
        )}
      </div>

      {state === "add" && !assigning ? (
        <div className="flex flex-col gap-section">
          <TriggerDropzone
            description="to create a new scenario"
            items={droppedTriggers}
            onDropTrigger={onDropTrigger}
            onRemove={onRemoveTrigger}
          />
          <Input
            label="Scenario Name"
            placeholder="Add a Scenario name."
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <Input
            label="Description (optional)"
            placeholder="Description..."
            value={description}
            onChange={(event) => onDescriptionChange?.(event.currentTarget.value)}
          />
          <EmojiPicker
            selected={selectedIcon}
            onSelect={onIconSelect}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notice ? (
            <Toast tone="success" className="shadow-none">
              {notice}
            </Toast>
          ) : null}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <TriggerListItem
                key={item.id}
                look="library"
                title={item.title}
                description={item.description}
                meta={item.meta}
                checkbox={false}
                draggable={pick}
                onDragStart={
                  pick
                    ? (event) =>
                        beginLibraryDrag(event, { kind: "scenario", id: item.id, name: item.title })
                    : undefined
                }
                leftEmoji={
                  item.icon ?? (
                    <IconMark size="sm" tone="surface">
                      <LightningIcon size={14} />
                    </IconMark>
                  )
                }
                onDelete={pick ? undefined : () => onDelete?.(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
