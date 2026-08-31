import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CloseIcon } from "./icon";
import { Text } from "./text";

export type BannerLook = "hero" | "compact";
export type BannerSize = "sm" | "lg";
export type BannerTone = "accent" | "inverse";

type BannerProps = HTMLAttributes<HTMLElement> & {
  look?: BannerLook;
  size?: BannerSize;
  tone?: BannerTone;
  title?: string;
  description?: string;
  icon?: ReactNode;
  kicker?: ReactNode;
  media?: ReactNode;
  onDismiss?: () => void;
};

const toneClass: Record<BannerTone, string> = {
  accent: "bg-accent text-accent-foreground",
  inverse: "bg-background-inverse text-foreground-inverse",
};

const heroHeight: Record<BannerSize, string> = {
  lg: "min-h-[var(--pp-banner-height-lg)]",
  sm: "min-h-[var(--pp-banner-height-sm)]",
};

export function Banner({
  look = "hero",
  size = "lg",
  tone = "accent",
  title,
  description,
  icon,
  kicker,
  media,
  onDismiss,
  className,
  children,
  ...props
}: BannerProps) {
  if (look === "compact") {
    return (
      <section
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-4 py-3",
          toneClass[tone],
          className,
        )}
        {...props}
      >
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <div className="min-w-0 flex-1">
          {title ? (
            <Text variant="overline" className="text-inherit">
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text variant="caption" className="text-inherit opacity-80">
              {description}
            </Text>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-inherit"
            onClick={onDismiss}
          >
            <CloseIcon />
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative flex w-full items-center overflow-hidden rounded-md border border-border-subtle bg-background-subtle",
        heroHeight[size],
        className,
      )}
      {...props}
    >
      {media ? <div className="absolute inset-0">{media}</div> : null}
      {media ? (
        <div className="absolute inset-0 bg-linear-to-r from-(--pp-grey-900)/70 to-transparent" />
      ) : null}
      {(kicker || title || description || children) ? (
        <div
          className={cn(
            "relative flex max-w-150 flex-col justify-center gap-3 p-card",
            media ? "text-(--pp-grey-0)" : undefined,
          )}
        >
          {kicker ? <div className="w-fit">{kicker}</div> : null}
          {title ? (
            <Text
              variant={size === "lg" ? "pageTitle" : "sectionTitle"}
              className={cn("font-bold", media ? "text-inherit" : undefined)}
            >
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text
              variant="description"
              className={media ? "text-(--pp-grey-0)! opacity-90" : undefined}
            >
              {description}
            </Text>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}
