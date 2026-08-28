export const REMEMBER_COOKIE = "pp-remember";
export const GATE_COOKIE = "pp-gate";
export const RECOVERY_COOKIE = "pp-recovery";

export const persistentMaxAge = 400 * 24 * 60 * 60;
export const GATE_MAX_AGE = 15;
export const RECOVERY_MAX_AGE = 30 * 60;
export const REDIRECTED_SEARCH = "redirected";

export function isPersistentSession(rememberValue: string | undefined) {
  return rememberValue === "1";
}

export function readRememberPreference() {
  if (typeof document === "undefined") {
    return false;
  }

  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === REMEMBER_COOKIE) {
      return isPersistentSession(rest.join("="));
    }
  }

  return false;
}

export function setRememberPreference(remember: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (remember) {
    document.cookie = `${REMEMBER_COOKIE}=1; Path=/; Max-Age=${persistentMaxAge}; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${REMEMBER_COOKIE}=0; Path=/; Max-Age=${persistentMaxAge}; SameSite=Lax${secure}`;
}

export function clearRememberPreference() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REMEMBER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function withoutCookieLifetime<T extends object>(options: T) {
  const rest = { ...options } as T & { maxAge?: unknown; expires?: unknown };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}
