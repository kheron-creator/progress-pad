export const TRIGGERS_HEADING = {
  title: "Triggers",
  subtitle: "Small cues that help your day flow.",
} as const;

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
  assignEmpty: "Select triggers or scenarios, then tap a date.",
  assignSelected: (count: number) => `Tap a date to add ${countLabel(count, "item")}.`,
  assignDragHint: " You can also drag them onto a date.",
} as const;

