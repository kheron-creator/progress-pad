import type { Metadata } from "next";

import { Text } from "@/components/ui/text";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Progress Today · Progress Pad",
  description: "Your Progress Today homepage",
};

export default async function AppHomePage() {
  const user = await requireUser();

  return (
    <>
      <Text as="h1" variant="pageTitle">
        Progress Today
      </Text>
      <Text variant="description" className="mt-2">
        Welcome, {user.name}. Your Progress Pad is ready.
      </Text>
    </>
  );
}
