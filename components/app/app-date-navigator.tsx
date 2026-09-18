"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DateNavigator } from "@/components/ui/date-navigator";
import { isoDate } from "@/components/ui/calendar-strip";
import { parseIsoDate, startOfDay } from "@/components/ui/date-picker";

export function AppDateNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const date = useMemo(() => {
    return parseIsoDate(searchParams.get("date") ?? "") ?? startOfDay(new Date());
  }, [searchParams]);

  if (pathname !== "/home") {
    return null;
  }

  function changeDate(next: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", isoDate(next));
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}?${params.toString()}${hash}`, { scroll: false });
  }

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-30">
      <div className="pointer-events-auto">
        <DateNavigator value={date} onChange={changeDate} />
      </div>
    </div>
  );
}
