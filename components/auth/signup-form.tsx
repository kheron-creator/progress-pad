"use client";

import Link from "next/link";
import { type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { EnvelopeIcon, LockIcon, UserIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { AuthFormHeader } from "./auth-form-header";
import { GoogleButton } from "./google-button";

export function SignupForm() {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="flex w-full min-w-0 flex-col gap-3 sm:gap-5 lg:gap-6" onSubmit={handleSubmit}>
      <AuthFormHeader title="Get Started Now" description="Let's create your account!" />

      <div className="flex min-w-0 flex-col gap-2">
        <Input
          label="Full Name"
          type="text"
          name="name"
          size="lg"
          autoComplete="name"
          placeholder="Linda Jason"
          leftIcon={<UserIcon />}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          size="lg"
          autoComplete="email"
          placeholder="linda@progresspad.com"
          leftIcon={<EnvelopeIcon />}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          size="lg"
          autoComplete="new-password"
          placeholder="Enter your password"
          leftIcon={<LockIcon />}
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          size="lg"
          autoComplete="new-password"
          placeholder="Confirm your password"
          leftIcon={<LockIcon />}
        />
      </div>

      <Checkbox
        name="terms"
        label={
          <span>
            I agree to{" "}
            <Link href="#" className="text-primary">
              Terms & Conditions
            </Link>
          </span>
        }
      />

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" fullWidth>
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
