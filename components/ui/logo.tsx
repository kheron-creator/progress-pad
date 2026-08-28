import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export const logoSources = {
  light: { src: "/brand/logo-light.png", width: 1384, height: 308 },
  dark: { src: "/brand/logo-dark.png", width: 1380, height: 308 },
} as const;

export type LogoVariant = "light" | "dark" | "auto";
export type LogoSize = "sm" | "md" | "lg" | "xl";

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  alt?: string;
  priority?: boolean;
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
  priority,
}: {
  variant: "light" | "dark";
  className?: string;
  alt: string;
  priority?: boolean;
}) {
  const asset = logoSources[variant];

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn("max-h-full max-w-full object-contain object-left", className)}
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
  priority,
}: LogoProps) {
  if (variant !== "auto") {
    return (
      <span className={cn("inline-flex items-center", sizeClass[size], className)}>
        <LogoMark variant={variant} alt={alt} priority={priority} />
      </span>
    );
  }

  return (
    <span
      className={cn("pp-logo-auto inline-flex items-center", sizeClass[size], className)}
      role="img"
      aria-label={alt}
    >
      <LogoMark variant="light" className="pp-logo-light" alt="" priority={priority} />
      <LogoMark variant="dark" className="pp-logo-dark" alt="" />
    </span>
  );
}
