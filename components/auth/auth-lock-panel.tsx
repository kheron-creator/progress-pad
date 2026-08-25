import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function AuthLockPanel({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/auth-reset-password.png"
      alt=""
      width={2424}
      height={3136}
      className={cn("h-full w-full rounded-xl object-cover", className)}
      quality={100}
    />
  );
}
