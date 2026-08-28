import type { SupabaseClient } from "@supabase/supabase-js";

import { clearRememberPreference } from "@/lib/auth/remember";
import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export async function deleteOwnAccount(supabase: Client) {
  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    throw error;
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // Session is already invalid after the auth user is deleted.
  }

  clearRememberPreference();
}
