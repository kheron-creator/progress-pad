import type { ReactNode } from "react";

import { CheckInReminder } from "@/components/app/check-in-reminder";
import { SessionStoreProvider } from "@/components/app/session-store-provider";
import { UnsavedLeaveProvider } from "@/components/app/unsaved-leave-provider";
import { loadAppSession } from "@/lib/app/session";
import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { ensureOnboardingTriggers } from "@/lib/triggers/store";

export async function SessionGate({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const supabase = await createClient();
  await ensureOnboardingTriggers(supabase, user.id, user.onboarding.triggerIds);
  const session = await loadAppSession(supabase);

  return (
    <SessionStoreProvider initial={session}>
      <UnsavedLeaveProvider>
        <CheckInReminder />
        {children}
      </UnsavedLeaveProvider>
    </SessionStoreProvider>
  );
}
