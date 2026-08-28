import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-32 max-w-full" />
        <Skeleton className="mt-2 h-4 w-48 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
