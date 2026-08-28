import type { SupabaseClient } from "@supabase/supabase-js";

import { clearRememberPreference } from "@/lib/auth/remember";
import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export async function deleteOwnAccount(supabase: Client) {
  const response = await fetch("/api/account", { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Couldn't clear data. Please try again.");
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // Session is already invalid after the auth user is deleted.
  }

  clearRememberPreference();
}
