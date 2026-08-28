"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const COLORS = [
  "#00b53b",
  "#00e873",
  "#44ef97",
  "#ff8700",
  "#ec6100",
  "#ff9900",
  "#ffa92f",
];

type ReadyConfettiProps = {
  className?: string;
};

export function ReadyConfetti({ className }: ReadyConfettiProps) {
  const originRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = originRef.current;
    if (!node) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const burst = window.setTimeout(() => {
      const rect = node.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height * 1) / window.innerHeight,
      };

      void confetti({
        particleCount: 70,
        angle: 60,
        spread: 50,
        startVelocity: 32,
        origin,
        colors: COLORS,
        disableForReducedMotion: true,
      });
      void confetti({
        particleCount: 50,
        angle: 120,
        spread: 50,
        startVelocity: 32,
        origin,
        colors: COLORS,
        disableForReducedMotion: true,
      });
    }, 1200);

    return () => {
      window.clearTimeout(burst);
      confetti.reset();
    };
  }, []);

  return (
    <span ref={originRef} className={className}>
      <svg
        className="pp-ready-check relative z-10 size-45 text-(--pp-spring-green-600)"
        viewBox="0 0 180 180"
        fill="none"
        aria-hidden
      >
        <circle
          className="pp-ready-check-circle"
          cx="90"
          cy="90"
          r="72"
          stroke="currentColor"
          strokeWidth="16"
        />
        <path
          className="pp-ready-check-tick"
          d="M54 92 L80 118 L128 66"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
