import type { Metadata } from "next";

import { TriggersPage } from "@/components/app/triggers-page";

export const metadata: Metadata = {
  title: "Triggers · Progress Pad",
  description: "Small cues that help your day flow.",
};

export default function TriggersRoute() {
  return <TriggersPage />;
}
