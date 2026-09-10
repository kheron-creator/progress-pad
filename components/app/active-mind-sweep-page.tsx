"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionStore } from "@/components/app/session-store-provider";
import { useRegisterUnsavedLeave } from "@/components/app/unsaved-leave-provider";
import { AddMindSweepForm } from "@/components/ui/add-mind-sweep-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { CalendarBlankIcon, CheckCircleIcon, HeadCircuitIcon, ListBulletsIcon, PlusIcon, SearchIcon } from "@/components/ui/icon";
import { IconMark, type IconMarkTone } from "@/components/ui/icon-mark";
import { Input } from "@/components/ui/input";
import { Pagination, PAGINATION_PAGE_SIZES } from "@/components/ui/pagination";
import { Tabs } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { WrittenItem } from "@/components/ui/written-item";
import { ACTIVE_MIND_SWEEP } from "@/lib/home/content";
import {
  addMindSweepItem,
  deleteMindSweepItem,
  flattenMindSweepItems,
  formatIsoDate,
  incompleteMindSweepItems,
  mapMindSweepItem,
  mergeMindSweepItems,
  parseIsoDate,
  relocateMindSweepItem,
  removeMindSweepItem,
  setMindSweepDate,
  setMindSweepStatus,
  updateMindSweepItem,
  type StoredMindSweepItem,
} from "@/lib/home/store";
import { createClient } from "@/lib/supabase/client";
import { burstConfetti } from "@/lib/ui/burst-confetti";

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
  const [filter, setFilter] = useState<SweepFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [query, setQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftDate, setDraftDate] = useState(today);
  const [addSaving, setAddSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [dirtyItemKeys, setDirtyItemKeys] = useState<ReadonlySet<string>>(() => new Set());
  const [deletePending, setDeletePending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StoredMindSweepItem | null>(null);
  const [celebrateName, setCelebrateName] = useState<string | null>(null);
  const celebrateNoteRef = useRef<HTMLParagraphElement>(null);
  const celebrateTimer = useRef(0);
  const visibleItems = useMemo(() => {
    const source =
      filter === "today"
        ? todayItems
        : filter === "achieved"
          ? achievedItems
          : filter === "active"
            ? activeItems
            : allItems;
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return source;
    }
    return source.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        (item.notes ?? "").toLowerCase().includes(needle),
    );
  }, [achievedItems, activeItems, allItems, filter, query, todayItems]);
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedItems = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filterTabs: { id: SweepFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: allItems.length },
    { id: "active", label: ACTIVE_MIND_SWEEP.stats.active, count: activeItems.length },
    { id: "today", label: ACTIVE_MIND_SWEEP.stats.today, count: todayItems.length },
    { id: "achieved", label: ACTIVE_MIND_SWEEP.stats.achieved, count: achievedItems.length },
  ];

  useRegisterUnsavedLeave(
    dirtyItemKeys.size > 0 || (composerOpen && Boolean(draftTitle.trim() || draftNotes.trim())),
  );

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
  }, [filter, query, pageSize]);

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
    } catch {
      setMindSweepByDate(previous);
      setCelebrateName(null);
      showToast("Couldn't update that item. Please try again.", "error");
    }
  }

  async function saveItem(item: StoredMindSweepItem, next: { title: string; notes?: string }) {
    const title = next.title.trim();
    if (!title) {
      return;
    }

    const notes = next.notes !== undefined ? next.notes.trim() || null : item.notes;
    if (item.title === title && item.notes === notes) {
      return;
    }

    const previous = mindSweepByDate;
    setMindSweepByDate((current) => mapMindSweepItem(current, item.id, { title, notes }));

    try {
      await updateMindSweepItem(createClient(), item.id, {
        title,
        notes,
      });
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't update that item. Please try again.", "error");
    }
  }

  function setItemDirty(id: string, dirty: boolean) {
    setDirtyItemKeys((current) => {
      const has = current.has(id);
      if (dirty === has) {
        return current;
      }

      const next = new Set(current);
      if (dirty) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function addItem(payload: { title: string; notes?: string; onDate: string }) {
    if (addSaving) {
      return;
    }

    setAddSaving(true);
    try {
      const row = await addMindSweepItem(createClient(), payload);
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

  async function confirmDelete() {
    if (!pendingDelete || deletePending) {
      return;
    }

    setDeletePending(true);
    try {
      await deleteMindSweepItem(createClient(), pendingDelete.id);
      setMindSweepByDate((current) => removeMindSweepItem(current, pendingDelete.id));
      setPendingDelete(null);
    } catch {
      showToast("Couldn't delete that item. Please try again.", "error");
    } finally {
      setDeletePending(false);
    }
  }

  async function changeItemDate(item: StoredMindSweepItem, nextDate: string) {
    const currentDate = item.on_date.slice(0, 10);
    if (nextDate === currentDate || !parseIsoDate(nextDate)) {
      return;
    }

    const previous = mindSweepByDate;
    setMindSweepByDate((current) => relocateMindSweepItem(current, item.id, nextDate));

    try {
      await setMindSweepDate(createClient(), item.id, nextDate);
    } catch {
      setMindSweepByDate(previous);
      showToast("Couldn't update that date. Please try again.", "error");
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-20 md:gap-6">
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
          value={filter}
          onChange={(next) => setFilter(next as SweepFilter)}
          options={filterTabs.map((tab) => ({
            value: tab.id,
            label: `${tab.label} (${tab.count})`,
          }))}
        />
        <div className="w-full lg:max-w-sm">
          <Input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={ACTIVE_MIND_SWEEP.searchPlaceholder}
            aria-label={ACTIVE_MIND_SWEEP.searchPlaceholder}
            leftIcon={<SearchIcon size={16} />}
          />
        </div>
      </div>



      {visibleItems.length > 0 ? (
        <Card className="flex w-full flex-col gap-section">
          <div className="flex flex-col gap-3">
            {pagedItems.map((item) => {
              const onDate = item.on_date.slice(0, 10);
              const achieved = item.status === "achieved";
              return (
                <WrittenItem
                  key={item.id}
                  title={item.title}
                  notes={item.notes ?? undefined}
                  notesEditable
                  notesPlaceholder={ACTIVE_MIND_SWEEP.notesPlaceholder}
                  checkbox
                  checked={achieved}
                  achieved={achieved}
                  accent="var(--pp-magenta-400)"
                  dateLabel={formatItemDate(onDate, today)}
                  dateValue={onDate}
                  onDateChange={(nextDate) => void changeItemDate(item, nextDate)}
                  onCheckedChange={(checked) => void toggleItem(item, checked)}
                  onChange={(next) => void saveItem(item, next)}
                  onDirtyChange={(dirty) => setItemDirty(item.id, dirty)}
                  onDelete={() => setPendingDelete(item)}
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
      ) : null}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePending) setPendingDelete(null);
        }}
        title="Delete this item?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed. This cannot be undone.`
            : undefined
        }
      >
        <DialogConfirmActions
          danger
          pending={deletePending}
          confirmLabel="Delete"
          onCancel={() => {
            if (!deletePending) setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      </Dialog>

      {celebrateName ? (
        <p
          ref={celebrateNoteRef}
          role="status"
          className="type-status pointer-events-none fixed bottom-6 left-1/2 z-50 w-fit max-w-[min(100%-2rem,24rem)] -translate-x-1/2 truncate rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-25) px-4 py-2 text-center text-(--pp-bondi-blue-700) shadow-md animate-[pp-ready-check-pop_0.45s_cubic-bezier(0.22,1.15,0.36,1)_both]"
        >
          Achieved ‘{celebrateName}’
        </p>
      ) : null}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
