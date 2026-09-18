"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { IconMark } from "./icon-mark";
import { CheckIcon, DragHandleIcon, NoteIcon, PlusIcon } from "./icon";
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
  dateLabel?: string;
  dateValue?: string;
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
  onItemDateChange?: (id: string, value: string) => void;
  onItemDirtyChange?: (id: string, dirty: boolean) => void;
  onReorder?: (orderedIds: string[]) => void;
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

type SortableItemProps = {
  item: WritingSectionItem;
  showCheckbox: boolean;
  itemLocked: boolean;
  showNotes: boolean;
  notesPlaceholder?: string;
  composer: boolean;
  accent: string;
  sortable: boolean;
  onCheckedChange?: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
  onItemChange?: (id: string, next: { title: string; notes?: string }) => void;
  onItemDateChange?: (id: string, value: string) => void;
  onItemDirtyChange?: (id: string, dirty: boolean) => void;
};

function WritingItemRow({
  item,
  showCheckbox,
  itemLocked,
  showNotes,
  notesPlaceholder,
  composer,
  accent,
  dragHandle,
  onCheckedChange,
  onDelete,
  onItemChange,
  onItemDateChange,
  onItemDirtyChange,
}: Omit<SortableItemProps, "sortable"> & { dragHandle?: ReactNode }) {
  return (
    <WrittenItem
      title={item.title}
      notes={item.notes}
      variant={
        itemLocked || (showCheckbox && (item.checked || item.achieved))
          ? "striked"
          : item.variant
      }
      achieved={itemLocked || (showCheckbox && Boolean(item.checked || item.achieved))}
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
      dragHandle={dragHandle}
      onCheckedChange={
        itemLocked ? undefined : (checked) => onCheckedChange?.(item.id, checked)
      }
      onChange={onItemChange ? (next) => onItemChange(item.id, next) : undefined}
      onDirtyChange={
        onItemDirtyChange ? (dirty) => onItemDirtyChange(item.id, dirty) : undefined
      }
      dateLabel={item.dateLabel}
      dateValue={item.dateValue}
      onDateChange={
        onItemDateChange && item.dateValue
          ? (value) => onItemDateChange(item.id, value)
          : undefined
      }
      notesEditable={showNotes}
      notesPlaceholder={notesPlaceholder}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      accent={composer ? accent : undefined}
    />
  );
}

function SortableWritingItem(props: SortableItemProps) {
  const { item, sortable } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !sortable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "relative z-10 opacity-90")}
    >
      <WritingItemRow
        {...props}
        dragHandle={
          sortable ? (
            <button
              type="button"
              className="inline-flex size-6.5 shrink-0 cursor-grab items-center justify-center rounded-sm text-foreground-muted hover:bg-background-subtle hover:text-foreground active:cursor-grabbing"
              aria-label={`Reorder ${item.title}`}
              {...attributes}
              {...listeners}
            >
              <DragHandleIcon size={16} />
            </button>
          ) : undefined
        }
      />
    </div>
  );
}

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
  onItemDateChange,
  onItemDirtyChange,
  onReorder,
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
  const dndId = useId();
  const [sortableReady, setSortableReady] = useState(false);
  const showNotes = Boolean(notesPlaceholder);
  const showCheckbox = itemLocked || (itemCheckbox ?? !composer);
  const sortable = sortableReady && Boolean(onReorder) && items.length > 1;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setSortableReady(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value?.trim();
    if (!next || !onAdd || saving) {
      return;
    }

    void onAdd(next, notesValue?.trim() || undefined);
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!onReorder) {
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(arrayMove(items, oldIndex, newIndex).map((item) => item.id));
  }

  const list = (
    <div className="flex flex-col gap-3">
      {items.map((item) =>
        sortable ? (
          <SortableWritingItem
            key={item.id}
            item={item}
            showCheckbox={showCheckbox}
            itemLocked={itemLocked}
            showNotes={showNotes}
            notesPlaceholder={notesPlaceholder}
            composer={composer}
            accent={accent}
            sortable={sortable}
            onCheckedChange={onCheckedChange}
            onDelete={onDelete}
            onItemChange={onItemChange}
            onItemDateChange={onItemDateChange}
            onItemDirtyChange={onItemDirtyChange}
          />
        ) : (
          <WritingItemRow
            key={item.id}
            item={item}
            showCheckbox={showCheckbox}
            itemLocked={itemLocked}
            showNotes={showNotes}
            notesPlaceholder={notesPlaceholder}
            composer={composer}
            accent={accent}
            onCheckedChange={onCheckedChange}
            onDelete={onDelete}
            onItemChange={onItemChange}
            onItemDateChange={onItemDateChange}
            onItemDirtyChange={onItemDirtyChange}
          />
        ),
      )}
    </div>
  );

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
        sortable ? (
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {list}
            </SortableContext>
          </DndContext>
        ) : (
          list
        )
      ) : null}
    </Card>
  );
}
