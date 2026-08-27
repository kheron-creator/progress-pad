import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database";

import { isOnboardingComplete, parseOnboardingDraft, type OnboardingDraft } from "./draft";

type Client = SupabaseClient<Database>;

export async function loadOnboarding(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("user_data")
    .select("onboarding, onboarding_completed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    onboarding: parseOnboardingDraft(data?.onboarding),
    onboardingComplete: isOnboardingComplete(data?.onboarding_completed_at),
  };
}

export async function saveOnboarding(
  supabase: Client,
  draft: OnboardingDraft,
  options?: { complete?: boolean },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const { data: existing, error: readError } = await supabase
    .from("user_data")
    .select("onboarding")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const previous = asObject(existing?.onboarding);
  const payload: Database["public"]["Tables"]["user_data"]["Insert"] = {
    user_id: user.id,
    onboarding: { ...previous, ...draft } as Json,
  };

  if (options?.complete) {
    payload.onboarding_completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("user_data").upsert(payload);

  if (error) {
    throw error;
  }
}

function asObject(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}
