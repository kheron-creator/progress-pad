"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import {
  ONBOARDING_MAX_MULTI,
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
    <div className="relative h-dvh overflow-hidden bg-background">
      <header className="absolute left-10 top-10 z-10 lg:left-14">
        <Logo size="sm" />
      </header>

      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="flex w-[calc(2*26.25rem+0.75rem)] max-w-full flex-col gap-12">
          {step !== "ready" ? (
            <div className="flex shrink-0 justify-center">
              <OnboardingProgress current={current} />
            </div>
          ) : null}

          <main className="flex min-h-0 w-full flex-col gap-16">
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
                  onSelect={(id) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      routine: currentDraft.routine === id ? null : id,
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
              <Text variant="caption" className="mt-2 shrink-0 text-center text-error" role="alert">
                {error}
              </Text>
            ) : null}

            {step === "ready" ? (
              <div className="flex shrink-0 justify-center">
                <Button size="lg" loading={pending} onClick={() => void handleFinish()}>
                  Go to my Progress Pad
                  <ChevronRightIcon />
                </Button>
              </div>
            ) : (
              <div className="flex shrink-0 items-center justify-between gap-3">
                {current > 1 ? (
                  <Button look="outline" size="lg" disabled={pending} onClick={handleBack}>
                    <ChevronLeftIcon />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-4">
                  {step === 6 ? (
                    <Button look="clear" size="lg" disabled={pending} onClick={handleSkip}>
                      Skip
                    </Button>
                  ) : null}
                  <Button
                    size="lg"
                    loading={pending}
                    disabled={!continueEnabled}
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
