"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { AuthError } from "./auth-error";
import { AuthFormHeader } from "./auth-form-header";

type AuthCheckInboxProps = {
  title?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onResend?: () => Promise<string | undefined>;
  resendLabel?: string;
};

export function AuthCheckInbox({
  title = "Check your inbox",
  description,
  actionLabel = "Back to sign in",
  actionHref = "/login",
  onResend,
  resendLabel = "Send again",
}: AuthCheckInboxProps) {
  const router = useRouter();
  const [resendPending, setResendPending] = useState(false);
  const [resendError, setResendError] = useState<string>();
  const [resendSent, setResendSent] = useState(false);

  async function handleResend() {
    if (!onResend) {
      return;
    }

    setResendPending(true);
    setResendError(undefined);
    setResendSent(false);

    try {
      const error = await onResend();
      if (error) {
        setResendError(error);
        return;
      }

      setResendSent(true);
    } catch {
      setResendError("Something went wrong. Please try again.");
    } finally {
      setResendPending(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <AuthFormHeader title={title} description={description} />
      {resendSent ? (
        <Text variant="caption" className="text-foreground-muted">
          We sent another email.
        </Text>
      ) : null}
      <AuthError message={resendError} />
      <div className="flex flex-col gap-3">
        <Button size="lg" fullWidth onClick={() => router.push(actionHref)}>
          {actionLabel}
        </Button>
        {onResend ? (
          <Button
            type="button"
            size="lg"
            fullWidth
            look="outline"
            loading={resendPending}
            onClick={handleResend}
          >
            {resendLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
