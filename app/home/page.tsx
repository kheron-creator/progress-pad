import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/app/logout-button";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home · Progress Pad",
  description: "Your Progress Pad home",
};

function displayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  return user.email ?? "there";
}

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = displayName(user);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-page-x">
        <Logo size="sm" className="h-7" />
        <div className="flex min-w-0 items-center gap-3">
          <Text variant="label" className="truncate">
            {name}
          </Text>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-page-x py-page-y">
        <Text as="h1" variant="pageTitle">
          Welcome, {name}
        </Text>
        <Text variant="description" className="mt-2">
          You are signed in.
        </Text>
      </main>
    </div>
  );
}
