import type { ReactNode } from "react";

import { enforceAppGate } from "@/lib/auth/routing";
import { requireUser } from "@/lib/auth/user";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  await enforceAppGate(user, "onboarding");

  return children;
}
