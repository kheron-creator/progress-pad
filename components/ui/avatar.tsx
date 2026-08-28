"use client";

import { useState, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  onImageError?: () => void;
  onImageLoad?: () => void;
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
  onImageError,
  onImageLoad,
  ...props
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const photo = src?.trim();
  const showPhoto = Boolean(photo) && photo !== failedSrc;
  const label = initials?.trim() || "PP";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-muted leading-none text-primary",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={alt}
          className="size-full object-cover"
          onLoad={() => onImageLoad?.()}
          onError={() => {
            if (photo) {
              setFailedSrc(photo);
            }
            onImageError?.();
          }}
        />
      ) : (
        <span className={cn("font-(--pp-font-weight-medium) leading-none", initialsClass[size])}>
          {label}
        </span>
      )}
    </span>
  );
}
