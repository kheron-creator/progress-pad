import type { Metadata } from "next";

import { HomePage } from "@/components/app/home-page";

export const metadata: Metadata = {
  title: "Progress Today · Progress Pad",
  description: "Your Progress Today homepage",
};

export default function AppHomePage() {
  return <HomePage />;
}
