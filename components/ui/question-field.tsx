"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Dropdown } from "./dropdown";
import { LightningIcon, TrashIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
import { Textarea } from "./textarea";

export type QuestionFieldControl = "text" | "scale";

type QuestionFieldProps = {
  title?: string;
  description?: string;
  control?: QuestionFieldControl;
  value?: string;
  onChange?: (value: string) => void;
  scaleValue?: number;
  onScaleChange?: (value: number) => void;
  max?: number;
  icon?: ReactNode;
  onDelete?: () => void;
  className?: string;
};

export function QuestionField({
  title = "Title",
  description = "description",
  control = "text",
  value,
  onChange,
  scaleValue,
  onScaleChange,
  max = 10,
  icon,
  onDelete,
  className,
}: QuestionFieldProps) {
  const numbers = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <article
      className={cn(
        "flex w-full flex-col gap-3 rounded-md border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ?? (
          <IconMark size="xs">
            <LightningIcon size={12} />
          </IconMark>
        )}
        <div className="min-w-0 flex-1">
          <Text variant="label">{title}</Text>
          <Text variant="caption" className="text-foreground-muted">
            {description}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Dropdown
            size="sm"
            value={`${scaleValue ?? 1}/${max}`}
            onChange={(next) => onScaleChange?.(Number(next.split("/")[0]))}
            options={numbers.map((number) => ({
              value: `${number}/${max}`,
              label: `${number}/${max}`,
            }))}
          />
          {onDelete ? (
            <IconButton label="Delete question" variant="danger" look="clear" size="sm" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          ) : null}
        </div>
      </div>

      {control === "text" ? (
        <Textarea
          rows={4}
          value={value}
          onChange={(event) => onChange?.(event.currentTarget.value)}
          placeholder="Write a response"
        />
      ) : (
        <div className="flex flex-wrap gap-1">
          {numbers.map((number) => {
            const selected = number === scaleValue;

            return (
              <button
                key={number}
                type="button"
                onClick={() => onScaleChange?.(number)}
                className={cn(
                  "type-label inline-flex size-9 items-center justify-center rounded-sm border",
                  selected
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-surface text-foreground hover:bg-secondary-muted",
                )}
              >
                {number}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
