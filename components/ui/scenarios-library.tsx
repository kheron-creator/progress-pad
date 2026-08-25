"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { Card } from "./card";
import { IconMark } from "./icon-mark";
import { PlusIcon, SearchIcon, LightningIcon } from "./icon";
import { Input } from "./input";
import { Text } from "./text";
import { Toast } from "./toast";
import { TriggerDropzone } from "./trigger-dropzone";
import { TriggerListItem } from "./trigger-list-item";

export type LibraryScenario = {
  id: string;
  title: string;
  meta?: string;
  icon?: ReactNode;
};

type ScenariosLibraryProps = {
  state?: "default" | "add";
  title?: string;
  items?: LibraryScenario[];
  notice?: string;
  name?: string;
  onNameChange?: (value: string) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export function ScenariosLibrary({
  state = "default",
  title = "Scenarios Library",
  items = [],
  notice,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  onAdd,
  onSave,
  onDelete,
  className,
}: ScenariosLibraryProps) {
  return (
    <Card className={cn("flex w-full max-w-[31.375rem] flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Text variant="cardTitle">{title}</Text>
        {state === "add" ? (
          <Button size="md" onClick={onSave}>
            Save
          </Button>
        ) : (
          <Button size="md" onClick={onAdd}>
            <PlusIcon size={14} />
            Add New Scenario
          </Button>
        )}
      </div>

      {state === "add" ? (
        <div className="flex flex-col gap-3">
          <TriggerDropzone description="No triggers added yet" />
          <Input
            label="Scenario Name"
            placeholder="Productive Morning"
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="Start the day with focus and clarity"
            value={description}
            onChange={(event) => onDescriptionChange?.(event.currentTarget.value)}
          />
          <Input label="Icon" placeholder="Search..." leftIcon={<SearchIcon />} readOnly />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notice ? (
            <Toast tone="success" className="shadow-none">
              {notice}
            </Toast>
          ) : null}
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <TriggerListItem
                key={item.id}
                title={item.title}
                description={item.meta}
                checkbox={false}
                leftEmoji={
                  item.icon ?? (
                    <IconMark size="xs">
                      <LightningIcon size={12} />
                    </IconMark>
                  )
                }
                onDelete={() => onDelete?.(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
