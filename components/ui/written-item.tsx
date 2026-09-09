"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

import { Checkbox } from "./checkbox";
import { IconButton } from "./icon-button";
import { CheckIcon, TrashIcon } from "./icon";
import { Tag } from "./tag";
import { Text } from "./text";
import { Textarea } from "./textarea";

export type WrittenItemVariant = "default" | "striked";

export type WrittenItemChange = {
  title: string;
  notes?: string;
};

type WrittenItemProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onChange"> & {
  title: string;
  notes?: string;
  notesPlaceholder?: string;
  notesEditable?: boolean;
  variant?: WrittenItemVariant;
  leftIcon?: ReactNode;
  achieved?: boolean;
  checkbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (next: WrittenItemChange) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onDelete?: () => void;
  accent?: string;
  checkboxLocked?: boolean;
};

const SAVE_DELAY_MS = 500;

export function WrittenItem({
  title,
  notes,
  notesPlaceholder = "Notes or Context (Optional)...",
  notesEditable = false,
  variant = "default",
  leftIcon,
  achieved = false,
  checkbox = true,
  checked,
  onCheckedChange,
  onChange,
  onDirtyChange,
  onDelete,
  accent,
  checkboxLocked = false,
  className,
  style,
  ...props
}: WrittenItemProps) {
  const isDone = Boolean(achieved || checked);
  const striked = variant === "striked" || isDone;
  const doneText = "font-(--pp-font-weight-semibold) text-(--pp-spring-green-600) line-through";
  const itemStyle = {
    ...(accent && !isDone ? { borderColor: accent, "--pp-item-accent": accent } : null),
    ...style,
  } as CSSProperties;
  const editable = Boolean(onChange);
  const savedNotes = notes ?? "";
  const [editing, setEditing] = useState(false);
  const [focusField, setFocusField] = useState<"title" | "notes">("title");
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftNotes, setDraftNotes] = useState(savedNotes);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<number>(null);
  const onChangeRef = useRef(onChange);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const titlePropRef = useRef(title);
  const notesPropRef = useRef(savedNotes);
  const notesEditableRef = useRef(notesEditable);
  const draftRef = useRef({ title: draftTitle, notes: draftNotes });

  onChangeRef.current = onChange;
  onDirtyChangeRef.current = onDirtyChange;
  titlePropRef.current = title;
  notesPropRef.current = savedNotes;
  notesEditableRef.current = notesEditable;
  draftRef.current = { title: draftTitle, notes: draftNotes };

  const dirty =
    editing &&
    (draftTitle !== title || (notesEditable && draftNotes !== savedNotes));

  useEffect(() => {
    if (!editing) {
      setDraftTitle(title);
      setDraftNotes(savedNotes);
    }
  }, [editing, savedNotes, title]);

  useEffect(() => {
    onDirtyChangeRef.current?.(dirty);
    return () => onDirtyChangeRef.current?.(false);
  }, [dirty]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!editing) {
      return;
    }

    const node = focusField === "notes" ? notesRef.current : titleRef.current;
    if (!node) {
      return;
    }

    node.focus();
    const end = node.value.length;
    node.setSelectionRange(end, end);
  }, [editing, focusField]);

  function payloadFromDraft() {
    const nextTitle = draftRef.current.title.trim() || titlePropRef.current;
    if (notesEditableRef.current) {
      return { title: nextTitle, notes: draftRef.current.notes.trim() };
    }

    return { title: nextTitle };
  }

  function hasChanges(next: WrittenItemChange) {
    if (next.title !== titlePropRef.current) {
      return true;
    }

    if (!notesEditableRef.current) {
      return false;
    }

    return (next.notes ?? "") !== notesPropRef.current;
  }

  function flushSave() {
    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const nextTitle = draftRef.current.title.trim();
    if (!nextTitle) {
      setDraftTitle(titlePropRef.current);
    }

    const next = payloadFromDraft();
    if (!hasChanges(next)) {
      return;
    }

    onChangeRef.current?.(next);
  }

  function scheduleSave() {
    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      flushSave();
    }, SAVE_DELAY_MS);
  }

  function beginEdit(field: "title" | "notes") {
    if (!editable || editing) {
      return;
    }

    setFocusField(field);
    setEditing(true);
  }

  function handleEditorBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) {
      return;
    }

    flushSave();
    setEditing(false);
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setDraftTitle(titlePropRef.current);
      setDraftNotes(notesPropRef.current);
      setEditing(false);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      flushSave();
      setEditing(false);
    }
  }

  function handleNotesKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setDraftTitle(titlePropRef.current);
      setDraftNotes(notesPropRef.current);
      setEditing(false);
    }
  }

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-md border bg-surface px-(--pp-space-16) py-(--pp-space-12)",
        editing && "items-start",
        isDone ? "border-(--pp-spring-green-600)" : accent ? undefined : "border-border",
        className,
      )}
      style={itemStyle}
      {...props}
    >
      {checkbox ? (
        <Checkbox
          size="xl"
          tone="accent"
          checked={checked ?? achieved}
          disabled={checkboxLocked}
          onChange={
            checkboxLocked ? undefined : (event) => onCheckedChange?.(event.currentTarget.checked)
          }
          aria-label={title}
          className="size-6.5! shrink-0"
          boxClassName={
            accent || isDone
              ? cn(
                "rounded-sm text-white",
                isDone
                  ? "border-transparent! bg-(--pp-spring-green-600)! peer-checked:border-transparent peer-checked:bg-(--pp-spring-green-600) peer-disabled:border-transparent! peer-disabled:bg-(--pp-spring-green-600)!"
                  : "border-(--pp-item-accent) peer-checked:border-transparent peer-checked:bg-(--pp-spring-green-600)",
              )
              : undefined
          }
        />
      ) : null}
      {leftIcon}
      {editing ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2" onBlur={handleEditorBlur}>
          <Textarea
            ref={titleRef}
            autoSize
            value={draftTitle}
            onChange={(event) => {
              setDraftTitle(event.currentTarget.value);
              scheduleSave();
            }}
            onKeyDown={handleTitleKeyDown}
            aria-label="Edit entry"
          />
          {notesEditable ? (
            <Textarea
              ref={notesRef}
              autoSize
              value={draftNotes}
              onChange={(event) => {
                setDraftNotes(event.currentTarget.value);
                scheduleSave();
              }}
              onKeyDown={handleNotesKeyDown}
              placeholder={notesPlaceholder}
              aria-label={notesPlaceholder}
            />
          ) : null}
        </div>
      ) : editable ? (
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="block w-full min-w-0 cursor-text text-left"
            onClick={() => beginEdit("title")}
          >
            <Text variant="label" className={cn("wrap-break-word whitespace-pre-wrap", striked && doneText)}>
              {title}
            </Text>
          </button>
          {notes ? (
            <button
              type="button"
              className="block w-full min-w-0 cursor-text text-left"
              onClick={() => beginEdit("notes")}
            >
              <Text
                variant="caption"
                className={cn("wrap-break-word whitespace-pre-wrap", striked ? doneText : "text-foreground-muted")}
              >
                {notes}
              </Text>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <Text variant="label" className={cn("wrap-break-word whitespace-pre-wrap", striked && doneText)}>
            {title}
          </Text>
          {notes ? (
            <Text
              variant="caption"
              className={cn("wrap-break-word whitespace-pre-wrap", striked ? doneText : "text-foreground-muted")}
            >
              {notes}
            </Text>
          ) : null}
        </div>
      )}
      {isDone ? (
        <Tag
          size="xs"
          className="shrink-0 border-transparent! bg-(--pp-spring-green-600)! text-white!"
          leftIcon={<CheckIcon size={8} weight="bold" />}
        >
          ACHIEVED
        </Tag>
      ) : null}
      {onDelete ? (
        <IconButton label={`Delete ${title}`} variant="danger" look="clear" size="md" className="shrink-0" onClick={onDelete}>
          <TrashIcon />
        </IconButton>
      ) : null}
    </article>
  );
}
