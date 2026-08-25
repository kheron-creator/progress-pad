"use client";

import { cn } from "@/lib/utils/cn";

import { CloseIcon, SendIcon } from "./icon";
import { IconButton } from "./icon-button";
import { Input } from "./input";
import { Text } from "./text";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AssistantChatProps = {
  messages?: AssistantMessage[];
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  onClose?: () => void;
  className?: string;
};

export function AssistantChat({
  messages = [],
  value,
  onChange,
  onSend,
  onClose,
  className,
}: AssistantChatProps) {
  return (
    <aside
      className={cn(
        "flex h-[29.5rem] w-full max-w-[22.125rem] flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between bg-accent px-4 py-3 text-accent-foreground">
        <Text variant="label" className="tracking-wide text-inherit">
          PROGRESS ASSISTANT
        </Text>
        <button
          type="button"
          aria-label="Close"
          className="inline-flex size-8 items-center justify-center rounded-sm text-inherit"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {messages.map((message) => {
          const fromUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={cn("flex", fromUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-md px-3 py-2",
                  fromUser
                    ? "border border-border bg-surface text-foreground"
                    : "bg-primary-muted text-foreground",
                )}
              >
                <Text variant="bodySmall">{message.text}</Text>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Write a message"
            value={value}
            onChange={(event) => onChange?.(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSend?.();
            }}
          />
        </div>
        <IconButton label="Send" onClick={onSend}>
          <SendIcon />
        </IconButton>
      </div>
    </aside>
  );
}
