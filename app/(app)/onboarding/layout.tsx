import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.onboardingComplete) {
    redirect("/home");
  }

  return children;
}
