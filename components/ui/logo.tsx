import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export const logoSources = {
  light: { src: "/brand/logo-light.png", width: 953, height: 176 },
  dark: { src: "/brand/logo-dark.png", width: 952, height: 177 },
} as const;

export type LogoVariant = "light" | "dark" | "auto";
export type LogoSize = "sm" | "md" | "lg" | "xl";

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  alt?: string;
};

const sizeClass: Record<LogoSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-16",
};

function LogoMark({
  variant,
  className,
  alt,
}: {
  variant: "light" | "dark";
  className?: string;
  alt: string;
}) {
  const asset = logoSources[variant];

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      className={cn("h-full w-auto max-w-none", className)}
      style={{ width: "auto", height: "100%" }}
      quality={100}
    />
  );
}

export function Logo({
  variant = "auto",
  size = "md",
  className,
  alt = "Progress Today",
}: LogoProps) {
  if (variant !== "auto") {
    return (
      <span className={cn("inline-flex overflow-hidden", sizeClass[size], className)}>
        <LogoMark variant={variant} alt={alt} />
      </span>
    );
  }

  return (
    <span
      className={cn("pp-logo-auto inline-flex overflow-hidden", sizeClass[size], className)}
      role="img"
      aria-label={alt}
    >
      <LogoMark variant="light" className="pp-logo-light" alt="" />
      <LogoMark variant="dark" className="pp-logo-dark" alt="" />
    </span>
  );
}
