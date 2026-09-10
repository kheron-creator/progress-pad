import type { Metadata } from "next";

import { ActiveMindSweepPage } from "@/components/app/active-mind-sweep-page";

export const metadata: Metadata = {
  title: "Active Mind Sweep · Progress Pad",
  description: "Open Mind Sweep items stay here until you achieve them.",
};

export default function ActiveMindSweepRoute() {
  return <ActiveMindSweepPage />;
}
