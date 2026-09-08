"use client";

import { useTheme } from "@/components/app/theme-provider";
import { IconButton } from "@/components/ui/icon-button";
import { MoonIcon, SunIcon } from "@/components/ui/icon";
import { Tooltip } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip content={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
      <IconButton
        label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        variant="secondary"
        look="outline"
        onClick={toggleTheme}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </IconButton>
    </Tooltip>
  );
}
