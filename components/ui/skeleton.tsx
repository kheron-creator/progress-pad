import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      className={cn("block animate-pulse rounded-sm bg-background-subtle", className)}
      aria-hidden="true"
    />
  );
}
