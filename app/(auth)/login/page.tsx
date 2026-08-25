import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in · Progress Pad",
  description: "Sign in to your Progress Pad account",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell panel="hero">
      <LoginForm callbackError={error === "auth"} />
    </AuthShell>
  );
}
