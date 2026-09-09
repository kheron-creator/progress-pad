import type { DragEvent } from "react";

export type LibraryDragKind = "trigger" | "scenario";

export type LibraryDragPayload = {
  kind: LibraryDragKind;
  id: string;
  name: string;
};

let activeDragItems: LibraryDragPayload[] | null = null;

export function peekLibraryDragPayload(): LibraryDragPayload | null {
  return activeDragItems?.[0] ?? null;
}

export function peekTriggerDragPayload(): LibraryDragPayload | null {
  const payload = peekLibraryDragPayload();
  if (!payload || payload.kind === "scenario") return null;
  return payload;
}

function sameItem(a: LibraryDragPayload, b: LibraryDragPayload) {
  return a.kind === b.kind && a.id === b.id;
}

export function itemsForLibraryDrag(item: LibraryDragPayload, selected: LibraryDragPayload[] = []) {
  if (selected.some((entry) => sameItem(entry, item))) {
    return selected;
  }

  return [item];
}

function attachDragGhost(event: DragEvent<HTMLElement>, count: number) {
  const source = event.currentTarget;
  const rect = source.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const stack = count > 1 ? Math.min(count - 1, 2) : 0;
  const offset = 6;
  const badgePad = count > 1 ? 10 : 0;
  const styles = getComputedStyle(source);
  const ghost = document.createElement("div");
  ghost.style.cssText = [
    "position:fixed",
    `left:${Math.round(rect.left)}px`,
    `top:${Math.round(rect.top - stack * offset - badgePad)}px`,
    `width:${width + stack * offset + badgePad}px`,
    `height:${height + stack * offset + badgePad}px`,
    "margin:0",
    "box-sizing:border-box",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");

  for (let layer = stack; layer >= 1; layer -= 1) {
    const backing = document.createElement("div");
    backing.style.cssText = [
      "position:absolute",
      `left:${layer * offset}px`,
      `top:${layer * offset + badgePad}px`,
      `width:${width}px`,
      `height:${height}px`,
      `border-radius:${styles.borderRadius}`,
      `border:${styles.border}`,
      `background-color:${styles.backgroundColor}`,
      `opacity:${1 - layer * 0.18}`,
    ].join(";");
    ghost.appendChild(backing);
  }

  const card = source.cloneNode(true) as HTMLElement;
  card.removeAttribute("draggable");
  card.classList.remove("w-full");
  card.style.cssText = [
    "position:absolute",
    "left:0",
    `top:${badgePad}px`,
    `width:${width}px`,
    `height:${height}px`,
    `min-width:${width}px`,
    `max-width:${width}px`,
    `min-height:${height}px`,
    `max-height:${height}px`,
    "margin:0",
    "box-sizing:border-box",
    "overflow:hidden",
    `background-color:${styles.backgroundColor}`,
  ].join(";");
  ghost.appendChild(card);

  if (count > 1) {
    const badge = document.createElement("span");
    badge.textContent = String(count);
    badge.style.cssText = [
      "position:absolute",
      "top:0",
      "right:0",
      "z-index:1",
      "display:flex",
      "min-width:24px",
      "height:24px",
      "align-items:center",
      "justify-content:center",
      "padding:0 7px",
      "border-radius:999px",
      "background-color:var(--pp-spring-green-600)",
      "color:#fff",
      "font-family:var(--pp-font-body)",
      "font-size:var(--pp-font-size-12)",
      "font-weight:var(--pp-font-weight-semibold)",
      "line-height:1",
      "box-shadow:0 1px 2px rgb(0 0 0 / 0.16)",
    ].join(";");
    ghost.appendChild(badge);
  }

  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(
    ghost,
    event.clientX - rect.left,
    event.clientY - rect.top + stack * offset + badgePad,
  );

  function cleanup() {
    ghost.remove();
    document.removeEventListener("dragend", cleanup);
    document.removeEventListener("drop", cleanup);
  }

  document.addEventListener("dragend", cleanup);
  document.addEventListener("drop", cleanup);
}

export function beginLibraryDrag(
  event: DragEvent<HTMLElement>,
  payload: LibraryDragPayload,
  selected: LibraryDragPayload[] = [],
) {
  const items = itemsForLibraryDrag(payload, selected);
  activeDragItems = items;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", JSON.stringify({ ...payload, items }));
  try {
    attachDragGhost(event, items.length);
  } catch {
    /* keep the native drag image if the custom ghost fails */
  }

  function clearPayload() {
    document.removeEventListener("dragend", clearPayload);
    window.setTimeout(() => {
      activeDragItems = null;
    }, 0);
  }

  document.addEventListener("dragend", clearPayload);
}

function parseDragItems(raw: string): LibraryDragPayload[] {
  try {
    const parsed = JSON.parse(raw) as Partial<LibraryDragPayload> & {
      items?: Partial<LibraryDragPayload>[];
    };
    if (Array.isArray(parsed.items)) {
      const items = parsed.items.filter(isDragPayload);
      if (items.length > 0) return items;
    }
    if (isDragPayload(parsed)) {
      return [parsed];
    }
  } catch {
    /* ignore invalid payloads */
  }
  return [];
}

function isDragPayload(value: Partial<LibraryDragPayload>): value is LibraryDragPayload {
  return (
    (value.kind === "trigger" || value.kind === "scenario") &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

export function readLibraryDragItems(event: DragEvent<HTMLElement>): LibraryDragPayload[] {
  if (activeDragItems && activeDragItems.length > 0) {
    return activeDragItems;
  }

  const raw = event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text");
  if (!raw) return [];
  return parseDragItems(raw);
}

export function readLibraryDragPayload(event: DragEvent<HTMLElement>): LibraryDragPayload | null {
  return readLibraryDragItems(event)[0] ?? null;
}
