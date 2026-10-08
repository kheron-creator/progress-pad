"use client";

import { useEffect, useId, useState, type DragEvent, type ReactNode } from "react";

import { readLibraryDragItems, type LibraryDragPayload } from "@/lib/triggers/drag";
import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Divider } from "./divider";
import {
  CalendarBlankIcon,
  ClipboardIcon,
  CloseIcon,
  CopyIcon,
  InfoIcon,
  LightningIcon,
  TrashIcon,
} from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
import { Tooltip } from "./tooltip";
import { Drawer } from "./drawer";

export type DayPlanItem = {
  id: string;
  title: string;
  meta?: string;
  icon?: ReactNode;
};

type DayPlanDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  scenarios?: DayPlanItem[];
  triggers?: DayPlanItem[];
  triggerCount?: number;
  onRemoveScenario?: (id: string) => void;
  onRemoveTrigger?: (id: string) => void;
  onCreateScenario?: () => void;
  onCopyTriggers?: () => void;
  onPasteTriggers?: () => void;
  canPasteTriggers?: boolean;
  onCopyScenarios?: () => void;
  onPasteScenarios?: () => void;
  canPasteScenarios?: boolean;
  onClear?: () => void;
  onDropItems?: (items: LibraryDragPayload[]) => void;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function PlanRow({
  item,
  onRemove,
}: {
  item: DayPlanItem;
  onRemove?: () => void;
}) {
  return (
    <article className="flex min-h-(--pp-trigger-item-height) w-full items-center gap-3 rounded-md border border-border bg-surface px-(--pp-space-16) py-(--pp-space-12)">
      {item.icon}
      <div className="min-w-0 flex-1">
        <Text variant="bodySmall" className="wrap-break-word whitespace-pre-wrap font-(--pp-font-weight-medium) text-foreground">
          {item.title}
        </Text>
        {item.meta ? (
          <Text variant="caption" className="wrap-break-word whitespace-pre-wrap text-foreground-muted">
            {item.meta}
          </Text>
        ) : null}
      </div>
      {onRemove ? (
        <IconButton
          label={`Remove ${item.title}`}
          variant="danger"
          look="clear"
          size="md"
          onClick={onRemove}
        >
          <TrashIcon />
        </IconButton>
      ) : null}
    </article>
  );
}

function Hint({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-foreground-muted">
      <InfoIcon size={16} className="shrink-0 text-foreground-muted" />
      <Text as="span" variant="caption" className="text-foreground-muted">
        {children}
      </Text>
    </p>
  );
}

export function DayPlanDrawer({
  open,
  onOpenChange,
  date,
  scenarios = [],
  triggers = [],
  triggerCount,
  onRemoveScenario,
  onRemoveTrigger,
  onCreateScenario,
  onCopyTriggers,
  onPasteTriggers,
  canPasteTriggers = false,
  onCopyScenarios,
  onPasteScenarios,
  canPasteScenarios = false,
  onClear,
  onDropItems,
}: DayPlanDrawerProps) {
  const titleId = useId();
  const totalTriggers = triggerCount ?? triggers.length;
  const hasItems = scenarios.length > 0 || triggers.length > 0;
  const [dropActive, setDropActive] = useState(false);
  const [triggersCopiedFlash, setTriggersCopiedFlash] = useState(false);
  const [scenariosCopiedFlash, setScenariosCopiedFlash] = useState(false);
  const canDrop = Boolean(onDropItems);

  useEffect(() => {
    if (!open) {
      setDropActive(false);
      setTriggersCopiedFlash(false);
      setScenariosCopiedFlash(false);
    }
  }, [open]);

  useEffect(() => {
    setTriggersCopiedFlash(false);
    setScenariosCopiedFlash(false);
  }, [date]);

  useEffect(() => {
    if (!triggersCopiedFlash) return;
    const timeout = window.setTimeout(() => setTriggersCopiedFlash(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [triggersCopiedFlash]);

  useEffect(() => {
    if (!scenariosCopiedFlash) return;
    const timeout = window.setTimeout(() => setScenariosCopiedFlash(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [scenariosCopiedFlash]);

  function allowDrop(event: DragEvent<HTMLElement>) {
    if (!canDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropActive(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!canDrop || !onDropItems) return;
    event.preventDefault();
    setDropActive(false);
    const items = readLibraryDragItems(event);
    if (items.length === 0) return;
    onDropItems(items);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} labelledBy={titleId} modal={false}>
      <div
        className={cn(
          "flex h-full min-h-0 max-h-full flex-col p-2 transition-colors",
          dropActive && canDrop && "bg-primary-muted",
        )}
        onDragEnter={allowDrop}
        onDragOver={allowDrop}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDropActive(false);
        }}
        onDrop={handleDrop}
      >
        <div className="flex items-start justify-between gap-3 p-card pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <IconMark size="lg" shape="circle" tone="primary">
              <CalendarBlankIcon />
            </IconMark>
            <div className="min-w-0">
              <Text as="h2" id={titleId} variant="cardTitle">
                {formatDate(date)}
              </Text>
              <Text variant="caption" className="text-foreground-muted">
                {formatWeekday(date)}
              </Text>
            </div>
          </div>
          <IconButton label="Close" look="clear" size="md" onClick={() => onOpenChange(false)}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex items-center gap-4 px-card pb-6">
          <div className="flex items-center gap-2 text-foreground">
            <CalendarBlankIcon size={16} className="text-foreground-muted" />
            <Text variant="bodySmall">
              {scenarios.length} scenario{scenarios.length === 1 ? "" : "s"}
            </Text>
          </div>
          <span className="h-4 w-px bg-border" aria-hidden />
          <div className="flex items-center gap-2 text-foreground">
            <LightningIcon size={16} className="text-foreground-muted" />
            <Text variant="bodySmall">
              {totalTriggers} trigger{totalTriggers === 1 ? "" : "s"}
            </Text>
          </div>
        </div>

        <div className="px-card">
          <Divider />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto px-card py-6">
          <section className="flex flex-col gap-4">
            <div className="flex min-w-0 items-center gap-1">
              <Text variant="overline" className="font-(--pp-font-weight-bold) text-primary">
                Scenarios
              </Text>
              {scenarios.length > 0 && onCopyScenarios ? (
                <Tooltip content={scenariosCopiedFlash ? "Scenarios copied" : "Copy these scenarios"}>
                  <IconButton
                    label="Copy scenarios from this date"
                    look="clear"
                    size="sm"
                    onClick={() => {
                      onCopyScenarios();
                      setScenariosCopiedFlash(true);
                    }}
                  >
                    <CopyIcon size={16} />
                  </IconButton>
                </Tooltip>
              ) : null}
              {canPasteScenarios && onPasteScenarios ? (
                <Tooltip content="Paste copied scenarios">
                  <IconButton
                    label="Paste copied scenarios"
                    look="clear"
                    size="sm"
                    onClick={onPasteScenarios}
                  >
                    <ClipboardIcon size={16} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </div>
            {scenarios.length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {scenarios.map((item) => (
                    <PlanRow
                      key={item.id}
                      item={item}
                      onRemove={onRemoveScenario ? () => onRemoveScenario(item.id) : undefined}
                    />
                  ))}
                </div>
                <Hint>Removing a scenario will remove all its triggers from this date.</Hint>
              </>
            ) : (
              <Text variant="caption" className="text-foreground-muted">
                No scenarios on this date.
              </Text>
            )}
          </section>

          <Divider />

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1">
                <Text variant="overline" className="font-(--pp-font-weight-bold) text-primary">
                  Individual Triggers
                </Text>
                {triggers.length > 0 && onCopyTriggers ? (
                  <Tooltip content={triggersCopiedFlash ? "Triggers copied" : "Copy these triggers"}>
                    <IconButton
                      label="Copy triggers from this date"
                      look="clear"
                      size="sm"
                      onClick={() => {
                        onCopyTriggers();
                        setTriggersCopiedFlash(true);
                      }}
                    >
                      <CopyIcon size={16} />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {canPasteTriggers && onPasteTriggers ? (
                  <Tooltip content="Paste copied triggers">
                    <IconButton
                      label="Paste copied triggers"
                      look="clear"
                      size="sm"
                      onClick={onPasteTriggers}
                    >
                      <ClipboardIcon size={16} />
                    </IconButton>
                  </Tooltip>
                ) : null}

              </div>
              {triggers.length > 0 && onCreateScenario ? (
                <Button
                  size="sm"
                  look="outline"
                  className="h-7 min-h-7 min-w-0 shrink-0 px-2.5"
                  onClick={onCreateScenario}
                >
                  Create scenario
                </Button>
              ) : null}
            </div>
            {triggers.length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {triggers.map((item) => (
                    <PlanRow
                      key={item.id}
                      item={item}
                      onRemove={onRemoveTrigger ? () => onRemoveTrigger(item.id) : undefined}
                    />
                  ))}
                </div>
                <Hint>Removing a trigger will only remove it from this date.</Hint>
              </>
            ) : (
              <Text variant="caption" className="text-foreground-muted">
                No individual triggers on this date.
              </Text>
            )}
          </section>
        </div>

        {hasItems ? (
          <div className="flex flex-col items-center gap-4 border-t border-border p-card">
            <button
              type="button"
              className="type-label cursor-pointer text-error underline decoration-error/40 underline-offset-2"
              onClick={onClear}
            >
              Clear all from this date
            </button>
          </div>
        ) : canDrop ? (
          <div className="border-t border-border p-card">
            <Text
              variant="caption"
              className={cn(
                "text-center text-foreground-muted",
                dropActive && "font-(--pp-font-weight-medium) text-primary",
              )}
            >
              {dropActive
                ? "Drop to assign to this date"
                : "Drag triggers or scenarios here to assign them"}
            </Text>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
