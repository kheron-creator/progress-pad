import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database";

import { appPathForComplete } from "@/lib/auth/paths";

import { isOnboardingComplete, parseOnboardingDraft, type OnboardingDraft } from "./draft";

type Client = SupabaseClient<Database>;

export async function loadOnboarding(supabase: Client, userId: string) {
  const withAvatar = await supabase
    .from("user_data")
    .select("full_name, avatar_url, onboarding, onboarding_completed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!withAvatar.error) {
    return {
      fullName: parseFullName(withAvatar.data?.full_name),
      avatar: parseAvatar(withAvatar.data?.avatar_url),
      onboarding: parseOnboardingDraft(withAvatar.data?.onboarding),
      onboardingComplete: isOnboardingComplete(withAvatar.data?.onboarding_completed_at),
    };
  }

  if (!isMissingAvatarColumn(withAvatar.error)) {
    throw withAvatar.error;
  }

  const { data, error } = await supabase
    .from("user_data")
    .select("full_name, onboarding, onboarding_completed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    fullName: parseFullName(data?.full_name),
    avatar: parseAvatar(undefined),
    onboarding: parseOnboardingDraft(data?.onboarding),
    onboardingComplete: isOnboardingComplete(data?.onboarding_completed_at),
  };
}

export async function loadAppPath(supabase: Client) {
  const { data, error } = await supabase
    .from("user_data")
    .select("onboarding_completed_at")
    .maybeSingle();

  if (error) {
    return appPathForComplete(false);
  }

  return appPathForComplete(isOnboardingComplete(data?.onboarding_completed_at));
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

export async function saveFullName(supabase: Client, fullName: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const { error } = await supabase.from("user_data").upsert({
    user_id: user.id,
    full_name: fullName,
  });

  if (error) {
    throw error;
  }
}

export type StoredAvatar = {
  explicit: boolean;
  url?: string;
};

function parseAvatar(value: string | null | undefined): StoredAvatar {
  if (value == null) {
    return { explicit: false };
  }

  const trimmed = value.trim();
  return { explicit: true, url: trimmed || undefined };
}

function isMissingAvatarColumn(error: { message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("avatar_url") && (message.includes("schema cache") || message.includes("column"));
}

function parseFullName(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asObject(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}
