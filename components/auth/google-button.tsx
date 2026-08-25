import { Button } from "@/components/ui/button";

import { GoogleMark } from "./google-mark";

type GoogleButtonProps = {
  label: string;
};

export function GoogleButton({ label }: GoogleButtonProps) {
  return (
    <Button type="button" variant="primary" look="outline" size="lg" fullWidth>
      <GoogleMark className="size-4 shrink-0 lg:size-5" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
