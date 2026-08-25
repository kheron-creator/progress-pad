import { Text } from "@/components/ui/text";

export function AuthError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <Text variant="caption" className="text-error" role="alert">
      {message}
    </Text>
  );
}
