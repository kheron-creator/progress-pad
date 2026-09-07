import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/app/status-page";

export const metadata: Metadata = {
  title: "Coming soon · Progress Pad",
  description: "This part of Progress Pad isn’t ready yet.",
};

export default function ComingSoonRoute() {
  return <ComingSoonPage />;
}
