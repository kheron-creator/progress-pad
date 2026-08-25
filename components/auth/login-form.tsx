"use client";

import Link from "next/link";
import { type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { EnvelopeIcon, LockIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { AuthFormHeader } from "./auth-form-header";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6" onSubmit={handleSubmit}>
      <AuthFormHeader title="Welcome back" description="Sign in to your account" />

      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="linda@progresspad.com"
          size="lg"
          leftIcon={<EnvelopeIcon />}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          size="lg"
          leftIcon={<LockIcon />}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Checkbox name="remember" label="Remember me" />
        <Link
          href="/forgot-password"
          className="type-label inline-flex min-h-11 shrink-0 items-center text-primary"
        >
          Forgot Password
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" fullWidth>
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
