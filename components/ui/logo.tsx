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
      className={cn("w-auto max-w-full object-contain object-left", className)}
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
  const frameClass = cn(sizeClass[size], className);

  if (variant !== "auto") {
    return (
      <span className={cn("inline-flex items-center overflow-hidden", frameClass)}>
        <LogoMark variant={variant} alt={alt} className={frameClass} />
      </span>
    );
  }

  return (
    <span className={cn("pp-logo-auto inline-flex items-center overflow-hidden", frameClass)} role="img" aria-label={alt}>
      <LogoMark variant="light" className={cn("pp-logo-light", frameClass)} alt="" />
      <LogoMark variant="dark" className={cn("pp-logo-dark", frameClass)} alt="" />
    </span>
  );
}
