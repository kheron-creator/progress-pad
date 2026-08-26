export const REMEMBER_COOKIE = "pp-remember";

const persistentMaxAge = 400 * 24 * 60 * 60;

export function isPersistentSession(rememberValue: string | undefined) {
  return rememberValue !== "0";
}

export function setRememberPreference(remember: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (remember) {
    document.cookie = `${REMEMBER_COOKIE}=1; Path=/; Max-Age=${persistentMaxAge}; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${REMEMBER_COOKIE}=0; Path=/; SameSite=Lax${secure}`;
}

export function clearRememberPreference() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REMEMBER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
