export const HOME_HERO = {
  kicker: "WORKSPACE RUNWAY & IGNITION",
  title: "The Progressive Professional",
  description:
    "Align your physical desk environment, trigger robust starting workflows, and execute with absolute clarity today.",
} as const;

export const HOME_HEADING = {
  title: "Personal Progression",
  subtitle: "Engage for growth",
} as const;

export const HOME_BANNERS = {
  triggers: {
    kicker: "WORKSPACE COGNITIVE RESET",
    title: "Ergonomic Desk & Morning Triggers",
    description: "Clean the physical workspace, calibrate screen heights, hydrate with water, and execute micro-habits smoothly.",
  },
  writing: {
    kicker: "SYSTEM OPERATIONS & STRATEGY",
    title: "Zoom Strategy & Mind Sweep Actions",
    description: "Offload heavy cognitive load. Record immediate triggers, project priorities, and capture loose items.",
  },
  pillars: {
    kicker: "HORIZON PRESPECTIVE",
    title: "City Window Reflection & Life Pillars",
    description: "Step back from tactical noise. Review progress across mental, physical, career, and personal dimensions.",
  },
} as const;









export const HOME_TRIGGER_SECTION = {
  title: "Today’s triggers",
  description: "Small actions over time create big change.",
} as const;

export const HOME_TRIGGERS = [
  { id: "plan-tomorrow", title: "Plan tomorrow", state: "achieved" as const },
  { id: "check-calendar", title: "Check my calendar", state: "todo" as const },
  { id: "review-unfinished", title: "Review what’s unfinished", state: "todo" as const },
  { id: "take-a-break", title: "Take a proper break", state: "achieved" as const },
  { id: "go-for-a-walk", title: "Go for a walk", state: "todo" as const },
  { id: "drink-water", title: "Drink enough water", state: "achieved" as const },
  { id: "work-on-assignment", title: "Work on my assignment", state: "todo" as const },
  { id: "study-30", title: "Study for 30 minutes", state: "todo" as const },
  { id: "hardest-task-first", title: "Start my hardest task first", state: "todo" as const },
  { id: "tidy-workspace", title: "Tidy my workspace", state: "achieved" as const },
  { id: "reflect-on-today", title: "Reflect on today", state: "todo" as const },
  { id: "eat-healthy", title: "Eat healthy", state: "todo" as const },
  { id: "inbox-zero", title: "Clear the inbox", state: "todo" as const },
  { id: "deep-work", title: "Protect a deep work block", state: "achieved" as const },
] as const;

export const HOME_WRITING_SECTIONS = [
  {
    id: "gratitude",
    title: "Daily Gratitude",
    description: "Ground your day with conscious appreciation",
    placeholder: "Today I am grateful for...",
    accent: "var(--pp-bondi-blue-400)",
    composer: true,
    addLabel: "Add Entry",
    chip: "logged" as const,
    items: [],
  },
  {
    id: "mind-sweep",
    title: "Mind Sweep",
    description: "Clear your mental RAM — unload thoughts, ideas, or to-dos",
    placeholder: "Unload a thought, idea, or mental clutter...",
    notesPlaceholder: "Notes or Context (Optional)...",
    accent: "var(--pp-magenta-400)",
    composer: true,
    addLabel: "Capture",
    chip: "achieved" as const,
    showProgress: true,
    items: [],
  },
  {
    id: "done-list",
    title: "Done List",
    description: "Log completed achievements and celebrate today’s momentum",
    placeholder: "What did you get done?",
    notesPlaceholder: "Notes or Context (Optional)...",
    accent: "var(--pp-spring-green-600)",
    composer: true,
    addLabel: "Achieved",
    addIcon: "check" as const,
    chip: "done" as const,
    alwaysAchieved: true,
    items: [],
  },
  {
    id: "quotes",
    title: "Impactful Quotes",
    description: "Quotes to anchor your mindset today",
    placeholder: "Write or paste an inspiring quote...",
    accent: "var(--pp-purple-500)",
    composer: true,
    addLabel: "Save Quote",
    addIcon: "none" as const,
    chip: "quotes" as const,
    items: [],
  },
  {
    id: "journal",
    title: "Let’s Journal",
    description: "What’s on your heart or mind today...",
    placeholder: "Reflect on your day: feelings, thoughts, mindset shifts...",
    notesPlaceholder: "Notes or Context (Optional)...",
    accent: "var(--pp-pink-500)",
    composer: true,
    addLabel: "Save Journal",
    addIcon: "none" as const,
    chip: "notes" as const,
    items: [],
  },
  {
    id: "reflections",
    title: "Reflections",
    description: "Key lessons and insights discovered today",
    placeholder: "Today I learned that...",
    notesPlaceholder: "Notes or Context (Optional)...",
    accent: "var(--pp-cobalt-500)",
    composer: true,
    addLabel: "Log Lesson",
    addIcon: "none" as const,
    chip: "lessons" as const,
    items: [],
  },
] as const;

export const HOME_PILLAR_SECTION = {
  title: "Six Pillars of Personal Progression",
  description: "Rate each pillar and capture its dedicated context directly",
  saved: "Progression ratings and context saved!",
  saveLabel: "Save Progression",
} as const;

export const HOME_PILLARS = [
  {
    id: "mentally",
    title: "Mentally",
    description: "Focus, clarity, learning, cognitive alertness.",
    placeholder: "How clear and focused has your mind felt today?",
  },
  {
    id: "emotionally",
    title: "Emotionally",
    description: "Peace of mind, resilience, mood balance.",
    placeholder: "What has your emotional state been like today?",
  },
  {
    id: "professionally",
    title: "Professionally",
    description: "Execution, leverage, career milestones.",
    placeholder: "How satisfied have you felt with your work or studies today?",
  },
  {
    id: "physically",
    title: "Physically",
    description: "Energy, workout, hydration, nutrition, sleep.",
    placeholder: "How has your body been feeling today?",
  },
  {
    id: "socially",
    title: "Socially",
    description: "Friendships, conversations, family presence.",
    placeholder: "How connected have you felt to the people around you today?",
  },
  {
    id: "romantically",
    title: "Romantically",
    description: "Intimacy, mutual care, connection & warmth.",
    placeholder: "How have your romantic relationships or connections felt lately?",
  },
] as const;
