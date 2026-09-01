export const TRIGGERS_HEADING = {
  title: "Triggers",
  subtitle: "Small cues that help your day flow.",
} as const;

export const TRIGGER_LIBRARY_SEED = [
  { id: "morning-reset", name: "Morning reset", emoji: "☀️" },
  { id: "focused-reading", name: "Focused Reading", emoji: "📚" },
  { id: "wind-down", name: "Wind-down ritual", emoji: "🌙" },
  { id: "inbox-zero", name: "Inbox Zero", emoji: "📋" },
  { id: "coffee-break", name: "Coffee Break", emoji: "☕️" },
  { id: "connection", name: "Connection", emoji: "❤️" },
  { id: "brain-dump", name: "Brain Dump", emoji: "✏️" },
  { id: "plant-a-seed", name: "Plant a seed", emoji: "🌱" },
] as const;

export const SCENARIO_LIBRARY_SEED = [
  { id: "deep-work", title: "Deep Work Flow", meta: "5 triggers", emoji: "⚡️" },
  { id: "evening-wind-down", title: "Evening Wind-Down", meta: "4 triggers", emoji: "🌙" },
  { id: "morning-launch", title: "Morning Launch", meta: "6 triggers", emoji: "☀️" },
  { id: "recovery-day", title: "Recovery Day", meta: "3 triggers", emoji: "💚" },
] as const;
