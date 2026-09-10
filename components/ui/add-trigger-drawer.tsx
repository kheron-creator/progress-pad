"use client";

import { useId } from "react";

import { Button } from "./button";
import { Drawer } from "./drawer";
import { EmojiPicker } from "./emoji-picker";
import { CloseIcon, LightningIcon } from "./icon";
import { IconButton } from "./icon-button";
import { IconMark } from "./icon-mark";
import { Text } from "./text";
import { Textarea } from "./textarea";

type AddTriggerDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  onNameChange?: (value: string) => void;
  selectedIcon?: string;
  onIconSelect?: (emoji: string) => void;
  onSave?: () => void;
  saving?: boolean;
};

export function AddTriggerDrawer({
  open,
  onOpenChange,
  name = "",
  onNameChange,
  selectedIcon,
  onIconSelect,
  onSave,
  saving = false,
}: AddTriggerDrawerProps) {
  const titleId = useId();
  const canSave = Boolean(name.trim() && selectedIcon);

  function close() {
    if (saving) return;
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={(next) => (next || !saving) && onOpenChange(next)} labelledBy={titleId}>
      <div className="flex h-full min-h-0 max-h-full flex-col p-2">
        <div className="flex items-start justify-between gap-3 p-card pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <IconMark size="lg" shape="circle" tone="primary">
              <LightningIcon />
            </IconMark>
            <div className="min-w-0">
              <Text as="h2" id={titleId} variant="cardTitle">
                Add New Trigger
              </Text>
              <Text variant="caption" className="text-foreground-muted">
                Save it to your library.
              </Text>
            </div>
          </div>
          <IconButton label="Close" look="clear" size="md" onClick={close} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-section overflow-auto px-card py-6">
          <Textarea
            autoSize
            label="Trigger Name"
            placeholder="Fresh-air walk"
            value={name}
            onChange={(event) => onNameChange?.(event.currentTarget.value)}
          />
          <EmojiPicker selected={selectedIcon} onSelect={onIconSelect} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-card">
          <Button size="md" variant="primary" look="outline" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={onSave} disabled={!canSave} loading={saving}>
            Save
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
