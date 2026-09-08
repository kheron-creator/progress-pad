import type { CheckInTime, OnboardingDraft } from "./draft";

export const intentOptions = [
  { id: "getting-organized", label: "Getting organized" },
  { id: "building-better-habits", label: "Building better habits" },
  { id: "staying-consistent", label: "Staying consistent" },
  { id: "feeling-less-overwhelmed", label: "Feeling less overwhelmed" },
  { id: "managing-workload", label: "Managing my workload" },
  { id: "keeping-track", label: "Keeping track of my progress" },
  { id: "figuring-out", label: "Figuring out what I want" },
  { id: "something-else-intent", label: "Something else" },
] as const;

export const spaceOptions = [
  { id: "getting-things-done", label: "Getting things done" },
  { id: "spending-time", label: "Spending time with people" },
  { id: "mental-wellbeing", label: "Looking after my mental wellbeing" },
  { id: "relationships", label: "Relationships" },
  { id: "taking-care", label: "Taking care of myself" },
  { id: "personal-growth", label: "Personal growth" },
  { id: "studying", label: "Studying / Learning" },
  { id: "rest-and-balance", label: "Rest and balance" },
] as const;

export const routineOptions = [
  { id: "student", label: "Student" },
  { id: "working-full-time", label: "Working full-time" },
  { id: "working-part-time", label: "Working part-time" },
  { id: "self-employed", label: "Self-employed / Freelancing" },
  { id: "in-transition", label: "Between jobs / In transition" },
  { id: "caring-for-others", label: "Caring for others / At home" },
  { id: "taking-a-break", label: "Taking a break / Focusing on myself" },
  { id: "something-else-routine", label: "Something else" },
] as const;

export type TriggerOption = {
  id: string;
  label: string;
  emoji: string;
  intents: readonly string[];
  spaces: readonly string[];
  routines: readonly string[];
};

export const triggerOptions: readonly TriggerOption[] = [
  {
    id: "plan-tomorrow",
    label: "Plan tomorrow",
    emoji: "🗓️",
    intents: ["getting-organized", "keeping-track", "figuring-out"],
    spaces: ["getting-things-done", "personal-growth"],
    routines: ["working-full-time", "working-part-time", "self-employed", "student", "in-transition"],
  },
  {
    id: "check-calendar",
    label: "Check my calendar",
    emoji: "📅",
    intents: ["getting-organized", "managing-workload", "keeping-track"],
    spaces: ["getting-things-done"],
    routines: ["working-full-time", "working-part-time", "self-employed", "student"],
  },
  {
    id: "review-unfinished",
    label: "Review what's unfinished",
    emoji: "📋",
    intents: ["getting-organized", "managing-workload", "keeping-track"],
    spaces: ["getting-things-done"],
    routines: ["working-full-time", "working-part-time", "self-employed", "student"],
  },
  {
    id: "take-a-break",
    label: "Take a proper break",
    emoji: "☕️",
    intents: ["feeling-less-overwhelmed", "staying-consistent"],
    spaces: ["rest-and-balance", "mental-wellbeing", "taking-care"],
    routines: ["working-full-time", "working-part-time", "taking-a-break", "caring-for-others"],
  },
  {
    id: "go-for-a-walk",
    label: "Go for a walk",
    emoji: "🚶",
    intents: ["building-better-habits", "feeling-less-overwhelmed"],
    spaces: ["mental-wellbeing", "taking-care", "rest-and-balance"],
    routines: ["taking-a-break", "working-full-time", "working-part-time"],
  },
  {
    id: "drink-water",
    label: "Drink enough water",
    emoji: "💧",
    intents: ["building-better-habits"],
    spaces: ["taking-care"],
    routines: [],
  },
  {
    id: "work-on-assignment",
    label: "Work on my assignment",
    emoji: "📝",
    intents: ["managing-workload", "staying-consistent"],
    spaces: ["studying", "getting-things-done"],
    routines: ["student"],
  },
  {
    id: "study-30",
    label: "Study for 30 minutes",
    emoji: "📚",
    intents: ["staying-consistent", "building-better-habits"],
    spaces: ["studying", "personal-growth"],
    routines: ["student"],
  },
  {
    id: "hardest-task-first",
    label: "Start my hardest task first",
    emoji: "🚩",
    intents: ["managing-workload", "getting-organized"],
    spaces: ["getting-things-done"],
    routines: ["working-full-time", "working-part-time", "self-employed"],
  },
  {
    id: "tidy-workspace",
    label: "Tidy my workspace",
    emoji: "🧹",
    intents: ["getting-organized", "feeling-less-overwhelmed"],
    spaces: ["getting-things-done", "taking-care"],
    routines: ["working-full-time", "self-employed", "student"],
  },
  {
    id: "reflect-on-today",
    label: "Reflect on today",
    emoji: "💡",
    intents: ["keeping-track", "figuring-out", "feeling-less-overwhelmed"],
    spaces: ["personal-growth", "mental-wellbeing"],
    routines: ["taking-a-break", "in-transition"],
  },
  {
    id: "eat-healthy",
    label: "Eat healthy",
    emoji: "🍎",
    intents: ["building-better-habits"],
    spaces: ["taking-care"],
    routines: ["caring-for-others", "taking-a-break"],
  },
  {
    id: "message-someone",
    label: "Message someone I care about",
    emoji: "💬",
    intents: [],
    spaces: ["spending-time", "relationships"],
    routines: ["caring-for-others"],
  },
  {
    id: "plan-time-together",
    label: "Plan time with someone",
    emoji: "🫶",
    intents: [],
    spaces: ["spending-time", "relationships"],
    routines: ["caring-for-others"],
  },
  {
    id: "check-in-on-someone",
    label: "Check in on someone",
    emoji: "🤍",
    intents: [],
    spaces: ["relationships", "spending-time"],
    routines: ["caring-for-others"],
  },
  {
    id: "five-breaths",
    label: "Take five slow breaths",
    emoji: "🌬️",
    intents: ["feeling-less-overwhelmed"],
    spaces: ["mental-wellbeing", "taking-care", "rest-and-balance"],
    routines: ["taking-a-break"],
  },
  {
    id: "phone-down",
    label: "Put my phone away for 20 minutes",
    emoji: "📵",
    intents: ["feeling-less-overwhelmed", "building-better-habits"],
    spaces: ["mental-wellbeing", "rest-and-balance"],
    routines: ["taking-a-break"],
  },
  {
    id: "write-a-few-lines",
    label: "Write a few lines",
    emoji: "📓",
    intents: ["figuring-out", "keeping-track"],
    spaces: ["personal-growth", "mental-wellbeing"],
    routines: ["in-transition", "taking-a-break"],
  },
  {
    id: "one-priority",
    label: "Do my one priority",
    emoji: "🎯",
    intents: ["managing-workload", "getting-organized", "feeling-less-overwhelmed"],
    spaces: ["getting-things-done"],
    routines: ["working-full-time", "working-part-time", "self-employed", "in-transition"],
  },
  {
    id: "one-next-step",
    label: "Take one next step",
    emoji: "➡️",
    intents: ["figuring-out", "feeling-less-overwhelmed"],
    spaces: ["personal-growth", "getting-things-done"],
    routines: ["in-transition"],
  },
  {
    id: "read-10",
    label: "Read for 10 minutes",
    emoji: "📖",
    intents: ["building-better-habits", "staying-consistent"],
    spaces: ["personal-growth", "studying"],
    routines: ["student", "taking-a-break"],
  },
  {
    id: "stretch-5",
    label: "Stretch for 5 minutes",
    emoji: "🧘",
    intents: ["building-better-habits", "feeling-less-overwhelmed"],
    spaces: ["taking-care", "rest-and-balance", "mental-wellbeing"],
    routines: ["taking-a-break", "working-full-time"],
  },
  {
    id: "review-notes",
    label: "Review today's notes",
    emoji: "📑",
    intents: ["staying-consistent", "keeping-track"],
    spaces: ["studying"],
    routines: ["student"],
  },
  {
    id: "focused-work",
    label: "Do 25 minutes of focused work",
    emoji: "⏱️",
    intents: ["managing-workload", "staying-consistent"],
    spaces: ["getting-things-done", "studying"],
    routines: ["working-full-time", "working-part-time", "self-employed", "student"],
  },
  {
    id: "get-daylight",
    label: "Get a few minutes of daylight",
    emoji: "☀️",
    intents: ["building-better-habits", "feeling-less-overwhelmed"],
    spaces: ["taking-care", "mental-wellbeing", "rest-and-balance"],
    routines: ["taking-a-break", "working-full-time"],
  },
  {
    id: "cook-a-meal",
    label: "Cook a simple meal",
    emoji: "🍳",
    intents: ["building-better-habits"],
    spaces: ["taking-care"],
    routines: ["caring-for-others", "taking-a-break", "self-employed"],
  },
];

const ONBOARDING_TRIGGER_COUNT = 12;
const FALLBACK_TRIGGER_IDS = [
  "plan-tomorrow",
  "drink-water",
  "take-a-break",
  "go-for-a-walk",
  "one-priority",
  "reflect-on-today",
  "tidy-workspace",
  "eat-healthy",
  "message-someone",
  "five-breaths",
  "focused-work",
  "write-a-few-lines",
] as const;

const INTENT_WILDCARDS = new Set(["something-else-intent"]);
const ROUTINE_WILDCARDS = new Set(["something-else-routine"]);

export const checkInOptions: Array<{
  id: CheckInTime;
  title: string;
  description: string;
}> = [
  { id: "morning", title: "Morning", description: "Start the day with intention" },
  { id: "afternoon", title: "Afternoon", description: "Pause and reset" },
  { id: "evening", title: "Evening", description: "Reflect on your day" },
];

function withoutWildcards(ids: string[], wildcards: Set<string>) {
  return ids.filter((id) => !wildcards.has(id));
}

function overlaps(tags: readonly string[], selected: string[]) {
  if (selected.length === 0 || tags.length === 0) {
    return false;
  }

  return tags.some((id) => selected.includes(id));
}

function scoreTrigger(option: TriggerOption, intents: string[], spaces: string[], routines: string[]) {
  let score = 0;
  if (overlaps(option.intents, intents)) {
    score += 3;
  }
  if (overlaps(option.spaces, spaces)) {
    score += 3;
  }
  if (overlaps(option.routines, routines)) {
    score += 2;
  }
  return score;
}

export function triggersForOnboarding(draft: Pick<OnboardingDraft, "reasons" | "spaceFor" | "routine">) {
  const intents = withoutWildcards(draft.reasons, INTENT_WILDCARDS);
  const spaces = draft.spaceFor;
  const routines = withoutWildcards(draft.routine, ROUTINE_WILDCARDS);
  const ranked = [...triggerOptions]
    .map((option) => ({ option, score: scoreTrigger(option, intents, spaces, routines) }))
    .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label));

  const matched = ranked.filter((item) => item.score > 0).slice(0, ONBOARDING_TRIGGER_COUNT);
  if (matched.length >= 8) {
    return matched.map((item) => item.option);
  }

  const have = new Set(matched.map((item) => item.option.id));
  const byId = new Map(triggerOptions.map((option) => [option.id, option]));
  const filled = [...matched.map((item) => item.option)];
  for (const id of FALLBACK_TRIGGER_IDS) {
    if (filled.length >= ONBOARDING_TRIGGER_COUNT) {
      break;
    }
    const option = byId.get(id);
    if (option && !have.has(option.id)) {
      filled.push(option);
      have.add(option.id);
    }
  }

  return filled;
}

export function pruneOnboardingTriggerIds(draft: OnboardingDraft) {
  const allowed = new Set(triggersForOnboarding(draft).map((option) => option.id));
  return draft.triggerIds.filter((id) => allowed.has(id));
}
