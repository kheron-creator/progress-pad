import type { ReactNode } from "react";
import {
  AppleLogoIcon,
  ArrowsLeftRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BroomIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  CheckSquareIcon,
  ClockIcon,
  CloudIcon,
  CoffeeIcon,
  CompassIcon,
  DotsThreeIcon,
  DropIcon,
  FlagIcon,
  FlowerIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HeartIcon,
  HouseIcon,
  LaptopIcon,
  LightbulbIcon,
  ListBulletsIcon,
  ListChecksIcon,
  NoteIcon,
  PathIcon,
  PersonSimpleWalkIcon,
  PlantIcon,
  RepeatIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

function glyph(Icon: typeof BriefcaseIcon) {
  return <Icon size={20} weight="regular" />;
}

const icons: Record<string, ReactNode> = {
  "getting-organized": glyph(ListBulletsIcon),
  "building-better-habits": glyph(RepeatIcon),
  "staying-consistent": glyph(CalendarCheckIcon),
  "feeling-less-overwhelmed": glyph(CloudIcon),
  "managing-workload": glyph(BriefcaseIcon),
  "keeping-track": glyph(ChartLineUpIcon),
  "figuring-out": glyph(CompassIcon),
  "something-else-intent": glyph(DotsThreeIcon),

  "getting-things-done": glyph(CheckSquareIcon),
  "spending-time": glyph(UsersThreeIcon),
  "mental-wellbeing": glyph(HeartIcon),
  relationships: glyph(HandshakeIcon),
  "taking-care": glyph(SparkleIcon),
  "personal-growth": glyph(PlantIcon),
  studying: glyph(BookOpenIcon),
  "rest-and-balance": glyph(FlowerIcon),

  student: glyph(GraduationCapIcon),
  "working-full-time": glyph(BriefcaseIcon),
  "working-part-time": glyph(ClockIcon),
  "self-employed": glyph(LaptopIcon),
  "in-transition": glyph(ArrowsLeftRightIcon),
  "caring-for-others": glyph(HouseIcon),
  "taking-a-break": glyph(FlowerIcon),
  "something-else-routine": glyph(DotsThreeIcon),

  "plan-tomorrow": glyph(CalendarBlankIcon),
  "check-calendar": glyph(CalendarCheckIcon),
  "review-unfinished": glyph(ListChecksIcon),
  "take-a-break": glyph(CoffeeIcon),
  "go-for-a-walk": glyph(PersonSimpleWalkIcon),
  "drink-water": glyph(DropIcon),
  "work-on-assignment": glyph(NoteIcon),
  "study-30": glyph(BookOpenIcon),
  "hardest-task-first": glyph(FlagIcon),
  "tidy-workspace": glyph(BroomIcon),
  "reflect-on-today": glyph(LightbulbIcon),
  "eat-healthy": glyph(AppleLogoIcon),
  "something-else": glyph(PathIcon),
};

export function optionIcon(id: string) {
  return icons[id];
}
