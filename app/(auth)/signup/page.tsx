import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up · Progress Pad",
  description: "Create your Progress Pad account",
};

export default function SignupPage() {
  return (
    <AuthShell panel="hero">
      <SignupForm />
    </AuthShell>
  );
}
