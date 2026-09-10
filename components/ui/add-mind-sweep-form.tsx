"use client";

import type { FormEvent } from "react";

import { parseIsoDate } from "@/lib/home/store";

import { Button } from "./button";
import { DatePicker } from "./date-picker";
import { CloseIcon, HeadCircuitIcon, PlusIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
import { Textarea } from "./textarea";

export type AddMindSweepPayload = {
  title: string;
  notes?: string;
  onDate: string;
};

type AddMindSweepFormProps = {
  id?: string;
  titleId?: string;
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onDate: string;
  onDateChange: (value: string) => void;
  onSave: (payload: AddMindSweepPayload) => void | Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
  captureTitle?: string;
  addLabel?: string;
  placeholder?: string;
  notesPlaceholder?: string;
};

export function AddMindSweepForm({
  id,
  titleId,
  title,
  onTitleChange,
  notes,
  onNotesChange,
  onDate,
  onDateChange,
  onSave,
  onCancel,
  saving = false,
  captureTitle = "Capture new thought / mind sweep",
  addLabel = "Save to mind sweep",
  placeholder = "Unload a thought, idea, or mental clutter...",
  notesPlaceholder = "Notes or Context (Optional)...",
}: AddMindSweepFormProps) {
  const canSave = Boolean(title.trim() && parseIsoDate(onDate) && !saving);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || !parseIsoDate(onDate) || saving) {
      return;
    }

    void onSave({
      title: nextTitle,
      notes: notes.trim() || undefined,
      onDate,
    });
  }

  return (
    <form
      id={id}
      className="flex flex-col gap-4 rounded-md border p-6"
      style={{ borderColor: "var(--pp-magenta-400)" }}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex min-w-0 items-center gap-2">
          <IconMark size="sm" look="outline" tone="accent">
            <HeadCircuitIcon />
          </IconMark>
          <Text as="h2" variant="overline" className="truncate text-accent">
            {captureTitle}
          </Text>
        </div>
        {onCancel ? (
          <IconButton
            type="button"
            label="Close"
            look="clear"
            size="sm"
            disabled={saving}
            className="text-accent hover:bg-transparent hover:text-accent"
            onClick={onCancel}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
      <Textarea
        id={titleId}
        autoSize
        value={title}
        onChange={(event) => onTitleChange(event.currentTarget.value)}
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

      <Textarea
        rows={3}
        value={notes}
        onChange={(event) => onNotesChange(event.currentTarget.value)}
        placeholder={notesPlaceholder}
        aria-label={notesPlaceholder}
        disabled={saving}
      />

      <div className="flex items-end justify-between gap-3">
        <DatePicker showLabel={false} label="Date" value={onDate} onChange={onDateChange} className="w-64 max-w-full shrink-0" />
        <div className="flex shrink-0 items-center gap-2 max-sm:hidden">
          <Button type="submit" size="md" disabled={!canSave} loading={saving}>
            {addLabel}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:hidden">
        <Button type="submit" size="md" disabled={!canSave} loading={saving} className="w-full">
          <PlusIcon size={16} />
          {addLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" look="outline" size="md" disabled={saving} className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
