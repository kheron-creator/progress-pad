import Link from "next/link";

import { HomeCtas } from "./home-ctas";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-page-x py-page-y">
      <Logo size="xl" priority className="mb-6" />
      <Text as="h1" variant="pageTitle" className="text-center">
        Progress Pad
      </Text>
      <Text variant="description" className="mt-3 max-w-md text-center">
        Make progress, one step at a time.
      </Text>
      <HomeCtas />
      <Link
        href="/design-system"
        className="type-label mt-8 text-primary underline-offset-4 hover:underline"
      >
        Open design system preview
      </Link>
    </main>
  );
}
