"use client";

import type { ReactNode } from "react";

import { beginLibraryDrag, type LibraryDragPayload } from "@/lib/triggers/drag";
import { TRIGGERS_PICK_COPY } from "@/lib/triggers/content";
import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { EmojiPicker } from "./emoji-picker";
import { EmptyState } from "./empty-state";
import { IconMark } from "./icon-mark";
import { FolderIcon, LightningIcon, PlusIcon } from "./icon";
import { Text } from "./text";
import { Textarea } from "./textarea";
import { Toast } from "./toast";
import { TriggerDropzone, type DroppedTrigger } from "./trigger-dropzone";
import { TriggerListItem } from "./trigger-list-item";

export type LibraryScenario = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  triggerCount?: number;
  triggerIds?: string[];
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
  pendingCount?: number;
  onAddSelected?: () => void;
  onRemoveTrigger?: (id: string) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  onDelete?: (id: string) => void;
  selectedIds?: ReadonlySet<string>;
  onSelectedChange?: (id: string, checked: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selection?: LibraryDragPayload[];
  columns?: 1 | 2;
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
  pendingCount = 0,
  onAddSelected,
  onRemoveTrigger,
  onAdd,
  onSave,
  onCancel,
  saving = false,
  onDelete,
  selectedIds,
  onSelectedChange,
  onSelectAll,
  selection = [],
  columns = 1,
  className,
}: ScenariosLibraryProps) {
  const selectable = Boolean(onSelectedChange);
  const canSave = Boolean(name?.trim() && selectedIcon && droppedTriggers.length > 0);
  const allSelected = items.length > 0 && Boolean(selectedIds && items.every((item) => selectedIds.has(item.id)));

  return (
    <Card className={cn("flex w-full flex-col gap-section", className)}>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Text as="h2" variant="cardTitle" className="min-w-0 truncate font-(--pp-font-weight-semibold)">
          {title}
        </Text>
        {state === "add" ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button size="md" variant="primary" look="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button size="md" onClick={onSave} disabled={!canSave} loading={saving}>
              Save
            </Button>
          </div>
        ) : (
          <Button size="md" className="shrink-0" onClick={onAdd}>
            <PlusIcon size={14} />
            Add New Scenario
          </Button>
        )}
      </div>

      {state === "add" ? (
        <div className="flex flex-col gap-section">
          <TriggerDropzone
            items={droppedTriggers}
            pendingCount={pendingCount}
            onAddSelected={onAddSelected}
            onDropTrigger={onDropTrigger}
            onRemove={onRemoveTrigger}
          />
          <Textarea
            autoSize
            label="Scenario Name"
            placeholder="Add a Scenario name."
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <Textarea
            autoSize
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
          {items.length === 0 ? (
            <EmptyState
              className="flex-1 justify-center border-0 bg-transparent py-8"
              media={<FolderIcon size="xl" className="text-(--pp-spring-green-700)" />}
              title="No scenarios yet"
              description="Add your first scenario to group triggers into a routine you can assign to any day."
            />
          ) : (
            <>
              {selectable && onSelectAll ? (
                <button
                  type="button"
                  className="type-caption w-fit font-(--pp-font-weight-medium) text-primary"
                  onClick={() => onSelectAll(!allSelected)}
                >
                  {allSelected ? TRIGGERS_PICK_COPY.unselectAll : TRIGGERS_PICK_COPY.selectAll}
                </button>
              ) : null}
              <div
                className={cn(
                  "grid min-h-0 max-h-(--pp-library-list-max-height) content-start gap-3 overflow-y-auto overscroll-y-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                  columns === 2 && "grid-cols-2 max-sm:grid-cols-1",
                )}
              >
                {items.map((item) => (
                  <TriggerListItem
                    key={item.id}
                    look="library"
                    title={item.title}
                    description={item.description}
                    meta={item.meta}
                    checkbox={selectable}
                    checked={selectedIds?.has(item.id) ?? false}
                    onCheckedChange={
                      selectable ? (checked) => onSelectedChange?.(item.id, checked) : undefined
                    }
                    draggable
                    onDragStart={(event) =>
                      beginLibraryDrag(
                        event,
                        { kind: "scenario", id: item.id, name: item.title },
                        selection,
                      )
                    }
                    leftEmoji={
                      item.icon ?? (
                        <IconMark size="xs" tone="surface">
                          <LightningIcon size={10} />
                        </IconMark>
                      )
                    }
                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
