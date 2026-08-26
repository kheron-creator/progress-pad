import { authRedirectTo } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

export async function startGoogleSignIn() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authRedirectTo("/onboarding"),
    },
  });

  return error;
}
