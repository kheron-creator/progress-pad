"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckCircleIcon, PencilIcon } from "./icon";
import { Text } from "./text";

export type ChoiceItemSize = "sm" | "lg";

type ChoiceItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  selected?: boolean;
  size?: ChoiceItemSize;
  icon?: ReactNode;
};

const sizeClass: Record<ChoiceItemSize, string> = {
  sm: "min-h-10 px-3 py-2",
  lg: "min-h-14 px-4 py-3",
};

export function ChoiceItem({
  label,
  selected = false,
  size = "lg",
  icon,
  className,
  type = "button",
  ...props
}: ChoiceItemProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-md bg-surface text-left",
        sizeClass[size],
        selected ? "border-2 border-primary" : "border border-border",
        className,
      )}
      {...props}
    >
      {icon ?? (
        <span className="text-warning" aria-hidden>
          <PencilIcon size={16} />
        </span>
      )}
      <Text as="span" variant="label" className="min-w-0 flex-1 truncate">
        {label}
      </Text>
      {selected ? (
        <CheckCircleIcon size={20} weight="fill" className="text-primary" />
      ) : (
        <span className="size-5 shrink-0 rounded-full border border-border" aria-hidden />
      )}
    </button>
  );
}
