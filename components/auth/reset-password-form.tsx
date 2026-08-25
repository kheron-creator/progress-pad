"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

import { AuthFormHeader } from "./auth-form-header";

export function ResetPasswordForm() {
  const router = useRouter();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/password-reset-success");
  }

  return (
    <form className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6" onSubmit={handleSubmit}>
      <AuthFormHeader
        title="Set New Password"
        description="Enter your new password to complete the reset process."
      />

      <div className="flex flex-col gap-3 sm:gap-4">
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Enter your password"
          size="lg"
          leftIcon={<LockIcon />}
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          size="lg"
          leftIcon={<LockIcon />}
        />
      </div>

      <Button type="submit" size="lg" fullWidth>
        Set Password
      </Button>
    </form>
  );
}
