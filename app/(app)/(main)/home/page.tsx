import type { Metadata } from "next";

import { HomePage } from "@/components/app/home-page";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Progress Today · Progress Pad",
  description: "Your Progress Today homepage",
};

export default async function AppHomePage() {
  await requireUser();

  return <HomePage />;
}
