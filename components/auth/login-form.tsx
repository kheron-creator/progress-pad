"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { EnvelopeIcon, LockIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  emailError,
  expiredLinkMessage,
  fieldFromAuthError,
  formString,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

import { AuthError } from "./auth-error";
import { AuthFormHeader } from "./auth-form-header";
import { GoogleButton } from "./google-button";

type FieldErrors = {
  email?: string;
  password?: string;
};

type LoginFormProps = {
  callbackError?: boolean;
};

export function LoginForm({ callbackError = false }: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(
    callbackError ? expiredLinkMessage : undefined,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = formString(form, "email");
    const password = formString(form, "password");

    const nextErrors: FieldErrors = {
      email: emailError(email),
      password: password ? undefined : "Enter your password.",
    };

    setFieldErrors(nextErrors);
    setFormError(undefined);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const mapped = fieldFromAuthError(error, "password");
        setFieldErrors({ [mapped.field]: mapped.message });
        return;
      }

      router.push("/home");
      router.refresh();
    } catch {
      setFieldErrors({ password: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6"
      noValidate
      onSubmit={handleSubmit}
    >
      <AuthFormHeader title="Welcome back" description="Sign in to your account" />
      <AuthError message={formError} />

      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="linda@progresspad.com"
          size="lg"
          leftIcon={<EnvelopeIcon />}
          state={fieldErrors.email ? "error" : "default"}
          hint={fieldErrors.email}
          disabled={pending}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          size="lg"
          leftIcon={<LockIcon />}
          state={fieldErrors.password ? "error" : "default"}
          hint={fieldErrors.password}
          disabled={pending}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Checkbox name="remember" label="Remember me" disabled={pending} />
        <Link
          href="/forgot-password"
          className="type-label inline-flex min-h-11 shrink-0 items-center text-primary"
        >
          Forgot Password
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" fullWidth loading={pending}>
          Sign in
        </Button>

        <Divider label="or" />
        <GoogleButton label="Sign in with Google" />
        <Text
          variant="body"
          className="type-label flex flex-wrap items-center justify-center gap-x-1 text-center"
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="type-label text-primary">
            Sign up
          </Link>
        </Text>
      </div>
    </form>
  );
}
