"use client";

import { useState, type ReactNode } from "react";

import { ActivityGrid } from "@/components/ui/activity-grid";
import { AssistantChat } from "@/components/ui/assistant-chat";
import { AssistantFab } from "@/components/ui/assistant-fab";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CalendarStrip } from "@/components/ui/calendar-strip";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceItem } from "@/components/ui/choice-item";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { Dropdown } from "@/components/ui/dropdown";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { FeatureCard } from "@/components/ui/feature-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { FlowNavigator } from "@/components/ui/flow-navigator";
import { Header } from "@/components/ui/header";
import { IconButton } from "@/components/ui/icon-button";
import { IconMark } from "@/components/ui/icon-mark";
import {
  BarbellIcon,
  ChatIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
  GridIcon,
  LightningIcon,
  ListBulletsIcon,
  MoonIcon,
  NoteIcon,
  SparkleIcon,
  StarIcon,
  SunIcon,
} from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { NavLinks } from "@/components/ui/nav-links";
import { Progress } from "@/components/ui/progress";
import { ProgressSection } from "@/components/ui/progress-section";
import { QuestionField } from "@/components/ui/question-field";
import { Radio } from "@/components/ui/radio";
import { ScenariosLibrary } from "@/components/ui/scenarios-library";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { TriggerCard } from "@/components/ui/trigger-card";
import { TriggerDropzone } from "@/components/ui/trigger-dropzone";
import { TriggerListItem } from "@/components/ui/trigger-list-item";
import { TriggersLibrary } from "@/components/ui/triggers-library";
import { WrittenItem } from "@/components/ui/written-item";

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <Text as="h2" variant="sectionTitle">
        {title}
      </Text>
      {children}
    </section>
  );
}

const DEMO_FILTERS = [
  { id: "exclude", label: "Exclude" },
  { id: "member-progress", label: "Member Progress" },
  { id: "search-member", label: "Search Member" },
  { id: "exclude-terms", label: "Exclude terms" },
  { id: "general-health", label: "General health" },
];

const DEMO_LIBRARY_TRIGGERS = [
  { id: "running", name: "Running track" },
  { id: "beach", name: "Go to the beach" },
  { id: "stretch", name: "Morning stretch" },
];

const DEMO_FLOW_ITEMS = [
  { id: "general", label: "Overview & Stats", count: 4, icon: <GridIcon size={14} /> },
  { id: "triggers", label: "Common Triggers", count: 12, icon: <LightningIcon size={14} /> },
  { id: "habits", label: "Habit Sweep", count: 3, icon: <ListBulletsIcon size={14} /> },
  { id: "today", label: "Progress Today", count: 6, icon: <CheckCircleIcon size={14} /> },
  { id: "assistant", label: "Progress Assistant", count: 1, icon: <ChatIcon size={14} /> },
];

const DEMO_CHAT = [
  { id: "1", role: "assistant" as const, text: "What would you like to work on today?" },
  { id: "2", role: "user" as const, text: "Help me plan a short walk after lunch." },
  { id: "3", role: "assistant" as const, text: "I can add that as a trigger. Want it on Progress Today?" },
];

const DEMO_SECTION_ITEMS = [
  { id: "1", title: "Write the first sentence" },
  { id: "2", title: "Take a 10-minute walk" },
];

const DEMO_DROPPED = [
  { id: "1", name: "Running track" },
  { id: "2", name: "Go to the beach" },
];

const DEMO_SCENARIOS = [
  { id: "deep-work", title: "Deep Work Flow", meta: "0:45 h" },
  { id: "healthy", title: "Healthy Body", meta: "7 Triggers" },
  { id: "morning", title: "Productive Morning", meta: "3 Triggers" },
];

const DEMO_ACTIVITY_ROWS = [
  { id: "r1", values: [true, true, true, true, true, true, true, true, true, true, true, true] },
  { id: "r2", values: [true, true, true, true, true, true, true, false, false, false, false, false] },
  { id: "r3", values: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { id: "r4", values: [true, true, true, true, true, true, false, false, false, false, false, false] },
  { id: "r5", values: [true, true, false, false, false, false, false, false, false, false, false, false] },
];

const DEMO_CALENDAR_MARKERS = {
  "2026-08-03": { dot: true },
  "2026-08-09": { count: 10, dot: true },
  "2026-08-13": { dot: true, icon: <NoteIcon size={12} /> },
  "2026-08-20": { dot: true },
  "2026-08-24": { dot: true },
};

export function ComponentGallery() {
  const [tab, setTab] = useState("list");
  const [status, setStatus] = useState("open");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [writtenChecked, setWrittenChecked] = useState(false);
  const [navSelected, setNavSelected] = useState("progress-today");
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 7, 13));
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 7, 13));
  const [monthView, setMonthView] = useState<"week" | "month">("month");
  const [filters, setFilters] = useState(DEMO_FILTERS);
  const [scaleValue, setScaleValue] = useState(5);
  const [listChecked, setListChecked] = useState(true);
  const [flowView, setFlowView] = useState<"templates" | "library">("templates");
  const [flowSelected, setFlowSelected] = useState("general");
  const [flowQuery, setFlowQuery] = useState("");
  const [chatValue, setChatValue] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryName, setLibraryName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [sectionDetail, setSectionDetail] = useState("");
  const [choiceId, setChoiceId] = useState("deep-work");
  const [featureId, setFeatureId] = useState("today");
  const [scenarioName, setScenarioName] = useState("Productive Morning");
  const [scenarioDescription, setScenarioDescription] = useState("");

  return (
    <>
      <PreviewSection title="Buttons">
        <div className="flex flex-col gap-6">
          {(["primary", "secondary", "danger"] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-3">
              <Text variant="label" className="capitalize">
                {variant}
              </Text>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={variant}>Filled</Button>
                <Button variant={variant} look="outline">
                  Outline
                </Button>
                <Button variant={variant} look="ghost">
                  Ghost
                </Button>
                <Button variant={variant} size="sm">
                  SM
                </Button>
                <Button variant={variant} size="md">
                  MD
                </Button>
                <Button variant={variant} size="lg">
                  LG
                </Button>
                <Button variant={variant} size="xl">
                  XL
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} loading>
                  Saving
                </Button>
                <IconButton label="Close" variant={variant}>
                  <CloseIcon />
                </IconButton>
              </div>
              {variant === "primary" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button look="outline">
                    <ChevronLeftIcon size={14} />
                    Back
                  </Button>
                  <Button>Continue</Button>
                  <Button variant="danger" look="outline">
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Header and nav">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text variant="caption">Nav links — selected item</Text>
            <div className="flex w-full flex-col gap-2">
              {["dashboard", "habit-sweep", "progress-today", "triggers", "assistant"].map((id) => (
                <NavLinks key={id} selected={id} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="caption">Header</Text>
            <div className="w-full overflow-hidden rounded-md border border-border">
              <Header selected={navSelected} onSelect={setNavSelected} />
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Inputs">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Text variant="label">Size</Text>
            <div className="grid gap-field md:grid-cols-4">
              {([
                ["xl", "XL"],
                ["lg", "LG"],
                ["md", "MD"],
                ["sm", "SM"],
              ] as const).map(([size, name]) => (
                <div key={size} className="flex flex-col gap-2">
                  <Text variant="caption">{name}</Text>
                  <Input
                    size={size}
                    label="Label"
                    placeholder="Placeholder"
                    hint="Helper Text"
                    leftIcon={<StarIcon />}
                    rightIcon={<ChevronDownIcon />}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Text variant="label">State</Text>
            <div className="grid gap-field md:grid-cols-2">
              <Input
                label="Default"
                placeholder="Placeholder"
                hint="Helper Text"
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
              <Input
                state="filled"
                label="Filled"
                defaultValue="Progress Today"
                hint="Helper Text"
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
              <Input
                state="focus"
                label="Focus"
                placeholder="Placeholder"
                hint="Helper Text"
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
              <Input
                state="success"
                label="Success"
                defaultValue="Looks good"
                hint="This value is valid."
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
              <Input
                state="error"
                label="Error"
                defaultValue="nope"
                hint="Enter a valid email."
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
              <Input
                state="disabled"
                label="Disabled"
                placeholder="Unavailable"
                hint="Helper Text"
                leftIcon={<StarIcon />}
                rightIcon={<ChevronDownIcon />}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Text variant="label">Label, helper, and icons</Text>
            <div className="grid gap-field md:grid-cols-2">
              <Input placeholder="No label" hint="Helper Text" />
              <Input label="Label only" placeholder="Placeholder" />
              <Input label="Left icon" placeholder="Placeholder" leftIcon={<StarIcon />} />
              <Input label="Right icon" placeholder="Placeholder" rightIcon={<ChevronDownIcon />} />
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Forms">
        <div className="grid gap-field md:grid-cols-2">
          <Textarea
            label="Notes"
            placeholder="Write a reflection"
            hint="This is a generic multiline field."
          />
          <Select label="Reminder time" defaultValue="morning" hint="Native select for forms.">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </Select>
          <div className="flex flex-col gap-3">
            <Input label="Email address" placeholder="you@gmail.com" />
            <PasswordInput label="Password" placeholder="••••••••" />
            <Button size="lg" fullWidth>
              Get started now
            </Button>
          </div>
          <Dropdown
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "open", label: "Open" },
              { value: "doing", label: "In progress" },
              { value: "done", label: "Done" },
            ]}
          />
          <div className="flex flex-col gap-3">
            <Text variant="label">Choices</Text>
            <Checkbox label="Save this as a default" defaultChecked />
            <Checkbox label="I agree to Terms & Conditions" size="sm" />
            <Checkbox label="Disabled option" disabled />
            <Radio name="cadence" value="daily" label="Daily" defaultChecked />
            <Radio name="cadence" value="weekly" label="Weekly" />
            <Toggle label="Show completed items" defaultChecked />
            <Toggle label="Unavailable" disabled />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Cards">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <Text variant="cardTitle">Default</Text>
            <Text variant="description" className="mt-2">
              Border, no elevation. Use for list rows and form groups.
            </Text>
          </Card>
          <Card variant="elevated">
            <Text variant="cardTitle">Elevated</Text>
            <Text variant="description" className="mt-2">
              Soft shadow for banners, modals, and floating panels.
            </Text>
          </Card>
          <Card variant="interactive">
            <Text variant="cardTitle">Interactive</Text>
            <Text variant="description" className="mt-2">
              Hover lift for clickable surfaces. Pair with a button or link.
            </Text>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection title="Chips">
        <div className="flex flex-col gap-6">
          {(["default", "selected", "outlined"] as const).map((state) => (
            <div key={state} className="flex flex-col gap-2">
              <Text variant="caption" className="capitalize">
                {state}
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                {(["xs", "sm", "md", "lg"] as const).map((size) => (
                  <Chip
                    key={size}
                    state={state}
                    size={size}
                    leftIcon={<SparkleIcon size={size === "lg" ? 16 : 12} />}
                    rightIcon={<SparkleIcon size={size === "lg" ? 16 : 12} />}
                  >
                    Chip
                  </Chip>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <Text variant="label">On screens</Text>
            <Chip state="selected" size="lg">
              Mind Sweep
            </Chip>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Tags">
        <div className="flex flex-col gap-6">
          {(["default", "primary", "secondary", "tertiary", "error"] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-2">
              <Text variant="caption" className="capitalize">
                {variant}
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                {(["default", "outline"] as const).map((look) =>
                  (["lg", "sm", "xs"] as const).map((size) => (
                    <Tag
                      key={`${look}-${size}`}
                      variant={variant}
                      look={look}
                      size={size}
                      leftIcon={<SparkleIcon size={size === "lg" ? 14 : 12} />}
                    >
                      Tag Item
                    </Tag>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="secondary">Secondary</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="error">Error</Badge>
          <Badge tone="info">Info</Badge>
          <Badge look="outline" tone="primary">
            Outline
          </Badge>
        </div>
      </PreviewSection>

      <PreviewSection title="Banners">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text variant="caption">Hero with media overlay</Text>
            <Banner
              size="lg"
              title="Banner Title"
              description="Small cues that help your day flow. Capture what matters, then take the next step."
              kicker={
                <Tag variant="tertiary" size="xs">
                  Progress Today
                </Tag>
              }
              media={<div className="h-full w-full bg-gradient-to-br from-secondary to-accent" />}
            />
            <Banner
              size="sm"
              title="Banner Title"
              description="Let’s create your account and keep the plan light."
              kicker={
                <Tag variant="tertiary" size="xs">
                  Mind Sweep
                </Tag>
              }
              media={<div className="h-full w-full bg-gradient-to-br from-accent to-primary" />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="caption">Compact strip</Text>
            <Banner
              look="compact"
              tone="accent"
              title="Section header"
              description="Subtitle / description"
              icon={<SparkleIcon />}
              onDismiss={() => undefined}
            />
            <Banner
              look="compact"
              tone="inverse"
              title="Section header"
              description="Subtitle / description"
              icon={<SparkleIcon />}
              onDismiss={() => undefined}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Triggers library">
        <div className="grid gap-6 lg:grid-cols-2">
          <TriggersLibrary
            items={DEMO_LIBRARY_TRIGGERS}
            query={libraryQuery}
            onQueryChange={setLibraryQuery}
            onDelete={() => undefined}
            onAdd={() => undefined}
          />
          <TriggersLibrary
            state="add"
            name={libraryName}
            onNameChange={setLibraryName}
            onSave={() => undefined}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Flow navigator">
        <FlowNavigator
          items={DEMO_FLOW_ITEMS.map((item) => ({
            ...item,
            icon: (
              <IconMark size="xs">
                {item.icon}
              </IconMark>
            ),
          }))}
          selected={flowSelected}
          onSelect={setFlowSelected}
          query={flowQuery}
          onQueryChange={setFlowQuery}
          view={flowView}
          onViewChange={setFlowView}
          onClose={() => undefined}
          onSave={() => undefined}
        />
      </PreviewSection>

      <PreviewSection title="Progress assistant">
        <div className="flex flex-col gap-6">
          <AssistantChat
            messages={DEMO_CHAT}
            value={chatValue}
            onChange={setChatValue}
            onSend={() => setChatValue("")}
            onClose={() => undefined}
          />
          <AssistantFab onClick={() => undefined} />
        </div>
      </PreviewSection>

      <PreviewSection title="Progress section">
        <div className="flex flex-col gap-6">
          <ProgressSection
            heading="Heading"
            description="Subtitle / detail"
            progress={35}
            name={sectionName}
            onNameChange={setSectionName}
            detail={sectionDetail}
            onDetailChange={setSectionDetail}
            onAdd={() => undefined}
            onUpdate={() => undefined}
          />
          <ProgressSection
            heading="Heading"
            description="Subtitle / detail"
            progress={70}
            items={DEMO_SECTION_ITEMS}
            onDelete={() => undefined}
            onAdd={() => undefined}
            onUpdate={() => undefined}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Trigger dropzone">
        <div className="grid gap-6 lg:grid-cols-2">
          <TriggerDropzone description="Drag and drop your triggers" />
          <TriggerDropzone state="added" items={DEMO_DROPPED} onRemove={() => undefined} />
        </div>
      </PreviewSection>

      <PreviewSection title="Scenarios library">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ScenariosLibrary
              items={DEMO_SCENARIOS.map((item) => ({
                ...item,
                icon: (
                  <IconMark size="xs" tone={item.id === "healthy" ? "primary" : "accent"}>
                    {item.id === "healthy" ? (
                      <BarbellIcon size={12} />
                    ) : item.id === "morning" ? (
                      <SunIcon size={12} />
                    ) : (
                      <MoonIcon size={12} />
                    )}
                  </IconMark>
                ),
              }))}
              notice="New Scenario Added in the Library!"
              onDelete={() => undefined}
              onAdd={() => undefined}
            />
            <ScenariosLibrary
              state="add"
              name={scenarioName}
              onNameChange={setScenarioName}
              description={scenarioDescription}
              onDescriptionChange={setScenarioDescription}
              onSave={() => undefined}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Choice items">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Text variant="sectionTitle">Header</Text>
            <Text variant="description">Description</Text>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Text variant="caption">Large</Text>
              <ChoiceItem
                label="Name"
                selected={choiceId === "deep-work"}
                onClick={() => setChoiceId("deep-work")}
              />
              <ChoiceItem
                label="Name"
                selected={choiceId === "healthy"}
                onClick={() => setChoiceId("healthy")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Text variant="caption">Small</Text>
              <ChoiceItem
                size="sm"
                label="Name"
                selected={choiceId === "morning"}
                onClick={() => setChoiceId("morning")}
              />
              <ChoiceItem
                size="sm"
                label="Name"
                selected={choiceId === "evening"}
                onClick={() => setChoiceId("evening")}
              />
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Feature cards">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <FeatureCard
              title="Title"
              description="Descriptor"
              selected={featureId === "today"}
              onClick={() => setFeatureId("today")}
            />
            <FeatureCard
              title="Title"
              description="Descriptor"
              selected={featureId === "sweep"}
              onClick={() => setFeatureId("sweep")}
            />
          </div>
          <div className="flex flex-col gap-3 sm:max-w-[20rem]">
            <FeatureCard
              size="sm"
              title="Title"
              description="Descriptor"
              selected={featureId === "compact"}
              onClick={() => setFeatureId("compact")}
            />
            <FeatureCard
              size="sm"
              title="Title"
              description="Descriptor"
              selected={featureId === "compact-b"}
              onClick={() => setFeatureId("compact-b")}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Activity grid">
        <ActivityGrid rows={DEMO_ACTIVITY_ROWS} label="Weekly activity" />
      </PreviewSection>

      <PreviewSection title="Trigger cards">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text variant="caption">Section header (list + pillars)</Text>
            <TriggerCard
              title="Today’s triggers"
              description="Small cues that help your day flow."
              leftIcon={
                <IconMark>
                  <LightningIcon size={14} />
                </IconMark>
              }
              tag={
                <Tag variant="tertiary" look="outline" size="xs">
                  Tag
                </Tag>
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="caption">Item states</Text>
            <div className="flex flex-col gap-2">
              <TriggerCard
                kind="item"
                state="todo"
                title="Trigger Name"
                description="description"
                onDelete={() => undefined}
              />
              <TriggerCard
                kind="item"
                state="achieved"
                title="Trigger Name"
                description="description"
                onDelete={() => undefined}
              />
              <TriggerCard kind="item" state="select" title="Trigger Name" description="description" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="caption">Item — property toggles</Text>
            <TriggerCard
              kind="item"
              title="No description"
              description="hidden"
              showDescription={false}
              onDelete={() => undefined}
            />
            <TriggerCard
              kind="item"
              title="No status"
              description="description"
              status={false}
              onDelete={() => undefined}
            />
            <TriggerCard
              kind="item"
              title="No leading icon"
              description="description"
              leftIcon={false}
              onDelete={() => undefined}
            />
            <TriggerCard
              kind="item"
              title="No emoji"
              description="description"
              leftEmoji={false}
              onDelete={() => undefined}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Trigger list items">
        <div className="flex flex-col gap-2">
          <TriggerListItem title="Trigger Name" description="description" />
          <TriggerListItem
            title="Trigger Name"
            description="description"
            status="inactive"
            onDelete={() => undefined}
          />
          <TriggerListItem
            title="Trigger Name"
            description="description"
            status="active"
            checked={listChecked}
            onCheckedChange={setListChecked}
            onDelete={() => undefined}
          />
          <TriggerListItem
            title="Trigger Name"
            description="description"
            checked
            onDelete={() => undefined}
            draggable
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Filter bar">
        <div className="flex flex-col gap-4">
          <FilterBar
            filters={filters}
            onRemove={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))}
            onAdd={() => undefined}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Calendar">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text variant="caption">Week</Text>
            <CalendarStrip
              value={calendarDate}
              onChange={setCalendarDate}
              view={calendarView}
              onViewChange={setCalendarView}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="caption">Month</Text>
            <CalendarStrip
              value={monthDate}
              onChange={setMonthDate}
              view={monthView}
              onViewChange={setMonthView}
              weekStartsOn={1}
              markers={DEMO_CALENDAR_MARKERS}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Emoji picker">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-2">
            <Text variant="caption">Closed</Text>
            <EmojiPicker open={false} />
            <Text variant="caption">Opened</Text>
            <EmojiPicker />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Question fields">
        <div className="flex flex-col gap-4">
          <QuestionField control="text" onDelete={() => undefined} />
          <QuestionField
            control="scale"
            scaleValue={scaleValue}
            onScaleChange={setScaleValue}
            onDelete={() => undefined}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Written items">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <WrittenItem
              title="Item Description"
              notes="Item Notes or Context"
              leftIcon={
                <IconMark shape="circle" size="xs">
                  <LightningIcon size={12} />
                </IconMark>
              }
              achieved
              checked={writtenChecked}
              onCheckedChange={setWrittenChecked}
              onDelete={() => undefined}
            />
            <WrittenItem
              variant="striked"
              title="Item Description"
              notes="Item Notes or Context"
              leftIcon={
                <IconMark shape="circle" size="xs">
                  <LightningIcon size={12} />
                </IconMark>
              }
              checked
              onDelete={() => undefined}
            />
            <WrittenItem title="No notes or badge" checkbox={false} />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Navigation elements">
        <div className="flex flex-col gap-6">
          <Tabs
            label="View mode"
            value={tab}
            onChange={setTab}
            options={[
              { value: "list", label: "List" },
              { value: "board", label: "Board" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Avatar initials="PP" size="sm" />
            <Avatar initials="PP" />
            <Avatar initials="PP" size="lg" />
            <Avatar size="xl" />
            <div className="flex w-48 flex-col gap-2">
              <Progress value={45} size="md" label="Medium progress" />
              <Progress value={45} size="sm" label="Small progress" />
            </div>
            <IconButton label="Edit" look="outline" size="md">
              <SparkleIcon />
            </IconButton>
            <IconMark>
              <LightningIcon size={14} />
            </IconMark>
            <IconMark shape="circle">
              <LightningIcon size={14} />
            </IconMark>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Feedback">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Spinner />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Toast>Progression ratings saved</Toast>
          <Toast tone="error">Couldn’t save changes</Toast>
          <Toast tone="info">A new reflection is ready</Toast>
          <EmptyState
            title="Your Progress Pad is ready."
            description="Add a first note when you want to capture the day."
            action={<Button size="md">Add a note</Button>}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Overlays">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Tooltip content="Close this panel">
            <IconButton label="Close panel" look="outline">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Delete this item?"
          description="This action cannot be undone."
        >
          <DialogConfirmActions
            danger
            confirmLabel="Delete"
            onCancel={() => setDialogOpen(false)}
            onConfirm={() => setDialogOpen(false)}
          />
        </Dialog>
      </PreviewSection>

      <PreviewSection title="Other components">
        <Divider />
        <Divider label="or" />
      </PreviewSection>
    </>
  );
}
