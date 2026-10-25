"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/supabase/client";

import { AuthError } from "./auth-error";
import { AuthFormHeader } from "./auth-form-header";

type OAuthConsentProps = {
  authorizationId?: string;
  clientName?: string;
  email?: string;
  error?: string;
};

const ACCESS = [
  "Read your daily pad, pillar ratings, triggers, mind sweep and journal entries",
  "Add and edit entries, ratings, mind sweep items and triggers",
  "It cannot delete anything or change your account",
];

export function OAuthConsent({ authorizationId, clientName, email, error }: OAuthConsentProps) {
  const [pending, setPending] = useState<"approve" | "deny" | null>(null);
  const [message, setMessage] = useState<string | undefined>(error);

  async function decide(decision: "approve" | "deny") {
    if (!authorizationId) {
      return;
    }

    setPending(decision);
    setMessage(undefined);
    const supabase = createClient();
    const result =
      decision === "approve"
        ? await supabase.auth.oauth.approveAuthorization(authorizationId)
        : await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (result.error) {
      setPending(null);
      setMessage("That didn't go through. Please try again.");
    }
  }

  if (!authorizationId) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-6">
        <AuthFormHeader title="Connect an app" description="Something went wrong with this request." />
        <AuthError message={message} />
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <AuthFormHeader
        title={`Connect ${clientName}`}
        description={`${clientName} wants to use your Progress Pad${email ? ` as ${email}` : ""}.`}
      />
      <ul className="flex flex-col gap-2">
        {ACCESS.map((line) => (
          <li key={line}>
            <Text variant="description">{line}</Text>
          </li>
        ))}
      </ul>
      <AuthError message={message} />
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          fullWidth
          loading={pending === "approve"}
          disabled={pending !== null}
          onClick={() => decide("approve")}
        >
          Allow
        </Button>
        <Button
          size="lg"
          fullWidth
          look="outline"
          loading={pending === "deny"}
          disabled={pending !== null}
          onClick={() => decide("deny")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
