import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/app/status-page";

export const metadata: Metadata = {
  title: "Dashboard · Progress Pad",
  description: "Dashboard is coming soon.",
};

export default function DashboardRoute() {
  return <ComingSoonPage />;
}
