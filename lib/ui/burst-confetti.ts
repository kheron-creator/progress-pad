import confetti from "canvas-confetti";

const COLORS = [
  "#00b53b",
  "#00e873",
  "#ff8700",
  "#3b82f6",
  "#ec4899",
  "#facc15",
];

export function burstConfetti(originEl?: HTMLElement | null) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = originEl?.getBoundingClientRect();
  const origin = rect
    ? {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      }
    : { x: 0.5, y: 0.9 };

  void confetti({
    particleCount: 28,
    angle: 90,
    spread: 65,
    startVelocity: 22,
    gravity: 0.95,
    scalar: 0.7,
    origin,
    colors: COLORS,
    ticks: 140,
    disableForReducedMotion: true,
  });
  void confetti({
    particleCount: 12,
    angle: 90,
    spread: 90,
    startVelocity: 16,
    gravity: 1,
    scalar: 0.55,
    origin,
    colors: COLORS,
    ticks: 140,
    disableForReducedMotion: true,
  });
}
