/**
 * The POWERFUL framework sorts work into eight areas. An entry or mind sweep item
 * belongs to an area when its notes carry a label line such as
 * `POWERFUL: Freelancers` (several areas can be comma separated). Keeping the label
 * in the notes means no schema change, and it can be typed in the app by hand.
 */

export const POWERFUL_AREA_IDS = [
  "pipeline",
  "organising",
  "work",
  "editing",
  "refocus",
  "freelancers",
  "upskilling",
  "lifestyle",
] as const;

export type PowerfulAreaId = (typeof POWERFUL_AREA_IDS)[number];

export type PowerfulArea = {
  id: PowerfulAreaId;
  letter: string;
  label: string;
  /** Name written in the label line. */
  tag: string;
  description: string;
};

export const POWERFUL_AREAS: readonly PowerfulArea[] = [
  {
    id: "pipeline",
    letter: "P",
    label: "Pipeline",
    tag: "Pipeline",
    description: "Prospects, leads and follow-ups.",
  },
  {
    id: "organising",
    letter: "O",
    label: "Organising",
    tag: "Organising",
    description: "Workflows, systems and putting folders where they need to be.",
  },
  {
    id: "work",
    letter: "W",
    label: "Client work",
    tag: "Client work",
    description: "Work for clients.",
  },
  {
    id: "editing",
    letter: "E",
    label: "Editing",
    tag: "Editing",
    description: "Content: marketing, scriptwriting, filming and editing.",
  },
  {
    id: "refocus",
    letter: "R",
    label: "Refocus",
    tag: "Refocus",
    description: "Stepping back, resetting and choosing what matters next.",
  },
  {
    id: "freelancers",
    letter: "F",
    label: "Freelancers & finance",
    tag: "Freelancers",
    description: "Freelancers, payments, invoices and money.",
  },
  {
    id: "upskilling",
    letter: "U",
    label: "Upskilling",
    tag: "Upskilling",
    description: "Things you're learning and exploring.",
  },
  {
    id: "lifestyle",
    letter: "L",
    label: "Lifestyle",
    tag: "Lifestyle",
    description: "Home, family and errands.",
  },
];

const AREA_BY_ID = new Map(POWERFUL_AREAS.map((area) => [area.id, area]));

const ALIASES: Record<string, PowerfulAreaId> = {
  pipeline: "pipeline",
  prospects: "pipeline",
  leads: "pipeline",
  organising: "organising",
  organizing: "organising",
  organise: "organising",
  organize: "organising",
  work: "work",
  "client work": "work",
  "work for client": "work",
  "work for clients": "work",
  clients: "work",
  editing: "editing",
  edit: "editing",
  content: "editing",
  refocus: "refocus",
  freelancers: "freelancers",
  freelancer: "freelancers",
  freelance: "freelancers",
  finance: "freelancers",
  "freelancers/finance": "freelancers",
  "freelancers & finance": "freelancers",
  "freelancers and finance": "freelancers",
  "finance/freelancers": "freelancers",
  upskilling: "upskilling",
  upskill: "upskilling",
  learning: "upskilling",
  lifestyle: "lifestyle",
  life: "lifestyle",
};

const LABEL_LINE = /^\s*powerful\s*:\s*(.*)$/i;

export function powerfulArea(id: PowerfulAreaId): PowerfulArea {
  return AREA_BY_ID.get(id)!;
}

/** Resolves an area id, its label, a common alias, or its single letter. */
export function resolvePowerfulArea(value: string): PowerfulAreaId | null {
  const needle = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) {
    return null;
  }
  if (needle.length === 1) {
    return POWERFUL_AREAS.find((area) => area.letter.toLowerCase() === needle)?.id ?? null;
  }
  return (
    ALIASES[needle] ??
    POWERFUL_AREAS.find((area) => area.label.toLowerCase() === needle)?.id ??
    null
  );
}

export type ParsedAreaNotes = {
  areas: PowerfulAreaId[];
  /** The notes without the label line(s). */
  notes: string;
};

export function parseAreaNotes(notes: string | null | undefined): ParsedAreaNotes {
  const areas = new Set<PowerfulAreaId>();
  const kept: string[] = [];

  for (const line of (notes ?? "").split("\n")) {
    const match = LABEL_LINE.exec(line);
    if (!match) {
      kept.push(line);
      continue;
    }
    for (const part of match[1].split(/[,;+]/)) {
      const id = resolvePowerfulArea(part);
      if (id) {
        areas.add(id);
      }
    }
  }

  return {
    areas: POWERFUL_AREA_IDS.filter((id) => areas.has(id)),
    notes: kept.join("\n").trim(),
  };
}

/** Returns notes carrying exactly these areas, keeping the rest of the text. */
export function withAreaNotes(notes: string | null | undefined, areas: readonly PowerfulAreaId[]) {
  const parsed = parseAreaNotes(notes);
  const unique = POWERFUL_AREA_IDS.filter((id) => areas.includes(id));
  const label = unique.length
    ? `POWERFUL: ${unique.map((id) => powerfulArea(id).tag).join(", ")}`
    : "";
  return [parsed.notes, label].filter(Boolean).join("\n\n") || null;
}
