import "server-only";

import { AVATAR_BUCKET, avatarObjectPath } from "@/lib/auth/avatar";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteSignedInAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("unauthorized");
  }

  const admin = createAdminClient();
  await admin.storage.from(AVATAR_BUCKET).remove([avatarObjectPath(user.id)]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    throw error;
  }
}
