"use client";

import type { FormEvent, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
// import { DictateButton } from "./dictate-button";
import { IconMark } from "./icon-mark";
import { CheckIcon, NoteIcon, PlusIcon } from "./icon";
import { Progress } from "./progress";
import { Textarea } from "./textarea";
import { TriggerCard } from "./trigger-card";
import { WrittenItem, type WrittenItemVariant } from "./written-item";

export type WritingSectionItem = {
  id: string;
  title: string;
  notes?: string;
  checked?: boolean;
  achieved?: boolean;
  variant?: WrittenItemVariant;
};

type WritingSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tag?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  notesPlaceholder?: string;
  notesValue?: string;
  onNotesChange?: (value: string) => void;
  items?: WritingSectionItem[];
  onCheckedChange?: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
  onItemChange?: (id: string, next: { title: string; notes?: string }) => void;
  onItemDirtyChange?: (id: string, dirty: boolean) => void;
  onAdd?: (value: string, notes?: string) => void | Promise<void>;
  composer?: boolean;
  addLabel?: string;
  submitIcon?: boolean | "check";
  saving?: boolean;
  itemCheckbox?: boolean;
  itemLocked?: boolean;
  progress?: number;
  progressLabel?: string;
  accent?: string;
  className?: string;
};

export function WritingSection({
  title,
  description,
  icon,
  action,
  tag,
  placeholder = "Write a response",
  value = "",
  onChange,
  notesPlaceholder,
  notesValue = "",
  onNotesChange,
  items = [],
  onCheckedChange,
  onDelete,
  onItemChange,
  onItemDirtyChange,
  onAdd,
  composer = false,
  addLabel = "Add Entry",
  submitIcon = true,
  saving = false,
  itemCheckbox,
  itemLocked = false,
  progress,
  progressLabel,
  accent = "var(--pp-bondi-blue-400)",
  className,
}: WritingSectionProps) {
  const showNotes = Boolean(notesPlaceholder);
  const showCheckbox = itemLocked || (itemCheckbox ?? !composer);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value?.trim();
    if (!next || !onAdd || saving) {
      return;
    }

    void onAdd(next, notesValue?.trim() || undefined);
  }

  return (
    <Card className={cn("flex w-full flex-col gap-section", className)}>
      <TriggerCard
        title={title}
        description={description}
        leftIcon={
          icon ?? (
            <IconMark>
              <NoteIcon />
            </IconMark>
          )
        }
        tag={tag}
        action={action}
      />
      {progress != null ? (
        <Progress value={progress} size="md" label={progressLabel ?? `${title} progress`} />
      ) : null}
      {composer ? (
        <form
          className="flex flex-col gap-3 rounded-md border p-3"
          style={{ borderColor: accent }}
          onSubmit={handleSubmit}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Textarea
                autoSize
                value={value}
                onChange={(event) => onChange?.(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                disabled={saving}
              />
            </div>
            {/* <DictateButton
              value={value}
              onChange={onChange}
              disabled={saving}
              label="Dictate entry"
              style={{ borderColor: accent, color: accent }}
            /> */}
            <Button type="submit" size="md" disabled={!value?.trim() || saving} loading={saving} className="max-sm:hidden">
              {submitIcon === "check" ? (
                <CheckIcon size={16} weight="bold" />
              ) : submitIcon ? (
                <PlusIcon size={16} />
              ) : null}
              {addLabel}
            </Button>
          </div>
          {showNotes ? (
            <Textarea
              autoSize
              value={notesValue}
              onChange={(event) => onNotesChange?.(event.currentTarget.value)}
              placeholder={notesPlaceholder}
              aria-label={notesPlaceholder}
              disabled={saving}
            />
          ) : null}
          <Button type="submit" size="md" disabled={!value?.trim() || saving} loading={saving} className="w-full sm:hidden">
            {submitIcon === "check" ? (
              <CheckIcon size={16} weight="bold" />
            ) : submitIcon ? (
              <PlusIcon size={16} />
            ) : null}
            {addLabel}
          </Button>
        </form>
      ) : (
        <Textarea
          value={value}
          onChange={(event) => onChange?.(event.currentTarget.value)}
          placeholder={placeholder}
          rows={4}
        />
      )}
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <WrittenItem
              key={item.id}
              title={item.title}
              notes={item.notes}
              variant={
                itemLocked || (showCheckbox && (item.checked || item.achieved))
                  ? "striked"
                  : item.variant
              }
              achieved={
                itemLocked || (showCheckbox && Boolean(item.checked || item.achieved))
              }
              checkbox={showCheckbox}
              checkboxLocked={itemLocked}
              checked={
                itemLocked
                  ? true
                  : showCheckbox
                    ? Boolean(item.checked || item.achieved)
                    : item.checked
              }
              leftIcon={
                composer ? undefined : (
                  <IconMark size="xs" shape="circle">
                    <NoteIcon size={12} />
                  </IconMark>
                )
              }
              onCheckedChange={
                itemLocked ? undefined : (checked) => onCheckedChange?.(item.id, checked)
              }
              onChange={onItemChange ? (next) => onItemChange(item.id, next) : undefined}
              onDirtyChange={
                onItemDirtyChange ? (dirty) => onItemDirtyChange(item.id, dirty) : undefined
              }
              notesEditable={showNotes}
              notesPlaceholder={notesPlaceholder}
              onDelete={onDelete ? () => onDelete(item.id) : undefined}
              accent={composer ? accent : undefined}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
