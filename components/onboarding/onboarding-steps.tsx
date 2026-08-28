import type { ReactNode } from "react";

import { ChoiceItem } from "@/components/ui/choice-item";
import {
  ChartLineIcon,
  LightningIcon,
  MoonIcon,
  SparkleIcon,
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
import { ReadyConfetti } from "./ready-confetti";

const STEP_BODY_MIN_HEIGHT =
  "sm:min-h-[calc(4*4.5rem+3*0.75rem)]";

const SCROLL_HIDE =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function StepLayout({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-(--pp-space-24) lg:gap-5">
      <div className="shrink-0">{heading}</div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
          SCROLL_HIDE,
        )}
      >
        <div className="flex min-h-full flex-col justify-start pb-1 sm:justify-center">{children}</div>
      </div>
    </div>
  );
}

function StepBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full", STEP_BODY_MIN_HEIGHT, className)}>{children}</div>;
}

export function OnboardingHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl shrink-0 flex-col text-center md:min-h-[calc(2*var(--pp-text-page-title-leading)+0.25rem+2*var(--pp-text-body-leading))]">
      <Text as="h1" variant="pageTitle" className="m-0 text-balance">
        {title}
      </Text>
      <Text
        variant="description"
        className="m-0 mt-(--pp-space-2) text-pretty text-[length:var(--pp-font-size-12)] leading-(--pp-leading-16) lg:mt-2 lg:text-[length:var(--pp-text-body-size)] lg:leading-(--pp-text-body-leading)"
      >
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
          ? "grid w-full grid-cols-1 content-start justify-items-stretch gap-2 sm:grid-cols-2 sm:content-center sm:gap-3 lg:grid-cols-3"
          : "grid w-full grid-cols-1 content-start justify-items-stretch gap-2 sm:grid-cols-2 sm:content-center sm:gap-3"
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
    <StepLayout heading={<OnboardingHeading title="What brings you here?" description="Select up to three" />}>
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
    <StepLayout
      heading={
        <OnboardingHeading
          title="What would you like to make more space for?"
          description="Select up to three"
        />
      }
    >
      <ChoiceGrid options={spaceOptions} selected={draft.spaceFor} onToggle={onToggle} />
    </StepLayout>
  );
}

export function RoutineStep({
  draft,
  onToggle,
}: {
  draft: OnboardingDraft;
  onToggle: (id: string) => void;
}) {
  return (
    <StepLayout
      heading={
        <OnboardingHeading
          title="What does your day-to-day look like?"
          description="Select up to two"
        />
      }
    >
      <ChoiceGrid options={routineOptions} selected={draft.routine} onToggle={onToggle} />
    </StepLayout>
  );
}

export function MeetPadStep() {
  return (
    <StepLayout
      heading={
        <OnboardingHeading
          title="Meet your Progress Pad"
          description="Your space to check in, clear your head, and move forward"
        />
      }
    >
      <StepBody className="flex flex-col justify-center gap-5 lg:gap-16">
        <div className="grid grid-cols-1 content-center gap-6 sm:grid-cols-3 sm:gap-5">
          <IntroColumn
            icon={
              <TargetIcon
                size={56}
                weight="bold"
                className="size-10 text-(--pp-magenta-500) sm:size-14"
              />
            }
            title="Mind Sweep"
            description="Get everything out of your head."
          />
          <IntroColumn
            icon={
              <LightningIcon
                size={56}
                weight="bold"
                className="size-10 text-(--pp-spring-green-600) sm:size-14"
              />
            }
            title="Triggers"
            description="Turn intentions into things you can actually act on."
            divider
          />
          <IntroColumn
            icon={
              <ChartLineIcon
                size={56}
                weight="bold"
                className="size-10 text-(--pp-bondi-blue-500) sm:size-14"
              />
            }
            title="Progress"
            description="Look back and see how you're doing over time."
            divider
          />
        </div>
        <NextUpBanner />
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
    <StepLayout
      heading={
        <OnboardingHeading
          title="Let's set up a few things that help you make progress."
          description="Add at least 1 trigger to get started."
        />
      }
    >
      <StepBody className="relative">
        <ChoiceGrid
          options={triggerOptions}
          selected={draft.triggerIds}
          onToggle={onToggle}
          columns={4}
        />
        <Text variant="caption" className="mt-2 text-right text-primary sm:absolute sm:right-0 sm:top-full sm:mt-1">
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
    <StepLayout
      heading={
        <OnboardingHeading
          title="When would you like to check in with yourself?"
          description="You can change this anytime later"
        />
      }
    >
      <StepBody className="grid grid-cols-1 content-center gap-2 sm:grid-cols-3 sm:gap-3">
        {checkInOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={draft.checkIn === option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-md border px-3 py-4 text-center sm:gap-3 sm:px-4 sm:py-14 md:py-16",
              draft.checkIn === option.id
                ? "border-(--pp-spring-green-600) bg-(--pp-spring-green-10)"
                : "border-(--pp-grey-50) bg-surface",
            )}
          >
            {option.id === "morning" ? (
              <SunIcon size={56} weight="bold" className="size-8 text-(--pp-spring-green-600) sm:size-14" />
            ) : option.id === "afternoon" ? (
              <SunHorizonIcon size={56} weight="bold" className="size-8 text-(--pp-magenta-500) sm:size-14" />
            ) : (
              <MoonIcon size={56} weight="bold" className="size-8 text-(--pp-bondi-blue-500) sm:size-14" />
            )}
            <Text
              variant="cardTitle"
              className="font-semibold text-[length:var(--pp-font-size-14)] leading-(--pp-leading-20) lg:text-[length:var(--pp-text-card-title-size)] lg:leading-(--pp-text-card-title-leading)"
            >
              {option.title}
            </Text>
            <Text
              variant="description"
              className="text-[length:var(--pp-font-size-12)] leading-(--pp-leading-16) lg:text-[length:var(--pp-text-body-size)] lg:leading-(--pp-text-body-leading)"
            >
              {option.description}
            </Text>
          </button>
        ))}
      </StepBody>
    </StepLayout>
  );
}

export function ReadyStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <ReadyConfetti className="relative mb-8 inline-flex size-32 items-center justify-center sm:mb-16 sm:size-48" />
      <Text as="h1" variant="pageTitle" className="text-balance">
        Your Progress Pad is ready
      </Text>
      <Text variant="description" className="mt-2 max-w-md text-pretty">
        You&apos;ve already got a few things to work with. You can add, change, or remove anything
        whenever you want.
      </Text>
    </div>
  );
}

function NextUpBanner() {
  return (
    <div className="flex items-start justify-center gap-2 rounded-md border border-(--pp-grey-50) bg-(--pp-spring-green-10) px-3 py-2.5 sm:items-center sm:gap-3 sm:px-5 sm:py-3">
      <SparkleIcon size={14} weight="fill" className="mt-0.5 shrink-0 text-(--pp-spring-green-600) sm:mt-0" />
      <Text
        as="p"
        variant="caption"
        className="m-0 text-pretty text-(length:--pp-font-size-10) leading-(--pp-leading-16) lg:text-(length:--pp-text-body-small-size) lg:leading-(--pp-text-body-small-leading)"
      >
        <span className="font-semibold text-(--pp-spring-green-600)">Next up: </span>
        We&apos;ll help you choose a few small triggers for your day.
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
      className={`flex flex-col items-center gap-1 px-2 text-center sm:gap-3 sm:px-6 ${divider ? "sm:border-l sm:border-border" : ""}`}
    >
      {icon}
      <Text
        variant="cardTitle"
        className="font-semibold text-[length:var(--pp-font-size-14)] leading-(--pp-leading-20) lg:text-[length:var(--pp-text-card-title-size)] lg:leading-(--pp-text-card-title-leading)"
      >
        {title}
      </Text>
      <Text
        variant="description"
        className="text-[length:var(--pp-font-size-12)] leading-(--pp-leading-16) lg:text-[length:var(--pp-text-body-size)] lg:leading-(--pp-text-body-leading)"
      >
        {description}
      </Text>
    </div>
  );
}
