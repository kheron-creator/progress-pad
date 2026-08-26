import type { ReactNode } from "react";

import { AppHeader } from "@/components/app/app-header";
import { CurrentUserProvider } from "@/components/app/current-user-provider";
import { requireUser } from "@/lib/auth/user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <CurrentUserProvider user={user}>
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col px-page-x py-page-y">{children}</main>
      </div>
    </CurrentUserProvider>
  );
}
