"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SearchIcon, SparkleIcon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";

function StatusMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-20 items-center justify-center rounded-full bg-primary-muted text-primary">
      {children}
    </span>
  );
}

type StatusPageProps = {
  kicker: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon: ReactNode;
  showLogo?: boolean;
};

export function StatusPage({
  kicker,
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  showLogo = false,
}: StatusPageProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center text-center",
        showLogo && "min-h-dvh px-page-x py-page-y",
      )}
    >
      {showLogo ? <Logo size="lg" priority className="mb-8" /> : null}
      <div className="mb-6">{icon}</div>
      <Text variant="overline" className="text-primary">
        {kicker}
      </Text>
      <Text as="h1" variant="pageTitle" className="mt-2 text-balance">
        {title}
      </Text>
      <Text variant="description" className="mt-2 max-w-md text-pretty">
        {description}
      </Text>
      <Button size="lg" className="mt-8" onClick={() => router.push(actionHref)}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function ComingSoonPage() {
  return (
    <StatusPage
      kicker="Next up"
      title="Coming soon"
      description="This part of Progress Pad isn’t ready yet. Keep making progress today — we’ll meet you here."
      actionLabel="Back to Progress Today"
      actionHref="/home"
      icon={
        <StatusMark>
          <SparkleIcon size={36} weight="fill" />
        </StatusMark>
      }
    />
  );
}

export function NotFoundPage({ signedIn }: { signedIn: boolean }) {
  return (
    <StatusPage
      showLogo
      kicker="404"
      title="Page not found"
      description="This page doesn’t exist, or it moved. Let’s get you back to making progress."
      actionLabel={signedIn ? "Back to Progress Today" : "Go home"}
      actionHref={signedIn ? "/home" : "/"}
      icon={
        <StatusMark>
          <SearchIcon size={36} />
        </StatusMark>
      }
    />
  );
}
