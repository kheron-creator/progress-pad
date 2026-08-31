"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EmojiPicker as Frimousse } from "frimousse";

import { cn } from "@/lib/utils/cn";

import { Field, FieldLabel, fieldSizeClass, fieldStateClass } from "./field";
import { SearchIcon } from "./icon";
import { Text } from "./text";

type EmojiPickerProps = {
  open?: boolean;
  label?: string;
  placeholder?: string;
  selected?: string;
  onSelect?: (emoji: string) => void;
  className?: string;
};

export function EmojiPicker({
  open,
  label = "Icon",
  placeholder = "Select an Icon",
  selected,
  onSelect,
  className,
}: EmojiPickerProps) {
  const searchId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isControlled = open !== undefined;
  const isOpen = open ?? internalOpen;

  function setOpenState(next: boolean) {
    if (!isControlled) setInternalOpen(next);
  }

  useEffect(() => {
    if (!isOpen || isControlled) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setInternalOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, isControlled]);

  return (
    <div ref={rootRef} className={cn("flex w-full min-w-0 flex-col", className)}>
      <Frimousse.Root
        columns={8}
        className="flex w-full min-w-0 flex-col gap-2"
        onEmojiSelect={({ emoji }) => {
          onSelect?.(emoji);
          setSearch("");
          setOpenState(false);
        }}
      >
        <Field>
          {label ? <FieldLabel htmlFor={searchId}>{label}</FieldLabel> : null}
          <div className="relative">
            <Frimousse.Search
              id={searchId}
              type="text"
              placeholder={selected && !search ? "" : placeholder}
              value={search}
              autoComplete="off"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              onFocus={() => setOpenState(true)}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setOpenState(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpenState(false);
                  event.currentTarget.blur();
                }
              }}
              className={cn(
                "type-body pp-control pr-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
                selected ? "pl-10" : "pl-3",
                !search && "caret-transparent",
                fieldSizeClass.md,
                fieldStateClass.default,
              )}
            />
            {selected ? (
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg leading-none"
              >
                {selected}
              </span>
            ) : null}
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground-muted">
              <SearchIcon />
            </span>
          </div>
        </Field>
        {isOpen ? (
          <div className="w-full overflow-hidden rounded-md border border-border bg-surface">
            <Frimousse.Viewport className="relative h-72 w-full outline-hidden">
              <Frimousse.Loading className="absolute inset-0 flex items-center justify-center">
                <Text variant="caption" className="text-foreground-muted">
                  Loading…
                </Text>
              </Frimousse.Loading>
              <Frimousse.Empty className="absolute inset-0 flex items-center justify-center">
                {({ search: needle }) => (
                  <Text variant="caption" className="text-foreground-muted">
                    {needle ? `No emoji found for “${needle}”` : "No emoji found."}
                  </Text>
                )}
              </Frimousse.Empty>
              <Frimousse.List
                className="w-full select-none pb-1.5"
                components={{
                  CategoryHeader: ({ category, ...props }) => (
                    <div className="w-full bg-surface px-3 pt-3 pb-2" {...props}>
                      <Text variant="overline" className="text-foreground-muted">
                        {category.label.toUpperCase()}
                      </Text>
                    </div>
                  ),
                  Row: ({ children, ...props }) => (
                    <div className="flex w-full scroll-my-1.5 px-1.5 py-0.5" {...props}>
                      {children}
                    </div>
                  ),
                  Emoji: ({ emoji, ...props }) => (
                    <button
                      {...props}
                      className={cn(
                        "inline-flex min-h-8 min-w-0 flex-1 items-center justify-center rounded-sm border border-transparent text-lg hover:bg-background-subtle data-active:bg-background-subtle",
                        selected === emoji.emoji && "border-border-focus bg-background-subtle",
                      )}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                }}
              />
            </Frimousse.Viewport>
            <Frimousse.ActiveEmoji>
              {({ emoji }) => (
                <div className="flex min-h-9 items-center gap-2 bg-background-subtle px-3 py-1.5">
                  <Text variant="caption" className="truncate text-foreground-muted">
                    {emoji ? `${emoji.emoji}  ${emoji.label}` : "Search by name"}
                  </Text>
                </div>
              )}
            </Frimousse.ActiveEmoji>
          </div>
        ) : null}
      </Frimousse.Root>
    </div>
  );
}
