"use client";

import type { ComponentType } from "react";
import {
  BarbellIcon as PhosphorBarbellIcon,
  BellIcon as PhosphorBellIcon,
  BookOpenIcon as PhosphorBookOpenIcon,
  BrainIcon as PhosphorBrainIcon,
  BriefcaseIcon as PhosphorBriefcaseIcon,
  CalendarBlankIcon as PhosphorCalendarBlankIcon,
  CameraIcon as PhosphorCameraIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  ChatIcon as PhosphorChatIcon,
  ChartLineUpIcon as PhosphorChartLineUpIcon,
  CheckCircleIcon as PhosphorCheckCircleIcon,
  CheckIcon as PhosphorCheckIcon,
  ChecksIcon as PhosphorChecksIcon,
  DotsSixVerticalIcon,
  HeadCircuitIcon as PhosphorHeadCircuitIcon,
  HeartIcon as PhosphorHeartIcon,
  LightbulbIcon as PhosphorLightbulbIcon,
  LightningIcon as PhosphorLightningIcon,
  ListBulletsIcon as PhosphorListBulletsIcon,
  ListIcon as PhosphorListIcon,
  MagnifyingGlassIcon as PhosphorMagnifyingGlassIcon,
  MicrophoneIcon as PhosphorMicrophoneIcon,
  MoonIcon as PhosphorMoonIcon,
  NoteIcon as PhosphorNoteIcon,
  PencilSimpleIcon,
  PlusIcon as PhosphorPlusIcon,
  QuotesIcon as PhosphorQuotesIcon,
  SmileyIcon as PhosphorSmileyIcon,
  SparkleIcon as PhosphorSparkleIcon,
  SquaresFourIcon,
  StarIcon as PhosphorStarIcon,
  SunHorizonIcon as PhosphorSunHorizonIcon,
  SunIcon as PhosphorSunIcon,
  TargetIcon as PhosphorTargetIcon,
  TrashIcon as PhosphorTrashIcon,
  EnvelopeSimpleIcon,
  EyeIcon as PhosphorEyeIcon,
  EyeSlashIcon as PhosphorEyeSlashIcon,
  Info as PhosphorInfoIcon,
  LockSimpleIcon,
  UploadSimpleIcon,
  PaperPlaneTiltIcon,
  UserIcon as PhosphorUserIcon,
  UsersThreeIcon as PhosphorUsersThreeIcon,
  XIcon,
  type IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils/cn";

export const iconSize = {
  xs: 20,
  sm: 26,
  md: 36,
  lg: 40,
} as const;

export type IconSizeName = keyof typeof iconSize;

export type IconProps = Omit<PhosphorIconProps, "size"> & {
  size?: PhosphorIconProps["size"] | IconSizeName;
};

function resolveIconSize(size: IconProps["size"]) {
  if (size == null) {
    return iconSize.xs;
  }

  if (typeof size === "string" && size in iconSize) {
    return iconSize[size as IconSizeName];
  }

  return size;
}

function iconClass(className: string | undefined) {
  return cn("shrink-0", className);
}

function withIcon(Icon: ComponentType<PhosphorIconProps>) {
  return function BrandIcon({ className, size, weight = "regular", ...props }: IconProps) {
    return (
      <Icon
        aria-hidden
        size={resolveIconSize(size)}
        weight={weight}
        className={iconClass(className)}
        {...props}
      />
    );
  };
}

export const CheckIcon = withIcon(PhosphorCheckIcon);
export const ChecksIcon = withIcon(PhosphorChecksIcon);
export const ChevronDownIcon = withIcon(CaretDownIcon);
export const StarIcon = withIcon(PhosphorStarIcon);
export const CloseIcon = withIcon(XIcon);
export const UserIcon = withIcon(PhosphorUserIcon);
export const UsersThreeIcon = withIcon(PhosphorUsersThreeIcon);
export const SunIcon = withIcon(PhosphorSunIcon);
export const MoonIcon = withIcon(PhosphorMoonIcon);
export const SmileyIcon = withIcon(PhosphorSmileyIcon);
export const SparkleIcon = withIcon(PhosphorSparkleIcon);
export const LightbulbIcon = withIcon(PhosphorLightbulbIcon);
export const LightningIcon = withIcon(PhosphorLightningIcon);
export const HeadCircuitIcon = withIcon(PhosphorHeadCircuitIcon);
export const HeartIcon = withIcon(PhosphorHeartIcon);
export const TrashIcon = withIcon(PhosphorTrashIcon);
export const BellIcon = withIcon(PhosphorBellIcon);
export const BookOpenIcon = withIcon(PhosphorBookOpenIcon);
export const BrainIcon = withIcon(PhosphorBrainIcon);
export const BriefcaseIcon = withIcon(PhosphorBriefcaseIcon);
export const CalendarBlankIcon = withIcon(PhosphorCalendarBlankIcon);
export const MenuIcon = withIcon(PhosphorListIcon);
export const SearchIcon = withIcon(PhosphorMagnifyingGlassIcon);
export const MicrophoneIcon = withIcon(PhosphorMicrophoneIcon);
export const PlusIcon = withIcon(PhosphorPlusIcon);
export const QuotesIcon = withIcon(PhosphorQuotesIcon);
export const PencilIcon = withIcon(PencilSimpleIcon);
export const DragHandleIcon = withIcon(DotsSixVerticalIcon);
export const ChevronLeftIcon = withIcon(CaretLeftIcon);
export const ChevronRightIcon = withIcon(CaretRightIcon);
export const GridIcon = withIcon(SquaresFourIcon);
export const ListBulletsIcon = withIcon(PhosphorListBulletsIcon);
export const CheckCircleIcon = withIcon(PhosphorCheckCircleIcon);
export const ChatIcon = withIcon(PhosphorChatIcon);
export const UploadIcon = withIcon(UploadSimpleIcon);
export const CameraIcon = withIcon(PhosphorCameraIcon);
export const SendIcon = withIcon(PaperPlaneTiltIcon);
export const BarbellIcon = withIcon(PhosphorBarbellIcon);
export const NoteIcon = withIcon(PhosphorNoteIcon);
export const TargetIcon = withIcon(PhosphorTargetIcon);
export const ChartLineIcon = withIcon(PhosphorChartLineUpIcon);
export const SunHorizonIcon = withIcon(PhosphorSunHorizonIcon);
export const EnvelopeIcon = withIcon(EnvelopeSimpleIcon);
export const InfoIcon = withIcon(PhosphorInfoIcon);
export const LockIcon = withIcon(LockSimpleIcon);
export const EyeIcon = withIcon(PhosphorEyeIcon);
export const EyeSlashIcon = withIcon(PhosphorEyeSlashIcon);
