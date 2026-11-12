import type { Metadata } from "next";

import { MicroSprintsFrame } from "@/components/app/micro-sprints-frame";
import { MindSweepTabs } from "@/components/app/mind-sweep-tabs";

export const metadata: Metadata = {
  title: "Micro sprints · Progress Pad",
  description: "Short bursts of focus, hanging from the T.",
};

export default function MicroSprintsRoute() {
  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <MindSweepTabs current="micro-sprints" />
      <MicroSprintsFrame />
    </div>
  );
}
