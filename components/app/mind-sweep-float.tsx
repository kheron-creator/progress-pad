"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { useSessionStore } from "@/components/app/session-store-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@/components/ui/icon";
import {
  addMindSweepItem,
  flattenMindSweepItems,
  formatIsoDate,
  frontMindSweepSortOrder,
  incompleteMindSweepItems,
  loadMindSweepByDate,
  mapMindSweepItem,
  mergeMindSweepItems,
  parseIsoDate,
  setMindSweepStatus,
  updateMindSweepItem,
  type StoredMindSweepItem,
} from "@/lib/home/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

/** How often the pop-out pulls fresh items, so changes made elsewhere (phone, PT) show up. */
const REFRESH_MS = 15_000;
const FLOAT_PATH = "/active-mind-sweep/float";
const FLOAT_SIZE = { width: 340, height: 520 };

type DocumentPictureInPicture = {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
  window: Window | null;
};

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

function shortDate(onDate: string, today: string) {
  if (onDate === today) return "";
  const date = parseIsoDate(onDate);
  if (!date) return onDate;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * The small, calm Mind Sweep list used inside the floating window.
 * Reads and writes the same session store as the main page, so both stay in step.
 */
export function MindSweepFloatPanel({ win }: { win?: Window | null }) {
  const mindSweepByDate = useSessionStore((state) => state.mindSweepByDate);
  const setMindSweepByDate = useSessionStore((state) => state.setMindSweepByDate);
  const [today, setToday] = useState(() => formatIsoDate(new Date()));
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(0);

  const openItems = useMemo(
    () => incompleteMindSweepItems(mindSweepByDate, today),
    [mindSweepByDate, today],
  );
  const doneToday = useMemo(
    () =>
      flattenMindSweepItems(mindSweepByDate).filter(
        (item) => item.status === "achieved" && item.on_date.slice(0, 10) === today,
      ),
    [mindSweepByDate, today],
  );

  const refresh = useCallback(async () => {
    setToday(formatIsoDate(new Date()));
    if (pending.current > 0) return;
    try {
      const fresh = await loadMindSweepByDate(createClient());
      if (pending.current === 0) setMindSweepByDate(fresh);
    } catch {
      // Keep showing what we have; the next refresh will try again.
    }
  }, [setMindSweepByDate]);

  useEffect(() => {
    const target = win ?? window;
    const timer = target.setInterval(() => {
      if (target.document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    const onFocus = () => void refresh();
    target.addEventListener("focus", onFocus);
    return () => {
      target.clearInterval(timer);
      target.removeEventListener("focus", onFocus);
    };
  }, [refresh, win]);

  async function run(task: () => Promise<void>, rollback: () => void, message: string) {
    pending.current += 1;
    setError(null);
    try {
      await task();
    } catch {
      rollback();
      setError(message);
    } finally {
      pending.current -= 1;
    }
  }

  function toggle(item: StoredMindSweepItem, checked: boolean) {
    const status = checked ? "achieved" : "todo";
    const previous = mindSweepByDate;
    setMindSweepByDate((current) => mapMindSweepItem(current, item.id, { status }));
    void run(
      () => setMindSweepStatus(createClient(), item.id, status),
      () => setMindSweepByDate(previous),
      "Couldn't save that tick. Try again.",
    );
  }

  function add() {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    void run(
      async () => {
        const sortOrder = frontMindSweepSortOrder(mindSweepByDate[today] ?? []);
        const row = await addMindSweepItem(createClient(), { title, onDate: today, sortOrder });
        setMindSweepByDate((current) => mergeMindSweepItems(current, [row]));
      },
      () => setDraft(title),
      "Couldn't add that. Try again.",
    );
  }

  function startEdit(item: StoredMindSweepItem) {
    setEditingId(item.id);
    setEditText(item.title);
  }

  function saveEdit(item: StoredMindSweepItem) {
    const title = editText.trim();
    setEditingId(null);
    if (!title || title === item.title) return;
    const previous = mindSweepByDate;
    setMindSweepByDate((current) => mapMindSweepItem(current, item.id, { title }));
    void run(
      () => updateMindSweepItem(createClient(), item.id, { title }),
      () => setMindSweepByDate(previous),
      "Couldn't save that change. Try again.",
    );
  }

  function onEditKey(event: KeyboardEvent<HTMLInputElement>, item: StoredMindSweepItem) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit(item);
    } else if (event.key === "Escape") {
      setEditingId(null);
    }
  }

  function row(item: StoredMindSweepItem) {
    const achieved = item.status === "achieved";
    const date = shortDate(item.on_date.slice(0, 10), today);
    return (
      <li key={item.id} className="flex items-center gap-3 py-2">
        <Checkbox
          size="lg"
          checked={achieved}
          aria-label={achieved ? `Mark "${item.title}" as not done` : `Tick off "${item.title}"`}
          onChange={(event) => toggle(item, event.currentTarget.checked)}
        />
        {editingId === item.id ? (
          <input
            autoFocus
            value={editText}
            onChange={(event) => setEditText(event.currentTarget.value)}
            onBlur={() => saveEdit(item)}
            onKeyDown={(event) => onEditKey(event, item)}
            aria-label="Edit item"
            className="type-body min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none focus:border-primary"
          />
        ) : (
          <button
            type="button"
            onClick={() => startEdit(item)}
            title="Tap to edit"
            className={cn(
              "type-body min-w-0 flex-1 cursor-text truncate text-left",
              achieved ? "text-foreground-muted line-through" : "text-foreground",
            )}
          >
            {item.title}
          </button>
        )}
        {date && editingId !== item.id ? (
          <span className="type-caption shrink-0 text-foreground-muted">{date}</span>
        ) : null}
      </li>
    );
  }

  return (
    <div className="flex h-full min-h-screen flex-col gap-3 bg-background px-4 py-4 text-foreground">
      <div className="flex items-baseline justify-between">
        <h1 className="type-label text-foreground">Mind Sweep</h1>
        <span className="type-caption text-foreground-muted">{openItems.length} open</span>
      </div>

      <form
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 focus-within:border-primary"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <PlusIcon size={16} className="shrink-0 text-foreground-muted" />
        <input
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="Add a thought…"
          aria-label="Add to Mind Sweep"
          className="type-body min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-foreground-muted"
        />
      </form>

      {error ? (
        <p role="status" className="type-caption text-error">
          {error}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {openItems.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border">{openItems.map(row)}</ul>
        ) : (
          <p className="type-caption py-6 text-center text-foreground-muted">All clear. Nice work.</p>
        )}

        {doneToday.length > 0 ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowDone((value) => !value)}
              className="type-caption flex cursor-pointer items-center gap-1 text-foreground-muted"
            >
              {doneToday.length} done today
              {showDone ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
            </button>
            {showDone ? (
              <ul className="flex flex-col divide-y divide-border">{doneToday.map(row)}</ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Copy the page's styles, fonts and theme into the floating window so it looks the same. */
function mirrorStyles(target: Window) {
  const doc = target.document;
  for (const sheet of Array.from(document.styleSheets)) {
    const owner = sheet.ownerNode as HTMLElement | null;
    if (sheet.href) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = sheet.href;
      doc.head.appendChild(link);
      continue;
    }
    try {
      const style = doc.createElement("style");
      style.textContent = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("\n");
      doc.head.appendChild(style);
    } catch {
      if (owner) doc.head.appendChild(owner.cloneNode(true));
    }
  }
  doc.documentElement.className = document.documentElement.className;
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme) doc.documentElement.setAttribute("data-theme", theme);
  doc.body.className = document.body.className;
  doc.body.style.margin = "0";
  doc.title = "Mind Sweep";
}

/**
 * "Pop out" button. In Chrome and Edge it opens an always-on-top window that floats over
 * other apps (Document Picture-in-Picture). Elsewhere it opens a small popup window.
 */
export function MindSweepPopOutButton({ className }: { className?: string }) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    return () => pipWindow?.close();
  }, [pipWindow]);

  async function open() {
    if (pipWindow) {
      pipWindow.focus();
      return;
    }

    const api = window.documentPictureInPicture;
    if (api) {
      try {
        const pip = await api.requestWindow(FLOAT_SIZE);
        mirrorStyles(pip);
        pip.addEventListener("pagehide", () => setPipWindow(null), { once: true });
        setPipWindow(pip);
        return;
      } catch {
        // Fall through to the popup window.
      }
    }

    window.open(
      FLOAT_PATH,
      "pp-mind-sweep",
      `popup,width=${FLOAT_SIZE.width},height=${FLOAT_SIZE.height}`,
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void open()}
        title="Keep your Mind Sweep floating on screen while you work"
        className={cn(
          "type-label inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-foreground hover:border-primary",
          className,
        )}
      >
        <PopOutGlyph />
        {pipWindow ? "Popped out" : "Pop out"}
      </button>
      {pipWindow ? createPortal(<MindSweepFloatPanel win={pipWindow} />, pipWindow.document.body) : null}
    </>
  );
}

function PopOutGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="3.75" width="10.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1.75h5.25V7M14 2 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
