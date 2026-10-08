import { Button, type ButtonSize } from "@/components/ui/button";
import { LANDING } from "@/lib/marketing/content";
import { cn } from "@/lib/utils/cn";

type HomeCtasProps = {
  size?: ButtonSize;
  className?: string;
  compact?: boolean;
};

export function HomeCtas({ size = "lg", className, compact = false }: HomeCtasProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button size={size} href="/signup">
        {LANDING.primaryCta}
      </Button>
      <Button
        size={size}
        look="outline"
        href="/login"
        className={cn(compact && "max-sm:hidden")}
      >
        {LANDING.secondaryCta}
      </Button>
    </div>
  );
}
