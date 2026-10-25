import type { Metadata } from "next";

import { DashboardPage } from "@/components/app/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard · Progress Pad",
  description: "Your whole Progress Pad for the day in one place.",
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
