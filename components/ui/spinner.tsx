import { cn } from "@/lib/utils/cn";

type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

export function Spinner({ size = 16, className, label = "Loading" }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)} role="status">
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        className="pp-spin"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <path
          d="M14 8a6 6 0 0 0-6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
