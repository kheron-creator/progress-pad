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
    <div className="pp-onboarding relative flex min-h-dvh flex-col bg-background">
      <header
        className={cn(
          "flex shrink-0 items-center justify-between gap-3",
          "px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2",
          "sm:px-6 md:px-10 md:pt-8 lg:px-14",
        )}
      >
        <Logo size="sm" className="h-7 w-auto shrink-0 sm:h-8" />
        {step !== "ready" ? (
          <div className="min-w-0 md:hidden">
            <OnboardingProgress current={current} />
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[calc(2*26.25rem+0.75rem)] flex-1 flex-col px-4 sm:px-6">
        {step !== "ready" ? (
          <div className="hidden shrink-0 justify-center pb-6 md:flex lg:pb-8">
            <OnboardingProgress current={current} />
          </div>
        ) : null}

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          <div className="my-auto flex flex-col gap-6 py-3 sm:gap-10 lg:gap-16">
            <div className="flex min-h-0 flex-col">
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
            </div>

            {error ? (
              <Text variant="caption" className="shrink-0 text-center text-error" role="alert">
                {error}
              </Text>
            ) : null}
          </div>
        </main>

        {step === "ready" ? (
          <div className="flex shrink-0 justify-center py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
              "flex shrink-0 gap-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
              current > 1
                ? "flex-col sm:flex-row sm:items-center sm:justify-between"
                : "flex-col sm:flex-row sm:items-center sm:justify-end",
            )}
          >
            {current > 1 ? (
              <Button
                look="outline"
                size="lg"
                disabled={pending}
                className="w-full px-6 sm:w-auto sm:px-12"
                onClick={handleBack}
              >
                <ChevronLeftIcon />
                Back
              </Button>
            ) : null}
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              {step === 6 ? (
                <Button
                  look="clear"
                  size="lg"
                  disabled={pending}
                  className="w-full px-6 sm:w-auto sm:px-12"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              ) : null}
              <Button
                size="lg"
                loading={pending}
                disabled={!continueEnabled}
                className="w-full px-6 sm:w-auto sm:px-12"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
