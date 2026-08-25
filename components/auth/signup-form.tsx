"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { EnvelopeIcon, LockIcon, UserIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Text } from "@/components/ui/text";
import {
  authRedirectTo,
  clearFieldError,
  confirmPasswordError,
  emailError,
  fieldFromAuthError,
  formString,
  nameError,
  passwordError,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

import { AuthCheckInbox } from "./auth-check-inbox";
import { AuthError } from "./auth-error";
import { AuthFormHeader } from "./auth-form-header";
import { GoogleButton } from "./google-button";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [inboxEmail, setInboxEmail] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.name) {
      return;
    }

    setFieldErrors((current) => clearFieldError(current, target.name));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = formString(form, "name");
    const email = formString(form, "email");
    const password = formString(form, "password");
    const confirmPassword = formString(form, "confirmPassword");
    const termsAccepted = form.get("terms") === "on";

    const nextErrors: FieldErrors = {
      name: nameError(name),
      email: emailError(email),
      password: passwordError(password),
      confirmPassword: confirmPasswordError(password, confirmPassword),
      terms: termsAccepted ? undefined : "Agree to the Terms & Conditions to continue.",
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: authRedirectTo("/home"),
        },
      });

      if (error) {
        const mapped = fieldFromAuthError(error, "email");
        setFieldErrors({ [mapped.field]: mapped.message });
        return;
      }

      if (data.session) {
        router.push("/home");
        router.refresh();
        return;
      }

      if (data.user?.identities && data.user.identities.length === 0) {
        setFieldErrors({ email: "An account with this email already exists." });
        return;
      }

      setInboxEmail(email);
    } catch {
      setFieldErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (inboxEmail) {
    return (
      <AuthCheckInbox description={`We sent a confirmation link to ${inboxEmail}.`} />
    );
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-3 sm:gap-5 lg:gap-6"
      noValidate
      onChange={handleChange}
      onSubmit={handleSubmit}
    >
      <AuthFormHeader title="Get Started Now" description="Let's create your account!" />

      <div className="flex min-w-0 flex-col gap-2">
        <Input
          label="Full Name"
          type="text"
          name="name"
          size="lg"
          autoComplete="name"
          placeholder="John Doe"
          leftIcon={<UserIcon />}
          state={fieldErrors.name ? "error" : "default"}
          hint={fieldErrors.name}
          disabled={pending}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          size="lg"
          autoComplete="email"
          placeholder="johndoe@gmail.com"
          leftIcon={<EnvelopeIcon />}
          state={fieldErrors.email ? "error" : "default"}
          hint={fieldErrors.email}
          disabled={pending}
        />
        <Input
          label="Password"
          name="password"
          size="lg"
          autoComplete="new-password"
          placeholder="Enter your password"
          leftIcon={<LockIcon />}
          state={fieldErrors.password ? "error" : "default"}
          hint={fieldErrors.password}
          disabled={pending}
        />
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          size="lg"
          autoComplete="new-password"
          placeholder="Confirm your password"
          leftIcon={<LockIcon />}
          state={fieldErrors.confirmPassword ? "error" : "default"}
          hint={fieldErrors.confirmPassword}
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Checkbox
          name="terms"
          disabled={pending}
          invalid={Boolean(fieldErrors.terms)}
          label={
            <span>
              I agree to{" "}
              <Link href="#" className="text-primary">
                Terms & Conditions
              </Link>
            </span>
          }
        />
        <AuthError message={fieldErrors.terms} />
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" fullWidth loading={pending}>
          Sign up
        </Button>

        <Divider label="or" />
        <GoogleButton label="Sign up with Google" />
        <Text
          variant="body"
          className="type-label flex flex-wrap items-center justify-center gap-x-1 text-center"
        >
          Already have an account?{" "}
          <Link href="/login" className="type-label text-primary">
            Sign in
          </Link>
        </Text>
      </div>
    </form>
  );
}
