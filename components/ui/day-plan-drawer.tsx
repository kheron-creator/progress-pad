"use client";

import { useId, type ReactNode } from "react";

import { Divider } from "./divider";
import { CalendarBlankIcon, CloseIcon, InfoIcon, LightningIcon, TrashIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
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
  onAdd?: () => void;
  onClear?: () => void;
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
        <Text variant="bodySmall" className="truncate font-(--pp-font-weight-medium) text-foreground">
          {item.title}
        </Text>
        {item.meta ? (
          <Text variant="caption" className="truncate text-foreground-muted">
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
  onClear,
}: DayPlanDrawerProps) {
  const titleId = useId();
  const totalTriggers = triggerCount ?? triggers.length;
  const hasItems = scenarios.length > 0 || triggers.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} labelledBy={titleId}>
      <div className="flex h-full min-h-0 flex-col">
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
            <Text variant="overline" className="font-(--pp-font-weight-bold) text-primary">
              Scenarios
            </Text>
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
            <Text variant="overline" className="font-(--pp-font-weight-bold) text-primary">
              Individual Triggers
            </Text>
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

        <div className="flex flex-col items-center gap-4 border-t border-border p-card">
          {hasItems ? (
            <button
              type="button"
              className="type-label cursor-pointer text-error underline decoration-error/40 underline-offset-2"
              onClick={onClear}
            >
              Clear all from this date
            </button>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
}
