import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export const typeClassNames = {
  display: "type-display",
  pageTitle: "type-page-title",
  sectionTitle: "type-section-title",
  cardTitle: "type-card-title",
  subtitle: "type-subtitle",
  nav: "type-nav",
  body: "type-body",
  bodySmall: "type-body-small",
  description: "type-description",
  label: "type-label",
  button: "type-button",
  caption: "type-caption",
  overline: "type-overline",
  quote: "type-quote",
  status: "type-status",
} as const;

export type TypeVariant = keyof typeof typeClassNames;

type TextOwnProps<T extends ElementType> = {
  as?: T;
  variant?: TypeVariant;
  className?: string;
  children: ReactNode;
};

type TextProps<T extends ElementType> = TextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";

  return (
    <Component className={cn(typeClassNames[variant], className)} {...props}>
      {children}
    </Component>
  );
}
