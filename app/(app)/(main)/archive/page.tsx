import type { Metadata } from "next";

import { ArchivePage } from "@/components/app/archive-page";

export const metadata: Metadata = {
  title: "Archive · Progress Pad",
  description: "Look back at mind sweep, done list, gratitude, journal, reflections, and pillars by week, month, or date range.",
};

export default function ArchiveRoute() {
  return <ArchivePage />;
}
