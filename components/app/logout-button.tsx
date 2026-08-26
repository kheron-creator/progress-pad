"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { clearRememberPreference } from "@/lib/auth/remember";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleLogout() {
    setPending(true);
    setError(undefined);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError("Could not sign out. Please try again.");
        return;
      }

      clearRememberPreference();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button look="outline" size="md" loading={pending} onClick={handleLogout}>
        Log out
      </Button>
      {error ? (
        <Text variant="caption" className="text-error" role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
