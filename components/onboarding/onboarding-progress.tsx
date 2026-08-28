import { cn } from "@/lib/utils/cn";
import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/draft";

export function OnboardingProgress({ current }: { current: number }) {
  return (
    <div
      className="flex flex-nowrap items-center gap-1.5"
      role="progressbar"
      aria-label="Onboarding progress"
      aria-valuemin={1}
      aria-valuemax={ONBOARDING_STEP_COUNT}
      aria-valuenow={current}
    >
      {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 w-7 rounded-full sm:h-2.5 sm:w-10 md:w-14 lg:w-24",
            index < current ? "bg-primary" : "bg-background-subtle",
          )}
        />
      ))}
    </div>
  );
}
