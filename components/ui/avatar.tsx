import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { UserIcon } from "./icon";

export type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
};

const sizeClass: Record<AvatarSize, string> = {
  sm: "size-[var(--pp-avatar-sm)]",
  md: "size-[var(--pp-avatar-md)]",
  lg: "size-[var(--pp-avatar-lg)]",
  xl: "size-[var(--pp-avatar-xl)]",
  "2xl": "size-[var(--pp-avatar-2xl)]",
};

const initialsClass: Record<AvatarSize, string> = {
  sm: "text-[length:var(--pp-font-size-12)]",
  md: "text-[length:var(--pp-font-size-14)]",
  lg: "text-[length:var(--pp-font-size-18)]",
  xl: "text-[length:var(--pp-font-size-24)]",
  "2xl": "text-[length:var(--pp-font-size-36)]",
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
        <span className={cn("font-[var(--pp-font-weight-medium)] leading-none", initialsClass[size])}>
          {initials}
        </span>
      ) : (
        <UserIcon />
      )}
    </span>
  );
}
