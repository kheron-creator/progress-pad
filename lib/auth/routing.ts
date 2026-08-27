import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { appPathForComplete } from "@/lib/auth/paths";
import { GATE_COOKIE, RECOVERY_COOKIE, REDIRECTED_SEARCH } from "@/lib/auth/remember";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/user";

export function appPathForUser(user: Pick<CurrentUser, "onboardingComplete">) {
  return appPathForComplete(user.onboardingComplete);
}

export function withRedirectGuard(path: "/home" | "/onboarding") {
  return `${path}?${REDIRECTED_SEARCH}=1`;
}

export async function redirectSignedInUser() {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const inRecovery = (await cookies()).get(RECOVERY_COOKIE)?.value === "1";
  if (inRecovery) {
    redirect("/reset-password");
  }

  redirect(appPathForUser(user));
}

export async function enforceAppGate(user: CurrentUser, area: "home" | "onboarding") {
  const redirected = (await cookies()).get(GATE_COOKIE)?.value === "1";
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
