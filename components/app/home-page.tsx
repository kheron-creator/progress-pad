"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CalendarStrip } from "@/components/ui/calendar-strip";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import {
  BarbellIcon,
  BookOpenIcon,
  BrainIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
  ChartLineIcon,
  ChecksIcon,
  HeadCircuitIcon,
  HeartIcon,
  LightbulbIcon,
  LightningIcon,
  QuotesIcon,
  SmileyIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@/components/ui/icon";
import { IconMark, type IconMarkSize } from "@/components/ui/icon-mark";
import { PillarRow } from "@/components/ui/pillar-row";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { TriggerCard, type TriggerCardState } from "@/components/ui/trigger-card";
import { WritingSection, type WritingSectionItem } from "@/components/ui/writing-section";
import {
  HOME_BANNERS,
  HOME_HEADING,
  HOME_HERO,
  HOME_PILLARS,
  HOME_PILLAR_SECTION,
  HOME_TRIGGERS,
  HOME_TRIGGER_SECTION,
  HOME_WRITING_SECTIONS,
} from "@/lib/home/content";
import { cn } from "@/lib/utils/cn";

const HOME_BANNER_IMAGES = {
  hero: "/brand/home-banner-professional.jpg",
  triggers: "/brand/home-banner-triggers.jpg",
  writing: "/brand/home-banner-actions.jpg",
  pillars: "/brand/home-banner-pillars.jpg",
} as const;
const MOBILE_TRIGGER_COUNT = 5;

const PILLAR_ICONS = {
  mentally: <BrainIcon />,
  emotionally: <SmileyIcon />,
  professionally: <BriefcaseIcon />,
  physically: <BarbellIcon />,
  socially: <UsersThreeIcon />,
  romantically: <HeartIcon />,
} as const;

type HomeTrigger = {
  id: string;
  title: string;
  state: TriggerCardState;
};

type HomeWritingItems = Record<string, WritingSectionItem[]>;

const WRITING_DRAFTS: Record<string, string> = Object.fromEntries(
  HOME_WRITING_SECTIONS.map((section) => [section.id, ""]),
);

const WRITING_NOTE_DRAFTS: Record<string, string> = Object.fromEntries(
  HOME_WRITING_SECTIONS.map((section) => [section.id, ""]),
);

const WRITING_ITEMS: HomeWritingItems = Object.fromEntries(
  HOME_WRITING_SECTIONS.map((section) => [
    section.id,
    (section.items as readonly WritingSectionItem[]).map((item) => ({ ...item })),
  ]),
);

const PILLAR_RATINGS: Record<string, number> = Object.fromEntries(
  HOME_PILLARS.map((pillar) => [pillar.id, 5]),
);

const PILLAR_NOTES: Record<string, string> = Object.fromEntries(
  HOME_PILLARS.map((pillar) => [pillar.id, ""]),
);

function formatChipDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatChipDateShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function BannerKicker({ children }: { children: string }) {
  return (
    <Chip
      state="outlined"
      size="xs"
      className="pointer-events-none border-(--pp-bondi-blue-600)! bg-(--pp-bondi-blue-25)! text-(--pp-bondi-blue-600)! uppercase"
    >
      {children}
    </Chip>
  );
}

function HomeBanner({
  size,
  kicker,
  title,
  description,
  image,
  imageClassName,
  priority = false,
}: {
  size: "sm" | "lg";
  kicker: string;
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <Banner
      size={size}
      title={title}
      description={description}
      kicker={<BannerKicker>{kicker}</BannerKicker>}
      media={
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          quality={100}
          sizes="(min-width: 64rem) 1024px, 100vw"
          className={cn("object-cover", imageClassName)}
        />
      }
    />
  );
}

function SectionIcon({ children, size = "lg" }: { children: ReactNode; size?: IconMarkSize }) {
  return <IconMark size={size}>{children}</IconMark>;
}

function CountChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-(--pp-space-4) rounded-full border border-(--pp-bondi-blue-600) bg-(--pp-bondi-blue-50) px-(--pp-space-16) py-(--pp-space-4) text-(length:--pp-font-size-12) font-(--pp-font-weight-semibold) leading-none text-(--pp-bondi-blue-600) max-sm:px-(--pp-space-8)">
      {children}
    </span>
  );
}

function ItemIcon({ children }: { children: ReactNode }) {
  return (
    <IconMark size="sm" tone="accent">
      {children}
    </IconMark>
  );
}

export function HomePage() {
  const [date, setDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [triggers, setTriggers] = useState<HomeTrigger[]>(() =>
    HOME_TRIGGERS.map((trigger) => ({ ...trigger })),
  );
  const [showAllTriggers, setShowAllTriggers] = useState(false);
  const [drafts, setDrafts] = useState(WRITING_DRAFTS);
  const [noteDrafts, setNoteDrafts] = useState(WRITING_NOTE_DRAFTS);
  const [writingItems, setWritingItems] = useState(WRITING_ITEMS);
  const [ratings, setRatings] = useState(PILLAR_RATINGS);
  const [pillarNotes, setPillarNotes] = useState(PILLAR_NOTES);
  const [pendingDelete, setPendingDelete] = useState<{
    sectionId: string;
    id: string;
    name: string;
  } | null>(null);
  const { toasts, showToast } = useToasts();

  const achievedCount = triggers.filter((trigger) => trigger.state === "achieved").length;
  const triggerProgress = Math.round((achievedCount / triggers.length) * 100);
  const pillarAverage =
    HOME_PILLARS.reduce((sum, pillar) => sum + (ratings[pillar.id] ?? 5), 0) / HOME_PILLARS.length;

  const chipDate = useMemo(() => formatChipDate(date), [date]);
  const chipDateShort = useMemo(() => formatChipDateShort(date), [date]);

  function toggleTrigger(id: string) {
    setTriggers((current) =>
      current.map((trigger) => {
        if (trigger.id !== id) {
          return trigger;
        }

        const next: TriggerCardState = trigger.state === "achieved" ? "todo" : "achieved";
        return { ...trigger, state: next };
      }),
    );
  }

  function updateWritingItem(sectionId: string, id: string, checked: boolean) {
    setWritingItems((current) => ({
      ...current,
      [sectionId]: (current[sectionId] ?? []).map((item) =>
        item.id === id
          ? {
            ...item,
            checked,
            achieved: checked,
            variant: checked ? ("striked" as const) : ("default" as const),
          }
          : item,
      ),
    }));
  }

  function addWritingItem(sectionId: string, title: string, notes?: string) {
    const section = HOME_WRITING_SECTIONS.find((entry) => entry.id === sectionId);
    const alwaysAchieved = Boolean(
      section && "alwaysAchieved" in section && section.alwaysAchieved,
    );

    setWritingItems((current) => ({
      ...current,
      [sectionId]: [
        ...(current[sectionId] ?? []),
        {
          id: `${sectionId}-${Date.now()}`,
          title,
          notes,
          checked: alwaysAchieved,
          achieved: alwaysAchieved,
          variant: alwaysAchieved ? ("striked" as const) : undefined,
        },
      ],
    }));
    setDrafts((current) => ({ ...current, [sectionId]: "" }));
    setNoteDrafts((current) => ({ ...current, [sectionId]: "" }));
  }

  function deleteWritingItem(sectionId: string, id: string) {
    setWritingItems((current) => ({
      ...current,
      [sectionId]: (current[sectionId] ?? []).filter((item) => item.id !== id),
    }));
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteWritingItem(pendingDelete.sectionId, pendingDelete.id);
    setPendingDelete(null);
  }

  function writingSection(section: (typeof HOME_WRITING_SECTIONS)[number]) {
    const isGratitude = section.id === "gratitude";
    const isMindSweep = section.id === "mind-sweep";
    const isDoneList = section.id === "done-list";
    const isQuotes = section.id === "quotes";
    const isJournal = section.id === "journal";
    const isReflections = section.id === "reflections";
    const isComposer = Boolean("composer" in section && section.composer);
    const items = writingItems[section.id] ?? WRITING_ITEMS[section.id] ?? [];
    const achievedCount = items.filter((item) => item.checked || item.achieved).length;
    const chip =
      "chip" in section
        ? section.chip === "achieved"
          ? `${achievedCount} / ${items.length} Achieved`
          : section.chip === "done"
            ? `${items.length} Done Today`
            : section.chip === "quotes"
              ? `${items.length} Quotes`
              : section.chip === "notes"
                ? `${items.length} Notes`
                : section.chip === "lessons"
                  ? `${items.length} Lessons`
                  : `${items.length} Logged`
        : undefined;
    const progress =
      "showProgress" in section && section.showProgress
        ? items.length === 0
          ? 0
          : Math.round((achievedCount / items.length) * 100)
        : undefined;

    return (
      <WritingSection
        key={section.id}
        title={section.title}
        description={section.description}
        composer={isComposer}
        accent={section.accent}
        addLabel={"addLabel" in section ? section.addLabel : undefined}
        submitIcon={
          "addIcon" in section && section.addIcon === "check"
            ? "check"
            : "addIcon" in section && section.addIcon === "none"
              ? false
              : isMindSweep
                ? false
                : true
        }
        notesPlaceholder={"notesPlaceholder" in section ? section.notesPlaceholder : undefined}
        notesValue={noteDrafts[section.id] ?? ""}
        onNotesChange={(value) =>
          setNoteDrafts((current) => ({ ...current, [section.id]: value }))
        }
        itemCheckbox={isComposer ? isMindSweep : undefined}
        itemLocked={Boolean("alwaysAchieved" in section && section.alwaysAchieved)}
        progress={progress}
        progressLabel={`${section.title} progress`}
        icon={
          isGratitude ? (
            <IconMark size="lg" tone="secondary">
              <SparkleIcon />
            </IconMark>
          ) : isMindSweep ? (
            <IconMark size="lg" tone="accent">
              <HeadCircuitIcon />
            </IconMark>
          ) : isDoneList ? (
            <IconMark size="lg" tone="primary">
              <ChecksIcon />
            </IconMark>
          ) : isQuotes ? (
            <IconMark size="lg" className="bg-(--pp-purple-500)! text-white">
              <QuotesIcon />
            </IconMark>
          ) : isJournal ? (
            <IconMark size="lg" className="bg-(--pp-pink-500)! text-white">
              <BookOpenIcon />
            </IconMark>
          ) : isReflections ? (
            <IconMark size="lg" className="bg-(--pp-cobalt-500)! text-white">
              <LightbulbIcon />
            </IconMark>
          ) : (
            <SectionIcon>
              <SparkleIcon />
            </SectionIcon>
          )
        }
        tag={chip ? <CountChip>{chip}</CountChip> : undefined}
        placeholder={section.placeholder}
        value={drafts[section.id] ?? ""}
        onChange={(value) => setDrafts((current) => ({ ...current, [section.id]: value }))}
        items={items}
        onCheckedChange={(id, checked) => updateWritingItem(section.id, id, checked)}
        onAdd={isComposer ? (title, notes) => addWritingItem(section.id, title, notes) : undefined}
        onDelete={
          isComposer
            ? (id) => {
              const item = items.find((entry) => entry.id === id);
              setPendingDelete({
                sectionId: section.id,
                id,
                name: item?.title ?? "this item",
              });
            }
            : undefined
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <HomeBanner
        size="lg"
        kicker={HOME_HERO.kicker}
        title={HOME_HERO.title}
        description={HOME_HERO.description}
        image={HOME_BANNER_IMAGES.hero}
        priority
      />

      <section className="flex flex-col items-center gap-1 py-2 text-center">
        <Chip
          state="outlined"
          size="lg"
          leftIcon={<CalendarBlankIcon size={12} />}
          className="pointer-events-none"
        >
          <span className="max-sm:hidden">{chipDate}</span>
          <span className="sm:hidden">{chipDateShort}</span>
        </Chip>
        <Text
          as="h1"
          variant="display"
          className="text-center lg:text-[4.5rem] lg:leading-28"
        >
          {HOME_HEADING.title}
        </Text>
        <Text
          as="p"
          variant="sectionTitle"
          className="text-center font-normal text-secondary"
        >
          {HOME_HEADING.subtitle}
        </Text>
      </section>

      <CalendarStrip
        value={date}
        onChange={setDate}
        view={calendarView}
        onViewChange={setCalendarView}
        className="max-w-none"
      />

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.triggers.kicker}
        title={HOME_BANNERS.triggers.title}
        description={HOME_BANNERS.triggers.description}
        image={HOME_BANNER_IMAGES.triggers}
      />

      <Card className="flex w-full flex-col gap-section">
        <TriggerCard
          title={HOME_TRIGGER_SECTION.title}
          description={HOME_TRIGGER_SECTION.description}
          leftIcon={
            <SectionIcon size="lg">
              <LightningIcon />
            </SectionIcon>
          }
          tag={
            <CountChip>
              {achievedCount} / {triggers.length} Achieved
            </CountChip>
          }
        />

        <Progress value={triggerProgress} size="md" label="Today’s trigger progress" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {triggers.map((trigger, index) => {
            const hiddenOnMobile = !showAllTriggers && index >= MOBILE_TRIGGER_COUNT;

            return (
              <TriggerCard
                key={trigger.id}
                kind="item"
                state={trigger.state}
                title={trigger.title}
                leftEmoji={false}
                showDescription={false}
                className={cn("cursor-pointer", hiddenOnMobile && "hidden md:flex")}
                onClick={() => toggleTrigger(trigger.id)}
              />
            );
          })}
        </div>

        {!showAllTriggers ? (
          <Button
            className="md:hidden max-sm:w-full"
            size="md"
            variant="secondary"
            look="outline"
            onClick={() => setShowAllTriggers(true)}
          >
            Show all triggers
          </Button>
        ) : null}
      </Card>

      {writingSection(HOME_WRITING_SECTIONS[0])}

      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.writing.kicker}
        title={HOME_BANNERS.writing.title}
        description={HOME_BANNERS.writing.description}
        image={HOME_BANNER_IMAGES.writing}
      />

      {HOME_WRITING_SECTIONS.slice(1, 3).map(writingSection)}


      <HomeBanner
        size="sm"
        kicker={HOME_BANNERS.pillars.kicker}
        title={HOME_BANNERS.pillars.title}
        description={HOME_BANNERS.pillars.description}
        image={HOME_BANNER_IMAGES.pillars}
      />

      {HOME_WRITING_SECTIONS.slice(3).map(writingSection)}

      <Card className="flex w-full flex-col gap-section">
        <TriggerCard
          title={HOME_PILLAR_SECTION.title}
          description={HOME_PILLAR_SECTION.description}
          leftIcon={
            <IconMark size="lg" tone="accent">
              <ChartLineIcon />
            </IconMark>
          }
          tag={
            <CountChip>
              <span className="max-sm:hidden">Progression Balance: </span>
              {pillarAverage.toFixed(1)}/10
            </CountChip>
          }
        />
        <div className="flex flex-col gap-(--pp-space-12)">
          {HOME_PILLARS.map((pillar) => (
            <PillarRow
              key={pillar.id}
              title={pillar.title}
              description={pillar.description}
              placeholder={pillar.placeholder}
              value={ratings[pillar.id] ?? 5}
              notes={pillarNotes[pillar.id] ?? ""}
              onChange={(value) => {
                setRatings((current) => ({ ...current, [pillar.id]: value }));
              }}
              onNotesChange={(value) => {
                setPillarNotes((current) => ({ ...current, [pillar.id]: value }));
              }}
              icon={<ItemIcon>{PILLAR_ICONS[pillar.id]}</ItemIcon>}
            />
          ))}
        </div>
        <div className="flex justify-end max-sm:w-full">
          <Button size="md" className="max-sm:w-full" onClick={() => showToast(HOME_PILLAR_SECTION.saved)}>
            {HOME_PILLAR_SECTION.saveLabel}
          </Button>
        </div>
      </Card>
      <ToastRegion toasts={toasts} />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this item?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed. This cannot be undone.`
            : undefined
        }
      >
        <DialogConfirmActions
          danger
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      </Dialog>
    </div>
  );
}
