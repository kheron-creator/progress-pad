"use client";

import type { CSSProperties } from "react";

import { useSpeechToText } from "@/lib/ui/use-speech-to-text";
import { cn } from "@/lib/utils/cn";

import { Button } from "./button";
import { MicrophoneIcon, StopIcon } from "./icon";

type DictateButtonProps = {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label: string;
  labeled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function DictateButton({
  value,
  onChange,
  disabled = false,
  label,
  labeled = false,
  className,
  style,
}: DictateButtonProps) {
  const { listening, supported, toggle } = useSpeechToText({ value, onChange });
  const unavailable = !supported || !onChange;
  const actionLabel = listening ? "Stop dictation" : label;

  return (
    <Button
      type="button"
      variant="secondary"
      look={labeled ? "outline" : "icon"}
      size={labeled ? "sm" : "md"}
      aria-label={actionLabel}
      aria-pressed={listening}
      title={
        unavailable
          ? "Speech to text isn’t available in this browser"
          : listening
            ? "Stop dictation"
            : label
      }
      className={cn("shrink-0", labeled && "min-w-0 px-3", listening && "border-error text-error", className)}
      style={listening ? undefined : style}
      disabled={disabled || unavailable}
      onClick={toggle}
    >
      {listening ? <StopIcon size={labeled ? 14 : 20} /> : <MicrophoneIcon size={labeled ? 14 : 20} />}
      {labeled ? (listening ? "Stop" : "Dictate") : null}
    </Button>
  );
}
