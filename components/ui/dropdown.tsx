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
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: FieldSize;
  disabled?: boolean;
  className?: string;
};

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  size = "md",
  disabled = false,
  className,
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
    <Field className={className}>
      {label ? <FieldLabel htmlFor={buttonId}>{label}</FieldLabel> : null}
      <div ref={rootRef} className="relative">
        <button
          id={buttonId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            "type-body pp-control flex items-center justify-between gap-2 text-left",
            fieldSizeClass[size],
            fieldPaddingClass[size],
            fieldStateClass[disabled ? "disabled" : open ? "focus" : "default"],
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={selected ? "text-foreground" : "text-foreground-muted"}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon />
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-border bg-surface py-1 shadow-md"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      "type-body flex w-full px-3 py-2 text-left hover:bg-primary-muted",
                      isSelected ? "bg-primary-muted text-primary" : "text-foreground",
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
