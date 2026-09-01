"use client";

import { useEffect, useState, type DragEvent, type ReactNode } from "react";

import { peekTriggerDragPayload } from "@/lib/triggers/drag";
import { cn } from "@/lib/utils/cn";

import { CheckIcon, CloseIcon, DragHandleIcon } from "./icon";
import { Divider } from "./divider";
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
  onRemove?: (id: string) => void;
  onDropTrigger?: (item: DroppedTrigger) => void;
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
};

export function TriggerDropzone({
  state = "default",
  items = [],
  onRemove,
  onDropTrigger,
  className,
  icon,
  title,
  description,
}: TriggerDropzoneProps) {
  const count = items.length;
  const added = state === "added" || count > 0;
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

  function readDroppedTrigger(event: DragEvent<HTMLDivElement>): DroppedTrigger | null {
    const fromMemory = peekTriggerDragPayload();
    if (fromMemory) return fromMemory;
    const raw = event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<DroppedTrigger>;
      if (typeof parsed.id === "string" && typeof parsed.name === "string") {
        return { id: parsed.id, name: parsed.name };
      }
    } catch {
      /* ignore invalid payloads */
    }
    return null;
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!onDropTrigger) return;
    event.preventDefault();
    setDragging(false);
    const item = readDroppedTrigger(event);
    if (!item) return;
    onDropTrigger(item);
  }

  return (
    <div
      role="region"
      aria-label={added ? `${count} triggers added` : "Drop triggers here"}
      onDragEnter={allowDrop}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      className={cn(
        "flex w-full flex-col rounded-lg border-2 border-dashed border-primary",
        highlight ? "bg-primary-muted" : "bg-surface",
        added ? "gap-4 px-4 py-5" : "gap-2.5 px-4 py-15",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        {icon ??
          (added ? (
            <IconMark size="lg" shape="circle" tone="primary">
              <CheckIcon weight="bold" />
            </IconMark>
          ) : null)}
        <div className="flex flex-col items-center gap-1">
          <Text variant="sectionTitle" className="text-primary">
            {title ??
              (emptyCopy
                ? "Drop Triggers here"
                : `${count} Trigger${count === 1 ? "" : "s"} Added`)}
          </Text>
          <Text variant="caption" className="text-foreground">
            {emptyCopy
              ? (description ?? "to create a new scenario")
              : "Review and save your scenario"}
          </Text>
        </div>
      </div>
      {added && items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-(--pp-trigger-item-height) items-center gap-3 rounded-md border border-border bg-(--pp-grey-25) px-(--pp-space-16) py-(--pp-space-12) in-data-[theme=dark]:bg-background-subtle"
            >
              <span className="text-foreground-muted" aria-hidden>
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
        <Divider label="Drag more triggers here to add them" />
      ) : null}
    </div>
  );
}
