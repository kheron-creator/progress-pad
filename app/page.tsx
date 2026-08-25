import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-page-x py-page-y">
      <Logo className="mb-6" />
      <h1 className="type-page-title text-center">Progress Pad</h1>
      <p className="type-description mt-3 max-w-md text-center">
        The application foundation is ready.
      </p>
      <Link
        href="/design-system"
        className="type-label mt-6 text-primary underline-offset-4 hover:underline"
      >
        Open design system preview
      </Link>
    </main>
  );
}
