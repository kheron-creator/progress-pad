export const TRIGGERS_HEADING = {
  title: "Triggers",
  subtitle: "Small cues that help your day flow.",
} as const;

export const SUGGESTED_TRIGGERS = [
  { id: "suggest-make-bed", name: "Make my bed", emoji: "🛏️" },
  { id: "suggest-inbox-zero", name: "Clear my inbox", emoji: "📥" },
  { id: "suggest-vitamins", name: "Take my vitamins", emoji: "💊" },
  { id: "suggest-stand-up", name: "Stand up and move", emoji: "🧍" },
  { id: "suggest-screen-off-lunch", name: "Eat lunch away from screens", emoji: "🥗" },
  { id: "suggest-thank-you", name: "Send one thank-you", emoji: "🙏" },
  { id: "suggest-top-three", name: "Write tomorrow's top 3", emoji: "3️⃣" },
  { id: "suggest-unplug", name: "Unplug 30 minutes before bed", emoji: "🌙" },
  { id: "suggest-practice-skill", name: "Practice a skill for 15 minutes", emoji: "🎹" },
  { id: "suggest-water-plants", name: "Water the plants", emoji: "🪴" },
  { id: "suggest-pack-bag", name: "Pack my bag for tomorrow", emoji: "🎒" },
  { id: "suggest-two-minute-reset", name: "Do a 2-minute reset", emoji: "🔄" },
  { id: "suggest-listen-song", name: "Listen to a song I like", emoji: "🎧" },
  { id: "suggest-laundry", name: "Put laundry away", emoji: "👕" },
  { id: "suggest-budget-glance", name: "Glance at my budget", emoji: "💸" },
  { id: "suggest-no-snooze", name: "Get up without snoozing", emoji: "⏰" },
] as const;

export function countLabel(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export const TRIGGERS_PICK_COPY = {
  dropzoneEmptyTitle: "Select triggers",
  dropzoneEmptyDescription: "Check triggers in your library to add them.",
  dropzoneDragHint: "Drag them here to add them.",
  dropzoneAddedDescription: "Review and save your scenario",
  dropzoneMore: "Select more triggers to add them",
  addTriggers: (count: number) =>
    count > 0 ? `Add ${countLabel(count, "trigger")}` : "Add triggers",
  selectedTriggers: (count: number) => `${countLabel(count, "trigger")} selected`,
  assignSelected: (count: number) => `Tap a date to add ${countLabel(count, "item")}.`,
  assignDragHint: " You can also drag them onto a date.",
  selectAll: "Select all",
  unselectAll: "Unselect all",
  suggested: "Suggested Triggers",
  chooseTriggers: "Choose triggers",
  chooseTriggersHint: "Tap triggers to add them to this scenario.",
  chooseTriggersEmpty: "Add a trigger to your library first, then come back to build a scenario.",
} as const;

