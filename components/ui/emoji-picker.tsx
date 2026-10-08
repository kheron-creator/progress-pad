"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  onSelect?: (emoji: string | undefined) => void;
  className?: string;
};

const DESKTOP_PANEL_HEIGHT = 288;
const MOBILE_PANEL_MIN = 140;
const MOBILE_PANEL_MAX = 240;

function useIsCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    function update() {
      setCompact(media.matches);
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function visiblePanelHeight(anchorBottom: number, compact: boolean) {
  if (!compact) {
    return DESKTOP_PANEL_HEIGHT;
  }

  const vv = window.visualViewport;
  const viewBottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight);
  const available = Math.floor(viewBottom - anchorBottom - 12);
  return Math.min(MOBILE_PANEL_MAX, Math.max(MOBILE_PANEL_MIN, available));
}

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
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelHeight, setPanelHeight] = useState(DESKTOP_PANEL_HEIGHT);
  const compact = useIsCompact();
  const isControlled = open !== undefined;
  const isOpen = open ?? internalOpen;
  const showPreview = !compact || !search;

  function setOpenState(next: boolean) {
    if (!isControlled) setInternalOpen(next);
  }

  function closePanel() {
    if (!isOpen) return;
    setOpenState(false);
    setSearch("");
    const active = document.activeElement;
    if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
      active.blur();
    }
  }

  const updatePanelHeight = useCallback(() => {
    const anchor = searchWrapRef.current?.getBoundingClientRect();
    if (!anchor) {
      setPanelHeight(compact ? MOBILE_PANEL_MAX : DESKTOP_PANEL_HEIGHT);
      return;
    }
    setPanelHeight(visiblePanelHeight(anchor.bottom, compact));
  }, [compact]);

  function openPanel() {
    setOpenState(true);
    queueMicrotask(() => {
      searchWrapRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      updatePanelHeight();
    });
  }

  useEffect(() => {
    if (!isOpen || isControlled) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setInternalOpen(false);
      setSearch("");
      const active = document.activeElement;
      if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
        active.blur();
      }
    }

    // Capture so drawer/dialog handlers can't swallow the outside tap.
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen, isControlled]);

  useEffect(() => {
    if (!isOpen || isControlled) return;

    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setInternalOpen(false);
      setSearch("");
    }

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [isOpen, isControlled]);

  useEffect(() => {
    if (!isOpen) return;

    searchWrapRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    updatePanelHeight();

    function onViewportChange() {
      updatePanelHeight();
    }

    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);
    window.addEventListener("resize", onViewportChange);
    return () => {
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [isOpen, updatePanelHeight]);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelHeight();
  }, [isOpen, search, compact, updatePanelHeight]);

  const listHeight = showPreview ? Math.max(MOBILE_PANEL_MIN, panelHeight - 36) : panelHeight;

  return (
    <div ref={rootRef} className={cn("relative flex w-full min-w-0 flex-col", className)}>
      <Frimousse.Root
        columns={compact ? 7 : 8}
        className="flex w-full min-w-0 flex-col gap-2"
        onEmojiSelect={({ emoji }) => {
          onSelect?.(emoji);
          closePanel();
        }}
      >
        <Field>
          {label ? <FieldLabel htmlFor={searchId}>{label}</FieldLabel> : null}
          <div
            ref={searchWrapRef}
            className="relative"
            onMouseDown={(event) => {
              // Re-open even when the input is already focused (common after a selection).
              if (!isOpen) {
                event.preventDefault();
                const input = searchWrapRef.current?.querySelector("input");
                input?.focus();
                openPanel();
              }
            }}
          >
            <Frimousse.Search
              id={searchId}
              type="text"
              placeholder={selected && !search ? "" : placeholder}
              value={search}
              autoComplete="off"
              enterKeyHint="search"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              onFocus={openPanel}
              onClick={openPanel}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                openPanel();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpenState(false);
                  event.currentTarget.blur();
                  return;
                }
                // With an icon selected and no search text, Delete/Backspace clears it.
                if (
                  (event.key === "Backspace" || event.key === "Delete") &&
                  !search &&
                  selected
                ) {
                  event.preventDefault();
                  onSelect?.(undefined);
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
          <div
            className={cn(
              "w-full overflow-hidden rounded-md border border-border bg-surface shadow-md",
              // Keep in document flow on compact so drawer overflow doesn't clip results.
              compact ? "relative z-10" : "absolute top-full left-0 z-30 mt-1",
            )}
          >
            <Frimousse.Viewport
              className="relative w-full outline-hidden"
              style={{ height: listHeight }}
            >
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
                className={cn("w-full select-none", search ? "pb-1" : "pb-1.5")}
                components={{
                  CategoryHeader: ({ category, ...props }) => (
                    <div
                      className={cn(
                        "w-full bg-surface px-3",
                        search ? "pt-1.5 pb-1" : "pt-3 pb-2",
                      )}
                      {...props}
                    >
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
                        "inline-flex min-h-9 min-w-0 flex-1 items-center justify-center rounded-sm border border-transparent text-lg hover:bg-background-subtle data-active:bg-background-subtle sm:min-h-8",
                        selected === emoji.emoji && "border-border-focus bg-background-subtle",
                      )}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                }}
              />
            </Frimousse.Viewport>
            {showPreview ? (
              <Frimousse.ActiveEmoji>
                {({ emoji }) => (
                  <div className="flex min-h-9 shrink-0 items-center gap-2 bg-background-subtle px-3 py-1.5">
                    <Text variant="caption" className="truncate text-foreground-muted">
                      {emoji ? `${emoji.emoji}  ${emoji.label}` : "Search by name"}
                    </Text>
                  </div>
                )}
              </Frimousse.ActiveEmoji>
            ) : null}
          </div>
        ) : null}
      </Frimousse.Root>
    </div>
  );
}
