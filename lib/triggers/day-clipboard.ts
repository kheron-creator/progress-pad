export type DayClipboardKind = "trigger" | "scenario";

export type DayClipboard = {
  kind: DayClipboardKind;
  ids: string[];
};

const STORAGE_KEY = "progresspad:day-plan-clipboard";
const LEGACY_TRIGGER_KEY = "progresspad:day-trigger-clipboard";
const LEGACY_SCENARIO_KEY = "progresspad:day-scenario-clipboard";

function parseIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
    return null;
  }
  const ids = value.filter(Boolean);
  return ids.length > 0 ? [...new Set(ids)] : null;
}

function readLegacy(kind: DayClipboardKind, key: string): DayClipboard | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const ids = parseIds(JSON.parse(raw));
    if (!ids) {
      return null;
    }
    return { kind, ids };
  } catch {
    return null;
  }
}

export function readDayClipboard(): DayClipboard | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { kind?: unknown; ids?: unknown };
      if (parsed.kind === "trigger" || parsed.kind === "scenario") {
        const ids = parseIds(parsed.ids);
        if (ids) {
          return { kind: parsed.kind, ids };
        }
      }
    }
  } catch {
    // Fall through to legacy keys.
  }

  // Prefer the more recently written legacy key if both exist.
  const legacyTrigger = readLegacy("trigger", LEGACY_TRIGGER_KEY);
  const legacyScenario = readLegacy("scenario", LEGACY_SCENARIO_KEY);
  const chosen = legacyScenario ?? legacyTrigger;
  if (chosen) {
    writeDayClipboard(chosen.kind, chosen.ids);
    window.sessionStorage.removeItem(LEGACY_TRIGGER_KEY);
    window.sessionStorage.removeItem(LEGACY_SCENARIO_KEY);
  }
  return chosen;
}

export function writeDayClipboard(kind: DayClipboardKind, ids: readonly string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const next = parseIds(ids);
  window.sessionStorage.removeItem(LEGACY_TRIGGER_KEY);
  window.sessionStorage.removeItem(LEGACY_SCENARIO_KEY);

  if (!next) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ kind, ids: next }));
}
