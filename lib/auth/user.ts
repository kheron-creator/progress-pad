import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { loadOnboarding } from "@/lib/onboarding/store";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string;
  onboardingComplete: boolean;
  onboarding: OnboardingDraft;
};

function displayName(user: User) {
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  return user.email ?? "there";
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const loaded = await loadOnboarding(supabase, user.id);

  return {
    id: user.id,
    email: user.email ?? null,
    name: displayName(user),
    onboardingComplete: loaded.onboardingComplete,
    onboarding: loaded.onboarding,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
