"use client";

import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/** Sensors that work for mouse and touch (mobile needs TouchSensor + touch-none on handles). */
export function useSortableSensors() {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

/** Shared classes for drag handles so touch doesn’t become a page scroll. */
export const SORTABLE_HANDLE_CLASS =
  "touch-none select-none [-webkit-user-select:none] [-webkit-touch-callout:none]";
