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
import { Input } from "./input";
import { FilesIcon, LightningIcon, PlusIcon, SearchIcon } from "./icon";
import { SuggestedTriggers } from "./suggested-triggers";
import { Text } from "./text";
import { Textarea } from "./textarea";
import { TriggerListItem } from "./trigger-list-item";

export type LibraryTrigger = {
  id: string;
  name: string;
  icon?: ReactNode;
};

type TriggersLibraryProps = {
  state?: "default" | "add" | "pick";
  title?: string;
  items?: LibraryTrigger[];
  name?: string;
  onNameChange?: (value: string) => void;
  query?: string;
  onQueryChange?: (value: string) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  selectedIcon?: string;
  onIconSelect?: (emoji: string) => void;
  onDelete?: (id: string) => void;
  selectedIds?: ReadonlySet<string>;
  onSelectedChange?: (id: string, checked: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selection?: LibraryDragPayload[];
  columns?: 1 | 2;
  suggestions?: LibraryTrigger[];
  onAddSuggestion?: (id: string) => void;
  addingSuggestionId?: string | null;
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
  onCancel,
  saving = false,
  selectedIcon,
  onIconSelect,
  onDelete,
  selectedIds,
  onSelectedChange,
  onSelectAll,
  selection = [],
  columns = 1,
  suggestions = [],
  onAddSuggestion,
  addingSuggestionId = null,
  className,
}: TriggersLibraryProps) {
  const selectable = Boolean(onSelectedChange);
  const canSave = Boolean(name?.trim() && selectedIcon);
  const allSelected = items.length > 0 && Boolean(selectedIds && items.every((item) => selectedIds.has(item.id)));

  return (
    <Card className={cn("flex w-full min-w-0 flex-col gap-section", className)}>
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
            Add New Trigger
          </Button>
        )}
      </div>

      {state === "add" ? (
        <div className="flex flex-col gap-section">
          <Textarea
            autoSize
            label="Trigger Name"
            placeholder="Fresh-air walk"
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <EmojiPicker
            selected={selectedIcon}
            onSelect={onIconSelect}
          />
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {onQueryChange || query != null ? (
            <Input
              placeholder="Search..."
              value={query}
              onChange={(event) => onQueryChange?.(event.currentTarget.value)}
              leftIcon={<SearchIcon />}
            />
          ) : null}
          <SuggestedTriggers
            items={suggestions}
            onAdd={onAddSuggestion}
            addingId={addingSuggestionId}
          />
          {items.length === 0 ? (
            suggestions.length === 0 ? (
              <EmptyState
                className="flex-1 justify-center border-0 bg-transparent py-8"
                media={<FilesIcon size="xl" className="text-(--pp-spring-green-700)" />}
                title="No triggers yet"
                description="Add your first trigger to start building small actions that create big change over time."
              />
            ) : null
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
                    title={item.name}
                    checkbox={selectable}
                    checked={selectedIds?.has(item.id) ?? false}
                    onCheckedChange={
                      selectable ? (checked) => onSelectedChange?.(item.id, checked) : undefined
                    }
                    draggable
                    onDragStart={(event) =>
                      beginLibraryDrag(
                        event,
                        { kind: "trigger", id: item.id, name: item.name },
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
