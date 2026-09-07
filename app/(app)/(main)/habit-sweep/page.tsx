import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/app/status-page";

export const metadata: Metadata = {
  title: "Active Mind Sweep · Progress Pad",
  description: "Active Mind Sweep is coming soon.",
};

export default function HabitSweepRoute() {
  return <ComingSoonPage />;
}
