import { Skeleton } from "@/components/ui/skeleton";

export function MainLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:gap-6">
      <div className="flex flex-col items-center gap-2 py-2">
        <Skeleton className="h-12 w-56 max-w-full" />
        <Skeleton className="h-6 w-64 max-w-full" />
      </div>
      <Skeleton className="h-44 w-full rounded-md" />
      <Skeleton className="h-80 w-full rounded-md" />
    </div>
  );
}
