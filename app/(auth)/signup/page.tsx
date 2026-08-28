import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { redirectSignedInUser } from "@/lib/auth/routing";

export const metadata: Metadata = {
  title: "Sign up · Progress Pad",
  description: "Create your Progress Pad account",
};

export default async function SignupPage() {
  await redirectSignedInUser();

  return (
    <AuthShell panel="hero">
      <SignupForm />
    </AuthShell>
  );
}
