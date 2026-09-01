import { Skeleton } from "@/components/ui/skeleton";

export default function TriggersLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center gap-2 py-2">
        <Skeleton className="h-12 w-40 max-w-full" />
        <Skeleton className="h-6 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-md" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
      <Skeleton className="h-96 w-full rounded-md" />
    </div>
  );
}
