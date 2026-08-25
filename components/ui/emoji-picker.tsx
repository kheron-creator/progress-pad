"use client";

import { useMemo, useState } from "react";

import {
  CarIcon,
  ClockIcon,
  CoffeeIcon,
  FlagIcon,
  HashIcon,
  LightbulbIcon,
  PawPrintIcon,
  SmileyIcon,
  SoccerBallIcon,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils/cn";

import { Input } from "./input";
import { SearchIcon } from "./icon";
import { Text } from "./text";

export type EmojiCategoryId =
  | "recent"
  | "smileys"
  | "animals"
  | "food"
  | "activities"
  | "travel"
  | "objects"
  | "symbols"
  | "flags";

const CATEGORIES: { id: EmojiCategoryId; label: string; icon: typeof SmileyIcon }[] = [
  { id: "recent", label: "Recent", icon: ClockIcon },
  { id: "smileys", label: "Smileys & People", icon: SmileyIcon },
  { id: "animals", label: "Animals & Nature", icon: PawPrintIcon },
  { id: "food", label: "Food & Drink", icon: CoffeeIcon },
  { id: "activities", label: "Activities", icon: SoccerBallIcon },
  { id: "travel", label: "Travel & Places", icon: CarIcon },
  { id: "objects", label: "Objects", icon: LightbulbIcon },
  { id: "symbols", label: "Symbols", icon: HashIcon },
  { id: "flags", label: "Flags", icon: FlagIcon },
];

const EMOJIS: Record<EmojiCategoryId, string[]> = {
  recent: ["😀", "🔥", "💧", "📝", "⭐"],
  smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳",
    "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
  ],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔"],
  food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥"],
  activities: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🥅", "⛳", "🪁"],
  travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️"],
  objects: ["💡", "🔦", "🕯️", "🪔", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🕹️", "🗜️", "💾", "💿", "📷", "📹"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "💢", "💥", "💫", "💦", "💨", "✅", "❌"],
  flags: ["🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏳️‍⚧️", "🇺🇳", "🇺🇸", "🇨🇦", "🇬🇧", "🇫🇷", "🇩🇪", "🇯🇵", "🇰🇷", "🇮🇳", "🇧🇷"],
};

type EmojiPickerProps = {
  open?: boolean;
  label?: string;
  placeholder?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  category?: EmojiCategoryId;
  onCategoryChange?: (id: EmojiCategoryId) => void;
  onSelect?: (emoji: string) => void;
  className?: string;
};

export function EmojiPicker({
  open = true,
  label = "Icon",
  placeholder = "Select an Icon",
  query,
  onQueryChange,
  category: categoryProp,
  onCategoryChange,
  onSelect,
  className,
}: EmojiPickerProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [internalCategory, setInternalCategory] = useState<EmojiCategoryId>("smileys");
  const search = query ?? internalQuery;
  const category = categoryProp ?? internalCategory;
  const CategoryIcon = CATEGORIES.find((item) => item.id === category)?.icon ?? SmileyIcon;

  const emojis = useMemo(() => {
    const source = EMOJIS[category];
    const needle = search.trim().toLowerCase();
    if (!needle) return source;
    return Object.values(EMOJIS)
      .flat()
      .filter((emoji) => emoji.includes(needle) || needle.length === 0)
      .slice(0, 40);
  }, [category, search]);

  function setCategory(id: EmojiCategoryId) {
    onCategoryChange?.(id);
    if (categoryProp === undefined) setInternalCategory(id);
  }

  function setSearch(value: string) {
    onQueryChange?.(value);
    if (query === undefined) setInternalQuery(value);
  }

  return (
    <div className={cn("flex w-full max-w-[27.5rem] flex-col gap-2", className)}>
      <Input
        label={label}
        placeholder={placeholder}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        rightIcon={<SearchIcon />}
      />
      {open ? (
        <div className="overflow-hidden rounded-md border border-border bg-surface shadow-md">
          <div className="flex items-center justify-between px-3 pt-3">
            <Text variant="overline" className="text-foreground-muted">
              {CATEGORIES.find((item) => item.id === category)?.label.toUpperCase()}
            </Text>
            <CategoryIcon size={14} className="text-foreground-muted" />
          </div>
          <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto p-3">
            {emojis.map((emoji) => (
              <button
                key={`${category}-${emoji}`}
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-sm text-lg hover:bg-background-subtle"
                onClick={() => onSelect?.(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border bg-background-subtle px-2 py-1.5">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const active = item.id === category;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-sm",
                    active ? "bg-secondary-muted text-secondary" : "text-foreground-muted hover:bg-surface",
                  )}
                  onClick={() => setCategory(item.id)}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
