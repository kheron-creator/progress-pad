"use client";

import { cn } from "@/lib/utils/cn";

import { ChatIcon } from "./icon";
import { Text } from "./text";

type AssistantFabProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function AssistantFab({
  label = "Progress Assistant",
  onClick,
  className,
}: AssistantFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-16 items-center gap-2 rounded-full bg-accent px-4 text-accent-foreground shadow-md",
        className,
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface text-accent">
        <ChatIcon size={18} />
      </span>
      <Text as="span" variant="label" className="text-inherit">
        {label}
      </Text>
    </button>
  );
}
