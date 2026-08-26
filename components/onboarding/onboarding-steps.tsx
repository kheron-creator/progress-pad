import type { ReactNode } from "react";

import { ChoiceItem } from "@/components/ui/choice-item";
import { FeatureCard } from "@/components/ui/feature-card";
import { IconMark } from "@/components/ui/icon-mark";
import {
  ChartLineIcon,
  CheckCircleIcon,
  LightningIcon,
  MoonIcon,
  SunHorizonIcon,
  SunIcon,
  TargetIcon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  checkInOptions,
  intentOptions,
  routineOptions,
  spaceOptions,
  triggerOptions,
} from "@/lib/onboarding/content";
import {
  ONBOARDING_MAX_TRIGGERS,
  type CheckInTime,
  type OnboardingDraft,
} from "@/lib/onboarding/draft";

import { cn } from "@/lib/utils/cn";

import { optionIcon } from "./option-icons";

const STEP_BODY_MIN_HEIGHT =
  "min-h-[calc(4*3.5rem+3*0.75rem)] sm:min-h-[calc(4*4.5rem+3*0.75rem)]";

function StepLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 lg:gap-5">{children}</div>;
}

function StepBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full", STEP_BODY_MIN_HEIGHT, className)}>{children}</div>;
}

export function OnboardingHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex h-[calc(2*var(--pp-text-page-title-leading)+0.25rem+2*var(--pp-text-body-leading))] w-full max-w-2xl shrink-0 flex-col text-center">
      <Text as="h1" variant="pageTitle" className="m-0 text-balance">
        {title}
      </Text>
      <Text variant="description" className="m-0 mt-2 text-pretty">
        {description}
      </Text>
    </div>
  );
}

export function ChoiceGrid({
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  options: ReadonlyArray<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
  columns?: 2 | 4;
}) {
  return (
    <div
      className={
        columns === 4
          ? cn("grid w-full grid-cols-2 content-center gap-3 lg:grid-cols-3", STEP_BODY_MIN_HEIGHT)
          : cn("grid w-full grid-cols-2 content-center gap-3", STEP_BODY_MIN_HEIGHT)
      }
    >
      {options.map((option) => (
        <ChoiceItem
          key={option.id}
          label={option.label}
          icon={optionIcon(option.id)}
          selected={selected.includes(option.id)}
          onClick={() => onToggle(option.id)}
        />
      ))}
    </div>
  );
}

export function IntentStep({
  draft,
  onToggle,
}: {
  draft: OnboardingDraft;
  onToggle: (id: string) => void;
}) {
  return (
    <StepLayout>
      <OnboardingHeading title="What brings you here?" description="Select up to three" />
      <ChoiceGrid options={intentOptions} selected={draft.reasons} onToggle={onToggle} />
    </StepLayout>
  );
}

export function SpaceStep({
  draft,
  onToggle,
}: {
  draft: OnboardingDraft;
  onToggle: (id: string) => void;
}) {
  return (
    <StepLayout>
      <OnboardingHeading
        title="What would you like to make more space for?"
        description="Select up to three"
      />
      <ChoiceGrid options={spaceOptions} selected={draft.spaceFor} onToggle={onToggle} />
    </StepLayout>
  );
}

export function RoutineStep({
  draft,
  onSelect,
}: {
  draft: OnboardingDraft;
  onSelect: (id: string) => void;
}) {
  return (
    <StepLayout>
      <OnboardingHeading
        title="What does your day-to-day look like?"
        description="This helps us tailor your experience to your current routine."
      />
      <ChoiceGrid
        options={routineOptions}
        selected={draft.routine ? [draft.routine] : []}
        onToggle={onSelect}
      />
    </StepLayout>
  );
}

export function MeetPadStep() {
  return (
    <StepLayout>
      <OnboardingHeading
        title="Meet your Progress Pad"
        description="Your space to check in, clear your head, and move forward"
      />
      <StepBody className="mx-auto grid max-w-4xl grid-cols-3 content-center gap-3 sm:gap-0">
        <IntroColumn
          icon={
            <IconMark size="lg" shape="circle" tone="warning">
              <TargetIcon size={20} />
            </IconMark>
          }
          title="Mind Sweep"
          description="Get everything out of your head."
        />
        <IntroColumn
          icon={
            <IconMark size="lg" shape="circle" tone="primary">
              <LightningIcon size={20} />
            </IconMark>
          }
          title="Triggers"
          description="Turn intentions into things you can actually act on."
          divider
        />
        <IntroColumn
          icon={
            <IconMark size="lg" shape="circle" tone="info">
              <ChartLineIcon size={20} />
            </IconMark>
          }
          title="Progress"
          description="Look back and see how you're doing over time."
          divider
        />
      </StepBody>
    </StepLayout>
  );
}

export function TriggersStep({
  draft,
  onToggle,
}: {
  draft: OnboardingDraft;
  onToggle: (id: string) => void;
}) {
  return (
    <StepLayout>
      <OnboardingHeading
        title="Let's set up a few things that help you make progress."
        description="Add at least 1 trigger to get started."
      />
      <StepBody className="relative">
        <ChoiceGrid
          options={triggerOptions}
          selected={draft.triggerIds}
          onToggle={onToggle}
          columns={4}
        />
        <Text variant="caption" className="absolute right-0 top-full mt-1 text-primary">
          {draft.triggerIds.length}/{ONBOARDING_MAX_TRIGGERS} selected
        </Text>
      </StepBody>
    </StepLayout>
  );
}

export function CheckInStep({
  draft,
  onSelect,
}: {
  draft: OnboardingDraft;
  onSelect: (id: CheckInTime) => void;
}) {
  return (
    <StepLayout>
      <OnboardingHeading
        title="When would you like to check in with yourself?"
        description="You can change this anytime later"
      />
      <StepBody className="mx-auto flex max-w-4xl flex-row items-center justify-center gap-3 sm:gap-4">
        {checkInOptions.map((option) => (
          <FeatureCard
            key={option.id}
            title={option.title}
            description={option.description}
            selected={draft.checkIn === option.id}
            onClick={() => onSelect(option.id)}
            className="max-w-none flex-1"
            icon={
              <IconMark
                size="lg"
                shape="circle"
                tone={option.id === "morning" ? "primary" : option.id === "afternoon" ? "warning" : "info"}
              >
                {option.id === "morning" ? (
                  <SunIcon size={20} />
                ) : option.id === "afternoon" ? (
                  <SunHorizonIcon size={20} />
                ) : (
                  <MoonIcon size={20} />
                )}
              </IconMark>
            }
          />
        ))}
      </StepBody>
    </StepLayout>
  );
}

export function ReadyStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="relative inline-flex size-24 items-center justify-center">
        <span className="absolute size-3 rounded-sm bg-accent -translate-x-10 -translate-y-8 rotate-12" />
        <span className="absolute size-2 rounded-sm bg-warning translate-x-10 -translate-y-6 -rotate-6" />
        <span className="absolute size-2.5 rounded-sm bg-info -translate-x-12 translate-y-6 rotate-45" />
        <span className="absolute size-2 rounded-sm bg-secondary translate-x-12 translate-y-8 -rotate-12" />
        <CheckCircleIcon size={80} weight="fill" className="text-primary" />
      </span>
      <Text as="h1" variant="pageTitle" className="mt-6 text-balance">
        Your Progress Pad is ready
      </Text>
      <Text variant="description" className="mt-2 max-w-md text-pretty">
        You&apos;ve already got a few things to work with. You can add, change, or remove anything
        whenever you want.
      </Text>
    </div>
  );
}

function IntroColumn({
  icon,
  title,
  description,
  divider = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 px-2 text-center sm:gap-3 sm:px-6 ${divider ? "sm:border-l sm:border-border" : ""}`}
    >
      {icon}
      <Text variant="subtitle">{title}</Text>
      <Text variant="description">{description}</Text>
    </div>
  );
}
