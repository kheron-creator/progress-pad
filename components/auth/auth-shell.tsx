import type { ReactNode } from "react";

import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";

import { AuthLockPanel } from "./auth-lock-panel";
import { MountainIllustration } from "./mountain-illustration";

type AuthShellProps = {
  panel: "hero" | "lock";
  children: ReactNode;
};

export function AuthShell({ panel, children }: AuthShellProps) {
  return (
    <div className="pp-auth grid min-h-dvh bg-surface lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      {panel === "hero" ? (
        <aside className="hidden min-h-0 flex-col px-12 py-8 lg:flex xl:px-16">
          <Logo size="lg" />
          <div className="mt-8 max-w-lg shrink-0">
            <Text as="p" variant="pageTitle">
              Welcome to
            </Text>
            <Text as="h2" variant="display" className="text-primary">
              Progress Pad
            </Text>
            <Text variant="description" className="mt-2">
              Make progress, one step at a time.
            </Text>
          </div>
          <div className="mt-6 flex min-h-0 flex-1 items-end justify-center">
            <MountainIllustration className="h-full max-h-full w-full" />
          </div>
        </aside>
      ) : (
        <aside className="hidden min-h-0 p-8 lg:flex">
          <AuthLockPanel />
        </aside>
      )}

      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          "pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]",
          "pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-8",
        )}
      >
        <div className="mx-auto my-auto flex w-full min-w-0 max-w-[22.5rem] flex-col lg:max-w-[32rem]">
          <div
            className={cn(
              "mb-4 flex sm:mb-5 lg:mb-6",
              panel === "hero" ? "justify-center lg:hidden" : "justify-center lg:justify-start",
            )}
          >
            <Logo size="md" className="max-w-full" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
