import type { CheckInTime } from "./draft";

export const intentOptions = [
  { id: "getting-organized", label: "Getting organized" },
  { id: "building-better-habits", label: "Building better habits" },
  { id: "staying-consistent", label: "Staying consistent" },
  { id: "feeling-less-overwhelmed", label: "Feeling less overwhelmed" },
  { id: "managing-workload", label: "Managing my workload" },
  { id: "keeping-track", label: "Keeping track of my progress" },
  { id: "figuring-out", label: "Figuring out what I want" },
  { id: "something-else-intent", label: "Something else" },
] as const;

export const spaceOptions = [
  { id: "getting-things-done", label: "Getting things done" },
  { id: "spending-time", label: "Spending time with people" },
  { id: "mental-wellbeing", label: "Looking after my mental wellbeing" },
  { id: "relationships", label: "Relationships" },
  { id: "taking-care", label: "Taking care of myself" },
  { id: "personal-growth", label: "Personal growth" },
  { id: "studying", label: "Studying / Learning" },
  { id: "rest-and-balance", label: "Rest and balance" },
] as const;

export const routineOptions = [
  { id: "student", label: "Student" },
  { id: "working-full-time", label: "Working full-time" },
  { id: "working-part-time", label: "Working part-time" },
  { id: "self-employed", label: "Self-employed / Freelancing" },
  { id: "in-transition", label: "Between jobs / In transition" },
  { id: "caring-for-others", label: "Caring for others / At home" },
  { id: "taking-a-break", label: "Taking a break / Focusing on myself" },
  { id: "something-else-routine", label: "Something else" },
] as const;

export const triggerOptions = [
  { id: "plan-tomorrow", label: "Plan tomorrow" },
  { id: "check-calendar", label: "Check my calendar" },
  { id: "review-unfinished", label: "Review what's unfinished" },
  { id: "take-a-break", label: "Take a proper break" },
  { id: "go-for-a-walk", label: "Go for a walk" },
  { id: "drink-water", label: "Drink enough water" },
  { id: "work-on-assignment", label: "Work on my assignment" },
  { id: "study-30", label: "Study for 30 minutes" },
  { id: "hardest-task-first", label: "Start my hardest task first" },
  { id: "tidy-workspace", label: "Tidy my workspace" },
  { id: "reflect-on-today", label: "Reflect on today" },
  { id: "eat-healthy", label: "Eat healthy" },
] as const;

export const checkInOptions: Array<{
  id: CheckInTime;
  title: string;
  description: string;
}> = [
  { id: "morning", title: "Morning", description: "Start the day with intention" },
  { id: "afternoon", title: "Afternoon", description: "Pause and reset" },
  { id: "evening", title: "Evening", description: "Reflect on your day" },
];
