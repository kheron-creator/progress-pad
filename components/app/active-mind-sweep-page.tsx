"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionStore } from "@/components/app/session-store-provider";
import { useRegisterUnsavedLeave } from "@/components/app/unsaved-leave-provider";
import { AddMindSweepForm } from "@/components/ui/add-mind-sweep-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker, displayDate } from "@/components/ui/date-picker";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarBlankIcon, CheckCircleIcon, CloseIcon, HeadCircuitIcon, ListBulletsIcon, PlusIcon, SearchIcon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { IconMark, type IconMarkTone } from "@/components/ui/icon-mark";
import { Input } from "@/components/ui/input";
import { Pagination, PAGINATION_PAGE_SIZES } from "@/components/ui/pagination";
import { Tabs } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { UndoSnackbar, useUndoSnackbar } from "@/components/ui/undo-snackbar";
import { WrittenItem } from "@/components/ui/written-item";
import { ACTIVE_MIND_SWEEP } from "@/lib/home/content";
import {
  addMindSweepItem,
  deleteMindSweepItem,
  deleteMindSweepItems,
  flattenMindSweepItems,
  formatIsoDate,
  frontMindSweepSortOrder,
  incompleteMindSweepItems,
  mapMindSweepItem,
  mergeMindSweepItems,
  mindSweepPatches,
  parseIsoDate,
  persistMindSweepPatches,
  relocateMindSweepItem,
  removeMindSweepItem,
  removeMindSweepItems,
  setMindSweepStatus,
  type StoredMindSweepItem,
} from "@/lib/home/store";
import { createClient } from "@/lib/supabase/client";
import { burstConfetti } from "@/lib/ui/burst-confetti";
import { cn } from "@/lib/utils/cn";

const COMPOSER_ID = "active-mind-sweep-composer";
const COMPOSER_TITLE_ID = "active-mind-sweep-title";

type SweepFilter = "all" | "active" | "today" | "achieved";

const STAT_COUNT_TONE: Record<IconMarkTone, string> = {
  accent: "text-accent",
  primary: "text-primary",
  "primary-muted": "text-primary",
  secondary: "text-secondary",
  success: "text-success-foreground",
  warning: "text-warning",
  info: "text-info-foreground",
  surface: "text-foreground",
};

function formatItemDate(onDate: string, today: string) {
  if (onDate === today) {
    return "Today";
  }

  const date = parseIsoDate(onDate);
  if (!date) {
    return onDate;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ActiveMindSweepPage() {
  const today = formatIsoDate(new Date());
  const mindSweepByDate = useSessionStore((state) => state.mindSweepByDate);
  const setMindSweepByDate = useSessionStore((state) => state.setMindSweepByDate);
  const allItems = useMemo(() => {
    return flattenMindSweepItems(mindSweepByDate).sort((a, b) => {
      const aToday = a.on_date.slice(0, 10) === today ? 0 : 1;
      const bToday = b.on_date.slice(0, 10) === today ? 0 : 1;
      if (aToday !== bToday) {
        return aToday - bToday;
      }
      const dateCmp = a.on_date.localeCompare(b.on_date);
      if (dateCmp !== 0) {
        return dateCmp;
      }
      const orderCmp = a.sort_order - b.sort_order;
      if (orderCmp !== 0) {
        return orderCmp;
      }
      return a.created_at.localeCompare(b.created_at);
    });
  }, [mindSweepByDate, today]);
  const activeItems = useMemo(
    () => incompleteMindSweepItems(mindSweepByDate, today),
    [mindSweepByDate, today],
  );
  const todayItems = useMemo(
    () => activeItems.filter((item) => item.on_date.slice(0, 10) === today),
    [activeItems, today],
  );
  const achievedItems = useMemo(
    () => allItems.filter((item) => item.status === "achieved"),
    [allItems],
  );
  const stats = [
    {
      id: "all" as const,
      label: ACTIVE_MIND_SWEEP.stats.active,
      count: activeItems.length,
      iconTone: "secondary" as const,
      icon: <ListBulletsIcon />,
    },
    {
      id: "today" as const,
      label: ACTIVE_MIND_SWEEP.stats.today,
      count: todayItems.length,
      iconTone: "accent" as const,
      icon: <CalendarBlankIcon />,
    },
    {
      id: "achieved" as const,
      label: ACTIVE_MIND_SWEEP.stats.achieved,
      count: achievedItems.length,
      iconTone: "primary" as const,
      icon: <CheckCircleIcon />,
    },
  ];
  const { toasts, showToast, dismissToast } = useToasts();
  const { banner, showUndo, undo, dismissBanner } = useUndoSnackbar();
  const [filter, setFilter] = useState<SweepFilter>("active");
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftDate, setDraftDate] = useState(today);
  const [addSaving, setAddSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null);
  const [celebrateName, setCelebrateName] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const celebrateNoteRef = useRef<HTMLParagraphElement>(null);
  const celebrateTimer = useRef(0);
  const dateFilterItems = useMemo(() => {
    if (!filterDate) {
      return null;
    }
    return allItems.filter((item) => item.on_date.slice(0, 10) === filterDate);
  }, [allItems, filterDate]);
  const visibleItems = useMemo(() => {
    const source =
      dateFilterItems ??
      (filter === "today"
        ? todayItems
        : filter === "achieved"
          ? achievedItems
          : filter === "active"
            ? activeItems
            : allItems);
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return source;
    }
    return source.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        (item.notes ?? "").toLowerCase().includes(needle),
    );
  }, [achievedItems, activeItems, allItems, dateFilterItems, filter, query, todayItems]);
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedItems = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.has(item.id));
  const filterTabs: { id: SweepFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: allItems.length },
    { id: "active", label: ACTIVE_MIND_SWEEP.stats.active, count: activeItems.length },
    { id: "today", label: ACTIVE_MIND_SWEEP.stats.today, count: todayItems.length },
    { id: "achieved", label: ACTIVE_MIND_SWEEP.stats.achieved, count: achievedItems.length },
  ];
  const filterDateLabel = useMemo(() => {
    if (!filterDate) {
      return null;
    }
    if (filterDate === today) {
      return "Today";
    }
    const parsed = parseIsoDate(filterDate);
    return parsed ? displayDate(parsed) : filterDate;
  }, [filterDate, today]);

  useRegisterUnsavedLeave(composerOpen && Boolean(draftTitle.trim() || draftNotes.trim()));

  useEffect(() => {
    return () => window.clearTimeout(celebrateTimer.current);
  }, []);

  useEffect(() => {
    if (!celebrateName) return;

    const frame = window.requestAnimationFrame(() => {
      burstConfetti(celebrateNoteRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [celebrateName]);

  useEffect(() => {
    setPage(1);
  }, [filter, filterDate, query, pageSize]);

  function selectFilter(next: SweepFilter) {
    setFilterDate(null);
    setFilter(next);
  }

  function selectFilterDate(next: string) {
    setFilterDate(next);
    setPage(1);
  }

  function clearFilterDate() {
    setFilterDate(null);
  }

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    document.getElementById(COMPOSER_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById(COMPOSER_TITLE_ID)?.focus();
  }, [composerOpen]);

  function openComposer() {
    if (composerOpen) {
      document.getElementById(COMPOSER_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(COMPOSER_TITLE_ID)?.focus();
      return;
    }

    setComposerOpen(true);
  }

  function celebrate(name: string) {
    setCelebrateName(name);
    window.clearTimeout(celebrateTimer.current);
    celebrateTimer.current = window.setTimeout(() => setCelebrateName(null), 2800);
  }

  async function toggleItem(item: StoredMindSweepItem, checked: boolean) {
    const status = checked ? "achieved" : "todo";
    const previous = mindSweepByDate;
    setMindSweepByDate((current) => mapMindSweepItem(current, item.id, { status }));
    if (status === "achieved") {
      celebrate(item.title);
    }

    try {
      await setMindSweepStatus(createClient(), item.id, status);
      if (status === "achieved") {
        showUndo({
          message: "Marked as done.",
          onUndo: async () => {
            setCelebrateName(null);
            setMindSweepByDate(previous);
            try {
              await setMindSweepStatus(createClient(), item.id, "todo");
            } catch {
              setMindSweepByDate((current) => mapMindSweepItem(current, item.id, { status: "achieved" }));
              showToast("Couldn't undo that change. Please try again.", "error");
            }
          },
        });
      }
    } catch {
      setMindSweepByDate(previous);
      setCelebrateName(null);
      showToast("Couldn't update that item. Please try again.", "error");
    }
  }

  async function addItem(payload: { title: string; notes?: string; onDate: string }) {
    if (addSaving) {
      return;
    }

    setAddSaving(true);
    try {
      const onDate = payload.onDate.slice(0, 10);
      const sortOrder = frontMindSweepSortOrder(mindSweepByDate[onDate] ?? []);
      const row = await addMindSweepItem(createClient(), { ...payload, onDate, sortOrder });
      setMindSweepByDate((current) => mergeMindSweepItems(current, [row]));
      setDraftTitle("");
      setDraftNotes("");
      setDraftDate(today);
      setComposerOpen(false);
      setPage(1);
    } catch {
      showToast("Couldn't save that item. Please try again.", "error");
    } finally {
      setAddSaving(false);
    }
  }

  function deleteItems(ids: readonly string[]) {
    if (ids.length === 0) {
      return;
    }

    const previous = mindSweepByDate;
    const next =
      ids.length === 1
        ? removeMindSweepItem(previous, ids[0]!)
        : removeMindSweepItems(previous, ids);
    setMindSweepByDate(next);
    setSelectedIds((current) => {
      const remaining = new Set(current);
      for (const id of ids) {
        remaining.delete(id);
      }
      return remaining;
    });
    setPendingDeleteIds(null);

    showUndo({
      message: ids.length === 1 ? "Task deleted." : `${ids.length} tasks deleted.`,
      onUndo: () => {
        setMindSweepByDate(previous);
      },
      onCommit: async () => {
        try {
          if (ids.length === 1) {
            await deleteMindSweepItem(createClient(), ids[0]!);
          } else {
            await deleteMindSweepItems(createClient(), ids);
          }
          await persistMindSweepPatches(createClient(), mindSweepPatches(previous, next));
        } catch {
          setMindSweepByDate(previous);
          showToast(
            ids.length === 1
              ? "Couldn't delete that item. Please try again."
              : "Couldn't delete those items. Please try again.",
            "error",
          );
        }
      },
    });
  }

  function requestDelete(item: StoredMindSweepItem) {
    if (selectedIds.size > 1 && selectedIds.has(item.id)) {
      setPendingDeleteIds([...selectedIds]);
      return;
    }
    deleteItems([item.id]);
  }

  function confirmDelete() {
    if (!pendingDeleteIds) {
      return;
    }
    deleteItems(pendingDeleteIds);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(visibleItems.map((item) => item.id)));
  }

  function unselectAll() {
    setSelectedIds(new Set());
  }

  async function changeItemDate(item: StoredMindSweepItem, nextDate: string) {
    if (!parseIsoDate(nextDate)) {
      return;
    }

    if (selectedIds.has(item.id) && selectedIds.size > 0) {
      await assignSelectedToDate(nextDate);
      return;
    }

    const currentDate = item.on_date.slice(0, 10);
    if (nextDate === currentDate) {
      return;
    }

    const previous = mindSweepByDate;
    const next = relocateMindSweepItem(previous, item.id, nextDate);
    if (next === previous) {
      return;
    }

    setMindSweepByDate(next);

    try {
      await persistMindSweepPatches(createClient(), mindSweepPatches(previous, next));
      const dateLabel = formatItemDate(nextDate, today);
      showUndo({
        message: `Date changed to ${dateLabel}.`,
        onUndo: async () => {
          setMindSweepByDate(previous);
          try {
            await persistMindSweepPatches(createClient(), mindSweepPatches(next, previous));
          } catch {
            setMindSweepByDate(next);
            showToast("Couldn't undo that date change. Please try again.", "error");
          }
        },
      });
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't update that date. Please try again.", "error");
    }
  }

  async function assignSelectedToDate(nextDate: string) {
    if (selectedIds.size === 0 || !parseIsoDate(nextDate)) {
      return;
    }

    const selected = flattenMindSweepItems(mindSweepByDate)
      .filter((item) => selectedIds.has(item.id))
      .sort(
        (a, b) =>
          a.on_date.localeCompare(b.on_date) ||
          a.sort_order - b.sort_order ||
          a.created_at.localeCompare(b.created_at),
      );
    const ids = selected.map((item) => item.id);
    const previous = mindSweepByDate;
    let nextState = mindSweepByDate;
    for (const id of ids) {
      nextState = relocateMindSweepItem(nextState, id, nextDate);
    }
    setMindSweepByDate(nextState);

    try {
      await persistMindSweepPatches(createClient(), mindSweepPatches(previous, nextState));
      setSelectedIds(new Set());
      const dateLabel = formatItemDate(nextDate, today);
      showUndo({
        message:
          ids.length === 1
            ? `Date changed to ${dateLabel}.`
            : `${ids.length} tasks moved to ${dateLabel}.`,
        onUndo: async () => {
          setMindSweepByDate(previous);
          try {
            await persistMindSweepPatches(createClient(), mindSweepPatches(nextState, previous));
          } catch {
            setMindSweepByDate(nextState);
            showToast("Couldn't undo that date change. Please try again.", "error");
          }
        },
      });
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't assign those tasks. Please try again.", "error");
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-8 md:gap-6">
      <Card className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <IconMark size="lg" tone="primary-muted">
              <HeadCircuitIcon />
            </IconMark>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Text variant="overline" className="text-primary">
                  {ACTIVE_MIND_SWEEP.kicker}
                </Text>
              </div>
              <Text as="h1" variant="pageTitle" className="mt-1">
                {ACTIVE_MIND_SWEEP.title}
              </Text>
              <Text variant="description" className="mt-2 max-w-2xl">
                {ACTIVE_MIND_SWEEP.description}
              </Text>
            </div>
          </div>
          <Button size="md" className="shrink-0 self-start" onClick={openComposer}>
            <PlusIcon size={16} />
            {ACTIVE_MIND_SWEEP.newLabel}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-start gap-2 rounded-md border border-border bg-background px-4 py-3"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Text variant="overline" className="text-foreground-muted">
                  {stat.label}
                </Text>
                <IconMark size="sm" look="outline" tone={stat.iconTone}>
                  {stat.icon}
                </IconMark>
              </div>
              <Text as="span" variant="sectionTitle" className={STAT_COUNT_TONE[stat.iconTone]}>
                {stat.count}
              </Text>
            </div>
          ))}
        </div>
      </Card>

      {composerOpen ? (
        <AddMindSweepForm
          id={COMPOSER_ID}
          titleId={COMPOSER_TITLE_ID}
          title={draftTitle}
          onTitleChange={setDraftTitle}
          notes={draftNotes}
          onNotesChange={setDraftNotes}
          onDate={draftDate}
          onDateChange={setDraftDate}
          saving={addSaving}
          addLabel={ACTIVE_MIND_SWEEP.addLabel}
          captureTitle={ACTIVE_MIND_SWEEP.captureTitle}
          placeholder={ACTIVE_MIND_SWEEP.placeholder}
          notesPlaceholder={ACTIVE_MIND_SWEEP.notesPlaceholder}
          onSave={(payload) => void addItem(payload)}
          onCancel={() => {
            if (addSaving) {
              return;
            }
            setComposerOpen(false);
            setDraftTitle("");
            setDraftNotes("");
            setDraftDate(today);
          }}
        />
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          label="Filter mind sweep items"
          tone="primary"
          size="lg"
          value={filterDate ? "" : filter}
          onChange={(next) => selectFilter(next as SweepFilter)}
          options={filterTabs.map((tab) => ({
            value: tab.id,
            label: `${tab.label} (${tab.count})`,
          }))}
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-2xl lg:justify-end">
          <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
            <DatePicker
              showLabel={false}
              label={ACTIVE_MIND_SWEEP.datePlaceholder}
              placeholder={ACTIVE_MIND_SWEEP.datePlaceholder}
              value={filterDate ?? undefined}
              displayLabel={filterDateLabel ?? undefined}
              onChange={selectFilterDate}
              className="min-w-0 flex-1 sm:w-56"
              aria-label={ACTIVE_MIND_SWEEP.datePlaceholder}
            />
            {filterDate ? (
              <IconButton
                label="Clear date filter"
                look="outline"
                size="md"
                onClick={clearFilterDate}
              >
                <CloseIcon size={16} />
              </IconButton>
            ) : null}
          </div>
          <div className="w-full sm:min-w-0 sm:flex-1 lg:max-w-sm">
            <Input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={ACTIVE_MIND_SWEEP.searchPlaceholder}
              aria-label={ACTIVE_MIND_SWEEP.searchPlaceholder}
              leftIcon={<SearchIcon size={16} />}
            />
          </div>
        </div>
      </div>

      {filterDate && filterDateLabel ? (
        <Text variant="caption" className="text-foreground-muted">
          Showing {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} from{" "}
          {filterDateLabel}
        </Text>
      ) : null}

      {visibleItems.length > 0 ? (
        <Card className="flex w-full flex-col gap-section">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Text variant="caption" className="text-foreground-muted">
              Tap tasks to select them, then change any selected date to update all.
            </Text>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="type-label cursor-pointer text-primary disabled:cursor-default disabled:text-foreground-muted"
                disabled={allVisibleSelected}
                onClick={selectAllVisible}
              >
                Select all
              </button>
              <button
                type="button"
                className="type-label cursor-pointer text-primary disabled:cursor-default disabled:text-foreground-muted"
                disabled={selectedIds.size === 0}
                onClick={unselectAll}
              >
                Unselect
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {pagedItems.map((item) => {
              const onDate = item.on_date.slice(0, 10);
              const achieved = item.status === "achieved";
              const selected = selectedIds.has(item.id);
              return (
                <WrittenItem
                  key={item.id}
                  title={item.title}
                  notes={item.notes ?? undefined}
                  notesPlaceholder={ACTIVE_MIND_SWEEP.notesPlaceholder}
                  checkbox
                  checked={achieved}
                  achieved={achieved}
                  accent="var(--pp-magenta-400)"
                  dateLabel={formatItemDate(onDate, today)}
                  dateValue={onDate}
                  selectable
                  selected={selected}
                  onSelect={() => toggleSelected(item.id)}
                  onDateChange={(nextDate) => void changeItemDate(item, nextDate)}
                  onCheckedChange={(checked) => void toggleItem(item, checked)}
                  onDelete={() => requestDelete(item)}
                />
              );
            })}
          </div>
          <div className="pb-8">
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              total={visibleItems.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={PAGINATION_PAGE_SIZES}
              itemLabel="ideas"
            />
          </div>
        </Card>
      ) : composerOpen ? null : (
        <EmptyState
          media={<HeadCircuitIcon size="xl" className="text-(--pp-spring-green-700)" />}
          title={
            query.trim()
              ? ACTIVE_MIND_SWEEP.searchEmptyTitle
              : filterDate
                ? ACTIVE_MIND_SWEEP.dateEmptyTitle
                : ACTIVE_MIND_SWEEP.emptyTitle
          }
          description={
            query.trim()
              ? ACTIVE_MIND_SWEEP.searchEmptyDescription
              : filterDate
                ? ACTIVE_MIND_SWEEP.dateEmptyDescription
                : ACTIVE_MIND_SWEEP.emptyDescription
          }
          action={
            query.trim() ? (
              undefined
            ) : filterDate ? (
              <Button size="md" look="outline" onClick={clearFilterDate}>
                Clear date
              </Button>
            ) : (
              <Button size="md" onClick={openComposer}>
                <PlusIcon size={16} />
                {ACTIVE_MIND_SWEEP.newLabel}
              </Button>
            )
          }
        />
      )}

      <Dialog
        open={pendingDeleteIds !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteIds(null);
        }}
        title={
          pendingDeleteIds
            ? `Delete ${pendingDeleteIds.length} tasks?`
            : "Delete tasks?"
        }
        description={
          pendingDeleteIds
            ? `${pendingDeleteIds.length} tasks will be removed.`
            : undefined
        }
      >
        <DialogConfirmActions
          danger
          confirmLabel="Delete"
          onCancel={() => setPendingDeleteIds(null)}
          onConfirm={() => confirmDelete()}
        />
      </Dialog>

      {celebrateName ? (
        <p
          ref={celebrateNoteRef}
          role="status"
          className={cn(
            "type-status pointer-events-none fixed left-1/2 z-50 w-fit max-w-[min(100%-2rem,24rem)] -translate-x-1/2 truncate rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-25) px-4 py-2 text-center text-(--pp-bondi-blue-700) shadow-md animate-[pp-ready-check-pop_0.45s_cubic-bezier(0.22,1.15,0.36,1)_both]",
            banner ? "bottom-24" : "bottom-6",
          )}
        >
          Achieved ‘{celebrateName}’
        </p>
      ) : null}
      {banner ? (
        <UndoSnackbar message={banner.message} onUndo={undo} onDismiss={dismissBanner} />
      ) : null}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
