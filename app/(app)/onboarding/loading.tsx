import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background px-6 py-8">
      <Skeleton className="mx-auto h-1.5 w-56" />
      <Skeleton className="mx-auto mt-10 h-8 w-72 max-w-full" />
      <Skeleton className="mx-auto mt-3 h-4 w-48 max-w-full" />
    </div>
  );
}
