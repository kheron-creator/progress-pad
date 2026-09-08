import type { Metadata } from "next";

import { NotFoundPage } from "@/components/app/status-page";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Page not found · Progress Pad",
  description: "This page doesn’t exist, or it moved.",
};

export default async function NotFound() {
  const user = await getCurrentUser();

  return <NotFoundPage signedIn={Boolean(user)} />;
}
