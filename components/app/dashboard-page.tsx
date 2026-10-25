"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The Progress Pad Today dashboard, shown full height under the app header. The page
 * itself lives in public/pad/today.html and reads and writes through /api/pad.
 */
export function DashboardPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    function fit() {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }
      const top = frame.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(480, window.innerHeight - top));
    }

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="-mx-page-x -my-page-y flex flex-1 flex-col">
      <iframe
        ref={frameRef}
        src="/pad/today.html"
        title="Progress Pad Today"
        className="block w-full flex-1 border-0"
        style={height ? { height } : undefined}
      />
    </div>
  );
}
