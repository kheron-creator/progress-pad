import type { MouseEventHandler } from "react";

import { Button } from "@/components/ui/button";

import { GoogleMark } from "./google-mark";

type GoogleButtonProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function GoogleButton({ label, loading, disabled, onClick }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="primary"
      look="outline"
      size="lg"
      fullWidth
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      <GoogleMark className="size-4 shrink-0 lg:size-5" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
