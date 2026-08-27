import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { loadOnboarding } from "@/lib/onboarding/store";
import {
  isOnboardingComplete,
  parseOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding/draft";
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

  const fromMetadata = onboardingFromMetadata(user);
  let onboarding = fromMetadata.onboarding;
  let onboardingComplete = fromMetadata.onboardingComplete;

  try {
    const loaded = await loadOnboarding(supabase, user.id);
    onboarding = loaded.onboarding;
    onboardingComplete = loaded.onboardingComplete || fromMetadata.onboardingComplete;
  } catch {
    // Table missing or RLS blocked until the migration is applied.
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: displayName(user),
    onboardingComplete,
    onboarding,
  };
});

function onboardingFromMetadata(user: User) {
  const meta = user.user_metadata ?? {};

  return {
    onboarding: parseOnboardingDraft(meta.onboarding),
    onboardingComplete:
      isOnboardingComplete(meta.onboarding_completed_at) ||
      meta.onboarding_complete === true ||
      meta.onboardingComplete === true,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
