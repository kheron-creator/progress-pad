export const THEME_COOKIE = "pp-theme";
export const THEME_MAX_AGE = 400 * 24 * 60 * 60;

export type Theme = "light" | "dark";

export function parseTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${THEME_MAX_AGE}; SameSite=Lax${secure}`;
}
