"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  confirmPasswordError,
  fieldFromAuthError,
  formString,
  passwordError,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

import { AuthFormHeader } from "./auth-form-header";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace("/forgot-password");
        return;
      }

      setReady(true);
    });
  }, [router]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = formString(form, "password");
    const confirmPassword = formString(form, "confirmPassword");

    const nextErrors: FieldErrors = {
      password: passwordError(password),
      confirmPassword: confirmPasswordError(password, confirmPassword),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        const mapped = fieldFromAuthError(error, "password");
        setFieldErrors({ [mapped.field]: mapped.message });
        return;
      }

      await supabase.auth.signOut().catch(() => undefined);
      router.push("/password-reset-success");
      router.refresh();
    } catch {
      setFieldErrors({ password: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={24} label="Checking reset link" />
      </div>
    );
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6"
      noValidate
      onSubmit={handleSubmit}
    >
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
          state={fieldErrors.password ? "error" : "default"}
          hint={fieldErrors.password}
          disabled={pending}
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          size="lg"
          leftIcon={<LockIcon />}
          state={fieldErrors.confirmPassword ? "error" : "default"}
          hint={fieldErrors.confirmPassword}
          disabled={pending}
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Set Password
      </Button>
    </form>
  );
}
