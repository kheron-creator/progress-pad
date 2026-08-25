"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { IconMark } from "./icon-mark";
import { SunIcon } from "./icon";
import { Text } from "./text";

export type FeatureCardSize = "sm" | "lg";

type FeatureCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  size?: FeatureCardSize;
  selected?: boolean;
};

export function FeatureCard({
  title,
  description,
  icon,
  size = "lg",
  selected = false,
  className,
  type = "button",
  ...props
}: FeatureCardProps) {
  const mark = icon ?? (
    <IconMark size={size === "lg" ? "lg" : "sm"} shape="circle" tone="primary">
      <SunIcon size={size === "lg" ? 18 : 14} />
    </IconMark>
  );

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "rounded-md border transition-colors",
        selected ? "border-primary bg-primary-muted" : "border-border bg-surface",
        size === "lg"
          ? "flex w-full max-w-[16rem] flex-col items-center gap-2 px-6 py-8 text-center"
          : "inline-flex w-full max-w-[20rem] items-center gap-3 px-4 py-3 text-left",
        className,
      )}
      {...props}
    >
      {mark}
      <div className={cn(size === "lg" ? "flex flex-col items-center gap-1" : "min-w-0 flex-1")}>
        <Text as="span" variant={size === "lg" ? "subtitle" : "label"} className="block truncate">
          {title}
        </Text>
        {description ? (
          <Text as="span" variant="caption" className="block text-foreground-muted">
            {description}
          </Text>
        ) : null}
      </div>
    </button>
  );
}
