import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set new password · Progress Pad",
  description: "Choose a new Progress Pad password",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell panel="lock">
      <ResetPasswordForm />
    </AuthShell>
  );
}
