import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password · Progress Pad",
  description: "Reset your Progress Pad password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell panel="lock">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
