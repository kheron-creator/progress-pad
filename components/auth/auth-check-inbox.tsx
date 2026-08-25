"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { AuthFormHeader } from "./auth-form-header";

type AuthCheckInboxProps = {
  title?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function AuthCheckInbox({
  title = "Check your inbox",
  description,
  actionLabel = "Back to sign in",
  actionHref = "/login",
}: AuthCheckInboxProps) {
  const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <AuthFormHeader title={title} description={description} />
      <Button size="lg" fullWidth onClick={() => router.push(actionHref)}>
        {actionLabel}
      </Button>
    </div>
  );
}
