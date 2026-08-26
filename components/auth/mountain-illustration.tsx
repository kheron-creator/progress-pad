import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function MountainIllustration({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/auth-mountain.png"
      alt=""
      width={1024}
      height={682}
      className={cn("h-full w-full object-contain object-bottom", className)}
      quality={100}
      priority
      loading="eager"
    />
  );
}
