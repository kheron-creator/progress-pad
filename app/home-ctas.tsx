"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function HomeCtas() {
  const router = useRouter();

  return (
    <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
      <Button size="lg" onClick={() => router.push("/signup")}>
        Sign up
      </Button>
      <Button size="lg" look="outline" onClick={() => router.push("/login")}>
        Sign in
      </Button>
    </div>
  );
}
