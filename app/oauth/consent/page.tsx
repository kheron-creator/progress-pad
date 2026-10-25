import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthConsent } from "@/components/auth/oauth-consent";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Connect an app · Progress Pad",
  description: "Allow an app to use your Progress Pad",
};

type ConsentPageProps = {
  searchParams: Promise<{ authorization_id?: string }>;
};

export default async function OAuthConsentPage({ searchParams }: ConsentPageProps) {
  const { authorization_id: authorizationId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // proxy.ts remembers this page and sends the user back after sign in.
    redirect("/login");
  }

  if (!authorizationId) {
    return (
      <AuthShell panel="lock">
        <OAuthConsent error="This link is missing its authorization request. Start connecting again from the app." />
      </AuthShell>
    );
  }

  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !data) {
    return (
      <AuthShell panel="lock">
        <OAuthConsent error="This request has expired or was already used. Start connecting again from the app." />
      </AuthShell>
    );
  }

  if (!("authorization_id" in data)) {
    redirect(data.redirect_url);
  }

  return (
    <AuthShell panel="lock">
      <OAuthConsent
        authorizationId={data.authorization_id}
        clientName={data.client.name || "An app"}
        email={data.user.email}
      />
    </AuthShell>
  );
}
