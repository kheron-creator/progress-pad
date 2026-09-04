import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppShell } from "@/components/app/app-shell";
import { MainLoading } from "@/components/app/main-loading";
import { SessionGate } from "@/components/app/session-gate";

export default async function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<MainLoading />}>
      <SessionGate>
        <AppShell>{children}</AppShell>
      </SessionGate>
    </Suspense>
  );
}
