import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-8 w-56 max-w-full" />
      <Skeleton className="mt-2 h-4 w-40 max-w-full" />
    </div>
  );
}
