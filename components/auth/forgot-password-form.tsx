"use client";

import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { EnvelopeIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  authRedirectTo,
  emailError,
  fieldFromAuthError,
  formString,
  isRateLimitError,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

import { AuthCheckInbox } from "./auth-check-inbox";
import { AuthFormHeader } from "./auth-form-header";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string>();

  async function sendResetEmail(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectTo("/reset-password"),
    });

    if (error && isRateLimitError(error)) {
      return fieldFromAuthError(error, "email").message;
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = formString(new FormData(event.currentTarget), "email");
    const nextEmailError = emailError(email);

    setEmailFieldError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    setPending(true);

    try {
      const error = await sendResetEmail(email);
      if (error) {
        setEmailFieldError(error);
        return;
      }

      setSentEmail(email);
    } catch {
      setEmailFieldError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sentEmail) {
    return (
      <AuthCheckInbox
        description="If an account exists for that email, we sent a link to reset your password."
        onResend={() => sendResetEmail(sentEmail)}
      />
    );
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-5 sm:gap-6 lg:gap-8"
      noValidate
      onChange={() => setEmailFieldError(undefined)}
      onSubmit={handleSubmit}
    >
      <AuthFormHeader
        title="Forgot Password"
        description="Enter your email to reset your password"
      />

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="johndoe@gmail.com"
        size="lg"
        leftIcon={<EnvelopeIcon />}
        state={emailFieldError ? "error" : "default"}
        hint={emailFieldError}
        disabled={pending}
      />

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Submit
      </Button>
    </form>
  );
}
