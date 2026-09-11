"use client";

import { useRouter } from "next/navigation";

import { Button, type ButtonSize } from "@/components/ui/button";
import { LANDING } from "@/lib/marketing/content";
import { cn } from "@/lib/utils/cn";

type HomeCtasProps = {
  size?: ButtonSize;
  className?: string;
  compact?: boolean;
};

export function HomeCtas({ size = "lg", className, compact = false }: HomeCtasProps) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button size={size} onClick={() => router.push("/signup")}>
        {LANDING.primaryCta}
      </Button>
      <Button
        size={size}
        look="outline"
        className={cn(compact && "max-sm:hidden")}
        onClick={() => router.push("/login")}
      >
        {LANDING.secondaryCta}
      </Button>
    </div>
  );
}
