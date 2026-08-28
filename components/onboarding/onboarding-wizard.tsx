"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";
import {
  ONBOARDING_MAX_MULTI,
  ONBOARDING_MAX_ROUTINE,
  ONBOARDING_MAX_TRIGGERS,
  ONBOARDING_READY_STEP,
  canContinue,
  stepNumber,
  stepPath,
  toggleLimited,
  type CheckInTime,
  type OnboardingDraft,
  type OnboardingStepId,
} from "@/lib/onboarding/draft";
import { saveOnboarding } from "@/lib/onboarding/store";
import { createClient } from "@/lib/supabase/client";

import { OnboardingProgress } from "./onboarding-progress";
import {
  CheckInStep,
  IntentStep,
  MeetPadStep,
  ReadyStep,
  RoutineStep,
  SpaceStep,
  TriggersStep,
} from "./onboarding-steps";

type OnboardingWizardProps = {
  step: OnboardingStepId;
  initialDraft: OnboardingDraft;
};

export function OnboardingWizard({ step, initialDraft }: OnboardingWizardProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const current = stepNumber(step);
  const continueEnabled = canContinue(step, draft);

  async function persist(nextDraft: OnboardingDraft, complete = false) {
    const supabase = createClient();
    await saveOnboarding(supabase, nextDraft, { complete });
  }

  async function goTo(nextStep: number, nextDraft: OnboardingDraft) {
    setPending(true);
    setError(undefined);

    try {
      await persist(nextDraft);
      router.push(stepPath(nextStep));
      router.refresh();
    } catch {
      setError("Could not save your answers. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function handleContinue() {
    if (!continueEnabled || pending) {
      return;
    }

    const farthestStep = Math.max(draft.farthestStep, current + 1);
    void goTo(current + 1, { ...draft, farthestStep });
  }

  function handleBack() {
    if (current <= 1 || pending) {
      return;
    }

    router.push(stepPath(current - 1));
  }

  function handleSkip() {
    if (step !== 6 || pending) {
      return;
    }

    void goTo(ONBOARDING_READY_STEP, {
      ...draft,
      checkIn: null,
      checkInSkipped: true,
      farthestStep: Math.max(draft.farthestStep, ONBOARDING_READY_STEP),
    });
  }

  async function handleFinish() {
    setPending(true);
    setError(undefined);

    try {
      await persist(draft, true);
      router.replace("/home");
      router.refresh();
    } catch {
      setError("Could not finish onboarding. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="pp-onboarding flex h-dvh max-h-dvh flex-col overflow-hidden bg-background px-(--pp-space-40) pt-[max(var(--pp-space-36),env(safe-area-inset-top))] pb-[max(var(--pp-space-36),env(safe-area-inset-bottom))] lg:px-10 lg:pt-12 lg:pb-4">
      <header
        className={cn(
          "flex shrink-0 flex-col items-center gap-(--pp-space-36) pb-(--pp-space-24)",
          "lg:gap-6 lg:pb-8",
        )}
      >
        <Logo size="sm" className="h-7 w-auto sm:h-8" />
        {step !== "ready" ? <OnboardingProgress current={current} /> : null}
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[calc(2*26.25rem+0.75rem)] flex-1 flex-col overflow-hidden lg:px-6">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:py-3">
          <div className="flex min-h-0 flex-1 flex-col">
            {step === 1 ? (
              <IntentStep
                draft={draft}
                onToggle={(id) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    reasons: toggleLimited(currentDraft.reasons, id, ONBOARDING_MAX_MULTI),
                  }))
                }
              />
            ) : null}
            {step === 2 ? (
              <SpaceStep
                draft={draft}
                onToggle={(id) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    spaceFor: toggleLimited(currentDraft.spaceFor, id, ONBOARDING_MAX_MULTI),
                  }))
                }
              />
            ) : null}
            {step === 3 ? (
              <RoutineStep
                draft={draft}
                onToggle={(id) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    routine: toggleLimited(currentDraft.routine, id, ONBOARDING_MAX_ROUTINE),
                  }))
                }
              />
            ) : null}
            {step === 4 ? <MeetPadStep /> : null}
            {step === 5 ? (
              <TriggersStep
                draft={draft}
                onToggle={(id) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    triggerIds: toggleLimited(currentDraft.triggerIds, id, ONBOARDING_MAX_TRIGGERS),
                  }))
                }
              />
            ) : null}
            {step === 6 ? (
              <CheckInStep
                draft={draft}
                onSelect={(id: CheckInTime) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    checkIn: id,
                    checkInSkipped: false,
                  }))
                }
              />
            ) : null}
            {step === "ready" ? <ReadyStep /> : null}

            {error ? (
              <Text variant="caption" className="shrink-0 text-center text-error" role="alert">
                {error}
              </Text>
            ) : null}
          </div>
        </main>

        {step === "ready" ? (
          <div className="flex shrink-0 justify-center bg-background pt-4 lg:py-4">
            <Button
              size="lg"
              loading={pending}
              className="w-full px-6 sm:w-auto sm:px-12"
              onClick={() => void handleFinish()}
            >
              Go to my Progress Pad
              <ChevronRightIcon />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "flex shrink-0 flex-row items-center gap-3 bg-background pt-4 lg:py-4",
              current > 1 ? "justify-between" : "justify-end",
            )}
          >
            {current > 1 ? (
              <Button
                look="outline"
                size="lg"
                disabled={pending}
                className="min-w-0 flex-1 px-4 sm:flex-none sm:px-12"
                onClick={handleBack}
              >
                <ChevronLeftIcon />
                Back
              </Button>
            ) : null}
            {step === 6 ? (
              <Button
                look="clear"
                size="lg"
                disabled={pending}
                className="min-w-0 flex-1 px-4 sm:flex-none sm:px-12"
                onClick={handleSkip}
              >
                Skip
              </Button>
            ) : null}
            <Button
              size="lg"
              loading={pending}
              disabled={!continueEnabled}
              className={cn(
                "min-w-0 px-4 sm:flex-none sm:px-12",
                current > 1 ? "flex-1" : "w-full sm:w-auto",
              )}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
