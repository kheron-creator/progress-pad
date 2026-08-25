"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { EnvelopeIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

import { AuthFormHeader } from "./auth-form-header";

export function ForgotPasswordForm() {
  const router = useRouter();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/reset-password");
  }

  return (
    <form className="flex w-full min-w-0 flex-col gap-5 sm:gap-6 lg:gap-8" onSubmit={handleSubmit}>
      <AuthFormHeader
        title="Forgot Password"
        description="Enter your email to reset your password"
      />

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="linda@progresspad.com"
        size="lg"
        leftIcon={<EnvelopeIcon />}
      />

      <Button type="submit" size="lg" fullWidth>
        Submit
      </Button>
    </form>
  );
}
