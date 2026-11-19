import type { Metadata } from "next";

import { ActiveMindSweepPage } from "@/components/app/active-mind-sweep-page";
import { MindSweepTabs } from "@/components/app/mind-sweep-tabs";

export const metadata: Metadata = {
  title: "Active Mind Sweep · Progress Pad",
  description: "Open Mind Sweep items stay here until you achieve them.",
};

export default function ActiveMindSweepRoute() {
  return (
    <div className="flex w-full flex-col gap-4">
      <MindSweepTabs current="sweep" />
      <ActiveMindSweepPage />
    </div>
  );
}
