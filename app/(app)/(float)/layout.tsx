import type { ReactNode } from "react";

import { SessionStoreProvider } from "@/components/app/session-store-provider";
import { loadAppSession } from "@/lib/app/session";
import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

/** Bare layout (no header or nav) for small pop-out windows. */
export default async function FloatLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const session = await loadAppSession(await createClient());

  return <SessionStoreProvider initial={session}>{children}</SessionStoreProvider>;
}
