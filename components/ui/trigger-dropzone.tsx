"use client";

import { useEffect, useState, type DragEvent, type ReactNode } from "react";

import { TRIGGERS_PICK_COPY, countLabel } from "@/lib/triggers/content";
import { readLibraryDragItems } from "@/lib/triggers/drag";
import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Divider } from "./divider";
import { CheckIcon, CloseIcon, DragHandleIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";

export type DroppedTrigger = {
  id: string;
  name: string;
  icon?: ReactNode;
};

type TriggerDropzoneProps = {
  state?: "default" | "added";
  items?: DroppedTrigger[];
  pendingCount?: number;
  onAddSelected?: () => void;
  onRemove?: (id: string) => void;
  onDropTrigger?: (item: DroppedTrigger) => void;
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  id?: string;
};

export function TriggerDropzone({
  state = "default",
  items = [],
  pendingCount = 0,
  onAddSelected,
  onRemove,
  onDropTrigger,
  className,
  icon,
  title,
  description,
  id,
}: TriggerDropzoneProps) {
  const count = items.length;
  const added = state === "added" || count > 0;
  const canAddSelected = pendingCount > 0 && Boolean(onAddSelected);
  const [dragging, setDragging] = useState(false);
  const highlight = dragging && Boolean(onDropTrigger);
  const emptyCopy = !added;

  useEffect(() => {
    if (!onDropTrigger) return;

    function start() {
      setDragging(true);
    }

    function end() {
      setDragging(false);
    }

    document.addEventListener("dragstart", start);
    document.addEventListener("dragend", end);
    document.addEventListener("drop", end);
    return () => {
      document.removeEventListener("dragstart", start);
      document.removeEventListener("dragend", end);
      document.removeEventListener("drop", end);
    };
  }, [onDropTrigger]);

  function allowDrop(event: DragEvent<HTMLDivElement>) {
    if (!onDropTrigger) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function readDroppedTriggers(event: DragEvent<HTMLDivElement>): DroppedTrigger[] {
    return readLibraryDragItems(event)
      .filter((item) => item.kind === "trigger")
      .map((item) => ({ id: item.id, name: item.name }));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!onDropTrigger) return;
    event.preventDefault();
    setDragging(false);
    for (const item of readDroppedTriggers(event)) {
      onDropTrigger(item);
    }
  }

  const heading =
    title ??
    (emptyCopy
      ? TRIGGERS_PICK_COPY.selectedTriggers(pendingCount)
      : `${countLabel(count, "Trigger")} Added`);

  return (
    <div
      id={id}
      role="region"
      aria-label={added ? `${countLabel(count, "trigger")} added` : "Add triggers to this scenario"}
      onDragEnter={allowDrop}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      className={cn(
        "flex w-full flex-col rounded-lg border-2 border-dashed border-primary px-4",
        highlight ? "bg-primary-muted" : "bg-surface",
        "max-lg:py-5",
        added
          ? "gap-4 py-5 max-lg:gap-2"
          : "gap-2.5 py-15 max-lg:h-52 max-lg:justify-center",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-2.5 text-center max-lg:gap-1">
        {icon ??
          (added ? (
            <IconMark size="lg" shape="circle" tone="primary" className="max-lg:hidden">
              <CheckIcon weight="bold" />
            </IconMark>
          ) : null)}
        <div className="flex flex-col items-center gap-1 max-w-88 my-2">
          <Text variant="sectionTitle" className="text-primary">
            {emptyCopy && !canAddSelected && !title ? (
              <>
                <span className="lg:hidden">{TRIGGERS_PICK_COPY.dropzoneEmptyTitle}</span>
                <span className="hidden lg:inline">{TRIGGERS_PICK_COPY.dropzoneEmptyTitle}</span>
              </>
            ) : (
              heading
            )}
          </Text>
          <Text variant="caption" className="text-foreground">
            {emptyCopy
              ? (description ?? (
                <>
                  <span className="lg:hidden">{TRIGGERS_PICK_COPY.dropzoneEmptyDescription}</span>
                  <span className="hidden lg:inline">{TRIGGERS_PICK_COPY.dropzoneDragHint}</span>
                </>
              ))
              : TRIGGERS_PICK_COPY.dropzoneAddedDescription}
          </Text>
        </div>
        {onAddSelected && (emptyCopy || canAddSelected) ? (
          <Button
            size="md"
            className="lg:hidden"
            disabled={!canAddSelected}
            onClick={onAddSelected}
          >
            {TRIGGERS_PICK_COPY.addTriggers(pendingCount)}
          </Button>
        ) : emptyCopy ? (
          <div className="min-h-(--pp-control-height-md) lg:hidden" aria-hidden />
        ) : null}
      </div>
      {added && items.length > 0 ? (
        <div className="flex min-h-(--pp-trigger-item-height) flex-1 flex-col gap-2 overflow-y-auto max-lg:max-h-[calc(var(--pp-trigger-item-height)*3+0.5rem*2)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-(--pp-trigger-item-height) items-center gap-3 rounded-md border border-border bg-(--pp-grey-25) px-(--pp-space-16) py-(--pp-space-12) in-data-[theme=dark]:bg-background-subtle"
            >
              <span className="hidden text-foreground-muted pointer-fine:inline-flex" aria-hidden>
                <DragHandleIcon />
              </span>
              {item.icon}
              <Text
                variant="bodySmall"
                className="min-w-0 flex-1 truncate font-(--pp-font-weight-medium) text-foreground"
              >
                {item.name}
              </Text>
              <IconButton
                label={`Remove ${item.name}`}
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
      {added ? (
        <Divider className="shrink-0" label={TRIGGERS_PICK_COPY.dropzoneMore} />
      ) : null}
    </div>
  );
}
