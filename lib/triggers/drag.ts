import type { DragEvent } from "react";

export type LibraryDragKind = "trigger" | "scenario";

export type LibraryDragPayload = {
  kind: LibraryDragKind;
  id: string;
  name: string;
};

let activeDrag: LibraryDragPayload | null = null;

export function peekLibraryDragPayload(): LibraryDragPayload | null {
  return activeDrag;
}

export function peekTriggerDragPayload(): LibraryDragPayload | null {
  const payload = activeDrag;
  if (!payload || payload.kind === "scenario") return null;
  return payload;
}

function attachDragGhost(event: DragEvent<HTMLElement>) {
  const source = event.currentTarget;
  const rect = source.getBoundingClientRect();
  const width = `${Math.round(rect.width)}px`;
  const height = `${Math.round(rect.height)}px`;
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("draggable");
  ghost.classList.remove("w-full");
  ghost.style.cssText = [
    "position:fixed",
    `left:${Math.round(rect.left)}px`,
    `top:${Math.round(rect.top)}px`,
    `width:${width}`,
    `height:${height}`,
    `min-width:${width}`,
    `max-width:${width}`,
    `min-height:${height}`,
    `max-height:${height}`,
    "margin:0",
    "box-sizing:border-box",
    "overflow:hidden",
    "pointer-events:none",
    "z-index:-1",
    `background-color:${getComputedStyle(source).backgroundColor}`,
  ].join(";");
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, event.clientX - rect.left, event.clientY - rect.top);

  function cleanup() {
    ghost.remove();
    document.removeEventListener("dragend", cleanup);
    document.removeEventListener("drop", cleanup);
  }

  document.addEventListener("dragend", cleanup);
  document.addEventListener("drop", cleanup);
}

export function beginLibraryDrag(event: DragEvent<HTMLElement>, payload: LibraryDragPayload) {
  activeDrag = payload;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  try {
    attachDragGhost(event);
  } catch {
    /* keep the native drag image if the custom ghost fails */
  }

  function clearPayload() {
    document.removeEventListener("dragend", clearPayload);
    window.setTimeout(() => {
      activeDrag = null;
    }, 0);
  }

  document.addEventListener("dragend", clearPayload);
}

export function readLibraryDragPayload(event: DragEvent<HTMLElement>): LibraryDragPayload | null {
  const fromMemory = peekLibraryDragPayload();
  if (fromMemory) return fromMemory;
  const raw = event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LibraryDragPayload>;
    if (
      (parsed.kind === "trigger" || parsed.kind === "scenario") &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string"
    ) {
      return { kind: parsed.kind, id: parsed.id, name: parsed.name };
    }
  } catch {
    /* ignore invalid payloads */
  }
  return null;
}
