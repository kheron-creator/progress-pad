import type { Metadata } from "next";

import { Text } from "@/components/ui/text";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Home · Progress Pad",
  description: "Your Progress Pad home",
};

export default async function AppHomePage() {
  const user = await requireUser();

  return (
    <>
      <Text as="h1" variant="pageTitle">
        Welcome, {user.name}
      </Text>
      <Text variant="description" className="mt-2">
        You are signed in.
      </Text>
    </>
  );
}
