"use client";

import { useEffect, useId, useMemo, useState, type DragEvent } from "react";

import { TRIGGERS_PICK_COPY } from "@/lib/triggers/content";
import { readLibraryDragItems } from "@/lib/triggers/drag";

import { Button } from "./button";
import { Drawer } from "./drawer";
import { EmojiPicker } from "./emoji-picker";
import { CloseIcon, FolderIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
import { Textarea } from "./textarea";
import { TriggerDropzone, type DroppedTrigger } from "./trigger-dropzone";
import { TriggerListItem } from "./trigger-list-item";

const LG_UP = "(min-width: 64rem)";

function useLgUp() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(LG_UP);
    function update() {
      setMatches(media.matches);
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return matches;
}

type AddScenarioDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  onNameChange?: (value: string) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  selectedIcon?: string;
  onIconSelect?: (emoji: string) => void;
  libraryTriggers?: DroppedTrigger[];
  droppedTriggers?: DroppedTrigger[];
  onDropTrigger?: (item: DroppedTrigger) => void;
  onAddTriggers?: (items: DroppedTrigger[]) => void;
  pendingCount?: number;
  onAddSelected?: () => void;
  onRemoveTrigger?: (id: string) => void;
  onSave?: () => void;
  saving?: boolean;
};

export function AddScenarioDrawer({
  open,
  onOpenChange,
  name = "",
  onNameChange,
  description = "",
  onDescriptionChange,
  selectedIcon,
  onIconSelect,
  libraryTriggers = [],
  droppedTriggers = [],
  onDropTrigger,
  onAddTriggers,
  pendingCount = 0,
  onAddSelected,
  onRemoveTrigger,
  onSave,
  saving = false,
}: AddScenarioDrawerProps) {
  const titleId = useId();
  const isLgUp = useLgUp();
  const canSave = Boolean(name.trim() && selectedIcon && droppedTriggers.length > 0);
  const droppedIds = useMemo(() => new Set(droppedTriggers.map((item) => item.id)), [droppedTriggers]);
  const allChosen =
    libraryTriggers.length > 0 && libraryTriggers.every((item) => droppedIds.has(item.id));

  function close() {
    if (saving) return;
    onOpenChange(false);
  }

  function allowDrop(event: DragEvent<HTMLElement>) {
    if (!onDropTrigger) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!onDropTrigger) return;
    event.preventDefault();
    for (const item of readLibraryDragItems(event)) {
      if (item.kind !== "trigger") continue;
      onDropTrigger({ id: item.id, name: item.name });
    }
  }

  function toggleTrigger(item: DroppedTrigger, checked: boolean) {
    if (checked) {
      onDropTrigger?.(item);
      return;
    }
    onRemoveTrigger?.(item.id);
  }

  function toggleAll(selected: boolean) {
    if (selected) {
      onAddTriggers?.(libraryTriggers);
      return;
    }
    for (const item of droppedTriggers) {
      onRemoveTrigger?.(item.id);
    }
  }

  return (
    <Drawer
      modal={!isLgUp}
      open={open}
      onOpenChange={(next) => (next || !saving) && onOpenChange(next)}
      labelledBy={titleId}
    >
      <div
        className="flex h-full min-h-0 max-h-full flex-col p-2"
        onDragEnter={isLgUp ? allowDrop : undefined}
        onDragOver={isLgUp ? allowDrop : undefined}
        onDrop={isLgUp ? handleDrop : undefined}
      >
        <div className="flex items-start justify-between gap-3 p-card pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <IconMark size="lg" shape="circle" tone="primary">
              <FolderIcon />
            </IconMark>
            <div className="min-w-0">
              <Text as="h2" id={titleId} variant="cardTitle">
                Add New Scenario
              </Text>
              <Text variant="caption" className="text-foreground-muted">
                {isLgUp
                  ? "Drag triggers from your library into this panel."
                  : TRIGGERS_PICK_COPY.chooseTriggersHint}
              </Text>
            </div>
          </div>
          <IconButton label="Close" look="clear" size="md" onClick={close} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-section overflow-auto px-card py-6">
          {isLgUp ? (
            <TriggerDropzone
              compact
              alwaysShowAddSelected
              items={droppedTriggers}
              pendingCount={pendingCount}
              onAddSelected={onAddSelected}
              onDropTrigger={onDropTrigger}
              onRemove={onRemoveTrigger}
              description="Drag triggers from your library, or add the ones you've selected."
            />
          ) : (
            <div className="flex min-h-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Text variant="overline" className="font-(--pp-font-weight-bold) text-primary">
                  {TRIGGERS_PICK_COPY.chooseTriggers}
                </Text>
                {libraryTriggers.length > 0 ? (
                  <button
                    type="button"
                    className="type-caption w-fit font-(--pp-font-weight-medium) text-primary"
                    onClick={() => toggleAll(!allChosen)}
                  >
                    {allChosen ? TRIGGERS_PICK_COPY.unselectAll : TRIGGERS_PICK_COPY.selectAll}
                  </button>
                ) : null}
              </div>
              {libraryTriggers.length === 0 ? (
                <Text variant="caption" className="text-foreground-muted">
                  {TRIGGERS_PICK_COPY.chooseTriggersEmpty}
                </Text>
              ) : (
                <div className="flex max-h-[min(20rem,42vh)] min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain">
                  {libraryTriggers.map((item) => (
                    <TriggerListItem
                      key={item.id}
                      look="library"
                      title={item.name}
                      checkbox
                      checked={droppedIds.has(item.id)}
                      onCheckedChange={(checked) => toggleTrigger(item, checked)}
                      leftEmoji={item.icon}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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
          <EmojiPicker selected={selectedIcon} onSelect={onIconSelect} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-card">
          <Button size="md" variant="primary" look="outline" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={onSave} disabled={!canSave} loading={saving}>
            Save
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
