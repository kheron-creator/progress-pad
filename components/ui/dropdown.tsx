"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { Field, FieldLabel, fieldPaddingClass, fieldSizeClass, fieldStateClass, type FieldSize } from "./field";
import { ChevronDownIcon } from "./icon";

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  label?: string;
  labelClassName?: string;
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: FieldSize;
  look?: "field" | "chip" | "pill";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Dropdown({
  label,
  labelClassName,
  options,
  value,
  onChange,
  placeholder = "Select",
  size = "md",
  look = "field",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const buttonId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <Field className={cn(look !== "field" && "w-auto!", className)}>
      {label ? (
        <FieldLabel htmlFor={buttonId} className={labelClassName}>
          {label}
        </FieldLabel>
      ) : null}
      <div ref={rootRef} className="relative">
        <button
          id={buttonId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel}
          className={
            look === "chip"
              ? "inline-flex h-auto min-h-0 cursor-pointer items-center justify-between gap-(--pp-space-4) rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-50) px-(--pp-space-16) py-(--pp-space-4) text-(length:--pp-font-size-12) font-(--pp-font-weight-semibold) leading-none text-(--pp-bondi-blue-600) disabled:cursor-not-allowed disabled:opacity-50"
              : look === "pill"
                ? cn(
                  "inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-1.5 rounded-full border border-border bg-surface px-3 text-(length:--pp-text-control-sm-size) leading-none text-foreground shadow-sm",
                  open && "border-primary",
                  disabled && "cursor-not-allowed opacity-50",
                )
                : cn(
                  "type-body pp-control flex cursor-pointer items-center justify-between gap-2 text-left",
                  fieldSizeClass[size],
                  fieldPaddingClass[size],
                  fieldStateClass[disabled ? "disabled" : open ? "focus" : "default"],
                )
          }
          onClick={() => setOpen((current) => !current)}
        >
          <span
            className={
              look === "chip" ? undefined : selected ? "text-foreground" : "text-foreground-muted"
            }
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon
            size={look === "field" ? undefined : 12}
            className={look === "pill" ? "text-foreground-muted" : undefined}
          />
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border border-border bg-surface py-1 shadow-md"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full text-left text-foreground-muted hover:bg-primary-muted",
                      look === "pill"
                        ? "px-2.5 py-1.5 text-(length:--pp-text-control-sm-size) leading-snug"
                        : "type-body px-3 py-2",
                      isSelected && "bg-primary-muted",
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
