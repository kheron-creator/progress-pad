import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { UserIcon } from "./icon";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
};

const sizeClass: Record<AvatarSize, string> = {
  sm: "size-[var(--pp-avatar-sm)] text-[length:var(--pp-font-size-12)]",
  md: "size-[var(--pp-avatar-md)] text-[length:var(--pp-font-size-14)]",
  lg: "size-[var(--pp-avatar-lg)] text-[length:var(--pp-font-size-18)]",
  xl: "size-[var(--pp-avatar-xl)] text-[length:var(--pp-font-size-24)]",
};

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-muted text-primary",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : initials ? (
        <span className="type-label">{initials}</span>
      ) : (
        <UserIcon />
      )}
    </span>
  );
}
