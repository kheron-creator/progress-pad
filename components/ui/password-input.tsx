"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";

import { EyeIcon, EyeSlashIcon } from "./icon";
import { Input } from "./input";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "rightIcon">;

function readSelection(input: HTMLInputElement) {
  try {
    return {
      start: input.selectionStart ?? input.value.length,
      end: input.selectionEnd ?? input.value.length,
    };
  } catch {
    const length = input.value.length;
    return { start: length, end: length };
  }
}

function restoreSelection(input: HTMLInputElement, start: number, end: number) {
  try {
    input.setSelectionRange(start, end);
  } catch {
    // Safari may reject selection changes on password inputs
  }
}

export function PasswordInput({ disabled, state, ...props }: PasswordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const isDisabled = disabled || state === "disabled";

  useLayoutEffect(() => {
    const input = inputRef.current;
    const selection = selectionRef.current;
    if (!input || !selection) {
      return;
    }

    const { start, end } = selection;
    selectionRef.current = null;
    restoreSelection(input, start, end);

    const frame = requestAnimationFrame(() => restoreSelection(input, start, end));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  function toggleVisibility() {
    const input = inputRef.current;
    if (input) {
      selectionRef.current = readSelection(input);
    }
    setVisible((current) => !current);
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      disabled={disabled}
      state={state}
      type={visible ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={isDisabled}
          className="inline-flex cursor-pointer items-center justify-center rounded-sm outline-none hover:text-foreground focus-visible:text-foreground disabled:cursor-not-allowed disabled:text-foreground-disabled"
          onMouseDown={(event) => event.preventDefault()}
          onClick={toggleVisibility}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
