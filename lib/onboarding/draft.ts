export const ONBOARDING_STEP_COUNT = 6;
export const ONBOARDING_READY_STEP = 7;
export const ONBOARDING_MAX_MULTI = 3;
export const ONBOARDING_MAX_TRIGGERS = 5;
export const ONBOARDING_SCHEMA_VERSION = 1;

export type CheckInTime = "morning" | "afternoon" | "evening";

export type OnboardingDraft = {
  schemaVersion: number;
  reasons: string[];
  spaceFor: string[];
  routine: string | null;
  triggerIds: string[];
  checkIn: CheckInTime | null;
  checkInSkipped: boolean;
  farthestStep: number;
};

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | "ready";

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    schemaVersion: ONBOARDING_SCHEMA_VERSION,
    reasons: [],
    spaceFor: [],
    routine: null,
    triggerIds: [],
    checkIn: null,
    checkInSkipped: false,
    farthestStep: 1,
  };
}

export function parseOnboardingDraft(value: unknown): OnboardingDraft {
  const empty = emptyOnboardingDraft();
  if (!value || typeof value !== "object") {
    return empty;
  }

  const record = value as Record<string, unknown>;

  return {
    schemaVersion:
      typeof record.schemaVersion === "number" && Number.isFinite(record.schemaVersion)
        ? record.schemaVersion
        : ONBOARDING_SCHEMA_VERSION,
    reasons: stringList(record.reasons),
    spaceFor: stringList(record.spaceFor),
    routine: typeof record.routine === "string" ? record.routine : null,
    triggerIds: stringList(record.triggerIds),
    checkIn: isCheckInTime(record.checkIn) ? record.checkIn : null,
    checkInSkipped: record.checkInSkipped === true,
    farthestStep: clampStep(record.farthestStep),
  };
}

export function isOnboardingComplete(value: unknown) {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== "null" && trimmed !== "false";
  }

  return false;
}

export function parseOnboardingStep(value: string): OnboardingStepId | null {
  if (value === "ready") {
    return "ready";
  }

  const step = Number(value);
  if (step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6) {
    return step;
  }

  return null;
}

export function stepNumber(step: OnboardingStepId) {
  return step === "ready" ? ONBOARDING_READY_STEP : step;
}

export function stepPath(step: number | OnboardingStepId) {
  const value = typeof step === "number" ? step : stepNumber(step);
  if (value >= ONBOARDING_READY_STEP) {
    return "/onboarding/ready";
  }

  return `/onboarding/${Math.min(ONBOARDING_STEP_COUNT, Math.max(1, value))}`;
}

export function canContinue(step: OnboardingStepId, draft: OnboardingDraft) {
  if (step === "ready") {
    return true;
  }

  if (step === 1) {
    return inRange(draft.reasons.length, 1, ONBOARDING_MAX_MULTI);
  }

  if (step === 2) {
    return inRange(draft.spaceFor.length, 1, ONBOARDING_MAX_MULTI);
  }

  if (step === 3) {
    return Boolean(draft.routine);
  }

  if (step === 4) {
    return true;
  }

  if (step === 5) {
    return inRange(draft.triggerIds.length, 1, ONBOARDING_MAX_TRIGGERS);
  }

  return Boolean(draft.checkIn);
}

export function toggleLimited(list: string[], id: string, max: number) {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  }

  if (list.length >= max) {
    return list;
  }

  return [...list, id];
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function isCheckInTime(value: unknown): value is CheckInTime {
  return value === "morning" || value === "afternoon" || value === "evening";
}

function clampStep(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(ONBOARDING_READY_STEP, Math.max(1, Math.round(value)));
}

function inRange(value: number, min: number, max: number) {
  return value >= min && value <= max;
}
