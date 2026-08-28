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
  avatarUrl?: string;
  createdAt: string;
  onboardingComplete: boolean;
  onboarding: OnboardingDraft;
};

function nameFromMetadata(user: User) {
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }
}

function displayName(user: User, storedName?: string) {
  return storedName || nameFromMetadata(user) || user.email || "there";
}

function avatarUrl(user: User) {
  const value = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
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
  let storedName = loaded.fullName;
  if (!storedName) {
    const fromAuth = nameFromMetadata(user);
    if (fromAuth) {
      const { error } = await supabase.from("user_data").upsert({
        user_id: user.id,
        full_name: fromAuth,
      });
      if (!error) {
        storedName = fromAuth;
      }
    }
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: displayName(user, storedName),
    avatarUrl: avatarUrl(user),
    createdAt: user.created_at,
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
