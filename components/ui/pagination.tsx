"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Dropdown } from "./dropdown";
import { ChevronLeftIcon, ChevronRightIcon } from "./icon";
import { Text } from "./text";

export const PAGINATION_PAGE_SIZES = [6, 10, 20] as const;

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
  className?: string;
};

function visiblePages(page: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b)
    .reduce<(number | "ellipsis")[]>((list, value, index, source) => {
      const previous = source[index - 1];
      if (previous != null && value - previous > 1) {
        list.push("ellipsis");
      }
      list.push(value);
      return list;
    }, []);
}

function PageControl({
  label,
  selected = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={selected ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-sm border type-caption transition-colors",
        selected
          ? "border-primary bg-primary-muted text-primary"
          : "border-border bg-surface text-foreground-muted hover:bg-background-subtle hover:text-foreground",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGINATION_PAGE_SIZES,
  itemLabel = "ideas",
  className,
}: PaginationProps) {
  if (total === 0) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = visiblePages(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]",
        className,
      )}
    >
      <Text variant="caption" className="text-foreground-muted sm:justify-self-start">
        Showing {from}-{to} of {total} {itemLabel}
      </Text>
      <div className="flex items-center justify-center gap-1.5">
        <PageControl
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon size={14} />
        </PageControl>
        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <Text
              key={`ellipsis-${index}`}
              as="span"
              variant="caption"
              className="px-1 text-foreground-muted"
            >
              …
            </Text>
          ) : (
            <PageControl
              key={entry}
              label={`Page ${entry}`}
              selected={entry === page}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </PageControl>
          ),
        )}
        <PageControl
          label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon size={14} />
        </PageControl>
      </div>
      {onPageSizeChange ? (
        <div className="sm:justify-self-end">
          <Dropdown
            look="pill"
            aria-label="Items per page"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: `${size} per page`,
            }))}
          />
        </div>
      ) : null}
    </nav>
  );
}
