import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/app/status-page";

export const metadata: Metadata = {
  title: "Assistant · Progress Pad",
  description: "Assistant is coming soon.",
};

export default function AssistantRoute() {
  return <ComingSoonPage />;
}
