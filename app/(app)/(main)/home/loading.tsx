import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:gap-6">
      <Skeleton className="h-(--pp-banner-height-lg) w-full rounded-md" />
      <div className="flex flex-col items-center gap-2 py-2">
        <Skeleton className="h-8 w-56 rounded-full" />
        <Skeleton className="h-12 w-72 max-w-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-44 w-full rounded-md" />
      <Skeleton className="h-(--pp-banner-height-sm) w-full rounded-md" />
      <Skeleton className="h-80 w-full rounded-md" />
    </div>
  );
}
