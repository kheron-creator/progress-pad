import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { redirectSignedInUser } from "@/lib/auth/routing";
import { expiredLinkMessage } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Forgot password · Progress Pad",
  description: "Reset your Progress Pad password",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  await redirectSignedInUser();
  const { error } = await searchParams;

  return (
    <AuthShell panel="lock">
      <ForgotPasswordForm errorMessage={error === "auth" ? expiredLinkMessage : undefined} />
    </AuthShell>
  );
}
