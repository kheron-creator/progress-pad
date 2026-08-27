import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { withRedirected } from "@/lib/auth/routing";
import { requireUser } from "@/lib/auth/user";
import { parseOnboardingStep, stepNumber, stepPath } from "@/lib/onboarding/draft";

export const metadata: Metadata = {
  title: "Onboarding · Progress Pad",
  description: "Set up your Progress Pad",
};

type OnboardingStepPageProps = {
  params: Promise<{ step: string }>;
};

export default async function OnboardingStepPage({ params }: OnboardingStepPageProps) {
  const { step: rawStep } = await params;
  const step = parseOnboardingStep(rawStep);
  if (!step) {
    redirect(await withRedirected("/onboarding"));
  }

  const user = await requireUser();
  if (stepNumber(step) > user.onboarding.farthestStep) {
    redirect(await withRedirected(stepPath(user.onboarding.farthestStep)));
  }

  return <OnboardingWizard step={step} initialDraft={user.onboarding} />;
}
