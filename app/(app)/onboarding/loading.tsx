import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 py-8 sm:px-6">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="mx-auto mt-8 h-1.5 w-40 max-w-full sm:w-56" />
      <Skeleton className="mx-auto mt-8 h-8 w-72 max-w-full" />
      <Skeleton className="mx-auto mt-3 h-4 w-48 max-w-full" />
    </div>
  );
}
