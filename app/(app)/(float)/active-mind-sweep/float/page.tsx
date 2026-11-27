import type { Metadata } from "next";

import { MindSweepFloatPanel } from "@/components/app/mind-sweep-float";

export const metadata: Metadata = {
  title: "Mind Sweep",
};

export default function MindSweepFloatRoute() {
  return <MindSweepFloatPanel />;
}
