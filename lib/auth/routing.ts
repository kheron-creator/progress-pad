import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/user";

export const REDIRECTED_SEARCH = "redirected";

export function appPathForUser(user: Pick<CurrentUser, "onboardingComplete">) {
  return user.onboardingComplete ? "/home" : "/onboarding";
}

export function withRedirectGuard(path: "/home" | "/onboarding") {
  return `${path}?${REDIRECTED_SEARCH}=1`;
}

export async function withRedirected(path: string) {
  const headerList = await headers();
  if (headerList.get("x-pp-redirected") !== "1") {
    return path;
  }

  const url = new URL(path, "http://local.invalid");
  url.searchParams.set(REDIRECTED_SEARCH, "1");
  return `${url.pathname}${url.search}`;
}

export async function redirectSignedInUser() {
  const user = await getCurrentUser();
  if (user) {
    redirect(appPathForUser(user));
  }
}

export async function enforceAppGate(user: CurrentUser, area: "home" | "onboarding") {
  const redirected = (await headers()).get("x-pp-redirected") === "1";
  if (redirected) {
    return;
  }

  const dest = appPathForUser(user);

  if (area === "home" && dest === "/onboarding") {
    redirect(withRedirectGuard("/onboarding"));
  }

  if (area === "onboarding" && dest === "/home") {
    redirect(withRedirectGuard("/home"));
  }
}
