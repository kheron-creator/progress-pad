import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in · Progress Pad",
  description: "Sign in to your Progress Pad account",
};

export default function LoginPage() {
  return (
    <AuthShell panel="hero">
      <LoginForm />
    </AuthShell>
  );
}
