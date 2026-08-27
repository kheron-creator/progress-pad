import type { ReactNode } from "react";

import { AppHeader } from "@/components/app/app-header";
import { enforceAppGate } from "@/lib/auth/routing";
import { requireUser } from "@/lib/auth/user";

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  await enforceAppGate(user, "home");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col px-page-x py-page-y">{children}</main>
    </div>
  );
}
