import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app/app-header";
import { requireUser } from "@/lib/auth/user";

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col px-page-x py-page-y">{children}</main>
    </div>
  );
}
