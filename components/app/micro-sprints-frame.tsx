"use client";

import { useEffect, useRef } from "react";

/**
 * The micro sprints page ("the T") runs as its own small page in /public/pad, the same
 * page as the Claude artifact, saving through /api/micro-sprints. It fills the rest of
 * the screen so its own sideways scrolling, pop-ups and drag and drop keep working.
 */
export function MicroSprintsFrame() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) {
      return;
    }

    const fit = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      element.style.height = `${Math.max(560, window.innerHeight - top - 16)}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <iframe
      ref={frame}
      src="/pad/micro-sprints.html"
      title="Micro sprints"
      className="block w-full rounded-lg border border-border bg-background"
      style={{ height: 640 }}
    />
  );
}
