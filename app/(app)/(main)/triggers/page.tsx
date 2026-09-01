import type { Metadata } from "next";

import { TriggersPage } from "@/components/app/triggers-page";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Triggers · Progress Pad",
  description: "Small cues that help your day flow.",
};

export default async function TriggersRoute() {
  await requireUser();

  return <TriggersPage />;
}
