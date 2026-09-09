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
  className?: string;
  style?: CSSProperties;
};

export function DictateButton({
  value,
  onChange,
  disabled = false,
  label,
  className,
  style,
}: DictateButtonProps) {
  const { listening, supported, toggle } = useSpeechToText({ value, onChange });
  const unavailable = !supported || !onChange;

  return (
    <Button
      type="button"
      variant="secondary"
      look="icon"
      size="md"
      aria-label={listening ? "Stop dictation" : label}
      aria-pressed={listening}
      title={
        unavailable
          ? "Speech to text isn’t available in this browser"
          : listening
            ? "Stop dictation"
            : label
      }
      className={cn("shrink-0", listening && "border-error text-error", className)}
      style={listening ? undefined : style}
      disabled={disabled || unavailable}
      onClick={toggle}
    >
      {listening ? <StopIcon size={20} /> : <MicrophoneIcon size={20} />}
    </Button>
  );
}
