"use client";

import {
  BarbellIcon as PhosphorBarbellIcon,
  BellIcon as PhosphorBellIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  ChatIcon as PhosphorChatIcon,
  CheckCircleIcon as PhosphorCheckCircleIcon,
  CheckIcon as PhosphorCheckIcon,
  DotsSixVerticalIcon,
  LightningIcon as PhosphorLightningIcon,
  ListBulletsIcon as PhosphorListBulletsIcon,
  ListIcon as PhosphorListIcon,
  MagnifyingGlassIcon as PhosphorMagnifyingGlassIcon,
  MoonIcon as PhosphorMoonIcon,
  NoteIcon as PhosphorNoteIcon,
  PencilSimpleIcon,
  PlusIcon as PhosphorPlusIcon,
  SparkleIcon as PhosphorSparkleIcon,
  SquaresFourIcon,
  StarIcon as PhosphorStarIcon,
  SunIcon as PhosphorSunIcon,
  TrashIcon as PhosphorTrashIcon,
  EnvelopeSimpleIcon,
  EyeIcon as PhosphorEyeIcon,
  EyeSlashIcon as PhosphorEyeSlashIcon,
  LockSimpleIcon,
  UploadSimpleIcon,
  PaperPlaneTiltIcon,
  UserIcon as PhosphorUserIcon,
  XIcon,
  type IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils/cn";

export type IconProps = PhosphorIconProps;

function iconClass(className: string | undefined) {
  return cn("shrink-0", className);
}

export function CheckIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorCheckIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function ChevronDownIcon({ className, ...props }: IconProps) {
  return (
    <CaretDownIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function StarIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorStarIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return <XIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />;
}

export function UserIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorUserIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function SunIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorSunIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function MoonIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorMoonIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function SparkleIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorSparkleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function LightningIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorLightningIcon aria-hidden size={16} weight="fill" className={iconClass(className)} {...props} />
  );
}

export function TrashIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorTrashIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function BellIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorBellIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorListIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorMagnifyingGlassIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorPlusIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function PencilIcon({ className, ...props }: IconProps) {
  return (
    <PencilSimpleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function DragHandleIcon({ className, ...props }: IconProps) {
  return (
    <DotsSixVerticalIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <CaretLeftIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <CaretRightIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function GridIcon({ className, ...props }: IconProps) {
  return (
    <SquaresFourIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function ListBulletsIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorListBulletsIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function CheckCircleIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorCheckCircleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function ChatIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorChatIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function UploadIcon({ className, ...props }: IconProps) {
  return (
    <UploadSimpleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function SendIcon({ className, ...props }: IconProps) {
  return (
    <PaperPlaneTiltIcon aria-hidden size={16} weight="fill" className={iconClass(className)} {...props} />
  );
}

export function BarbellIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorBarbellIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function NoteIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorNoteIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function EnvelopeIcon({ className, ...props }: IconProps) {
  return (
    <EnvelopeSimpleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function LockIcon({ className, ...props }: IconProps) {
  return (
    <LockSimpleIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function EyeIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorEyeIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}

export function EyeSlashIcon({ className, ...props }: IconProps) {
  return (
    <PhosphorEyeSlashIcon aria-hidden size={16} weight="regular" className={iconClass(className)} {...props} />
  );
}
