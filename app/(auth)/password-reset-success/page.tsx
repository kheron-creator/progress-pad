import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetSuccess } from "@/components/auth/password-reset-success";

export const metadata: Metadata = {
  title: "Password changed · Progress Pad",
  description: "Your Progress Pad password was changed",
};

export default function PasswordResetSuccessPage() {
  return (
    <AuthShell panel="lock">
      <PasswordResetSuccess />
    </AuthShell>
  );
}
