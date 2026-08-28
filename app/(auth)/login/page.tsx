import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { redirectSignedInUser } from "@/lib/auth/routing";
import { expiredLinkMessage } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Sign in · Progress Pad",
  description: "Sign in to your Progress Pad account",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function loginErrorMessage(error?: string) {
  if (error === "auth") {
    return expiredLinkMessage;
  }

  if (error === "oauth") {
    return "Google sign-in failed. Please try again.";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectSignedInUser();
  const { error } = await searchParams;

  return (
    <AuthShell panel="hero">
      <LoginForm errorMessage={loginErrorMessage(error)} />
    </AuthShell>
  );
}
