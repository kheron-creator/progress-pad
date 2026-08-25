"use client";

import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { MoonIcon, SunIcon } from "@/components/ui/icon";
import { Tooltip } from "@/components/ui/tooltip";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

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
