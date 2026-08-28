import type { ReactNode } from "react";

import { CurrentUserProvider } from "@/components/app/current-user-provider";
import { requireUser } from "@/lib/auth/user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return <CurrentUserProvider user={user}>{children}</CurrentUserProvider>;
}
