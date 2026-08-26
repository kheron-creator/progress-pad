"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { AuthFormHeader } from "./auth-form-header";

export function PasswordResetSuccess() {
  const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <AuthFormHeader
        title="Your Password Successfully Changed"
        description="Sign in to your account with your new password"
      />
      <Button size="lg" fullWidth onClick={() => router.push("/login")}>
        Sign in
      </Button>
    </div>
  );
}
