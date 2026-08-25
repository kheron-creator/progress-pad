import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button, type ButtonLook, type ButtonSize, type ButtonVariant } from "./button";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  variant?: ButtonVariant;
  look?: ButtonLook;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

export function IconButton({ label, children, ...props }: IconButtonProps) {
  return (
    <Button iconOnly aria-label={label} {...props}>
      {children}
    </Button>
  );
}
