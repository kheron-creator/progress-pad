import { Text } from "@/components/ui/text";

type AuthFormHeaderProps = {
  title: string;
  description: string;
  align?: "start" | "center";
};

export function AuthFormHeader({
  title,
  description,
  align = "start",
}: AuthFormHeaderProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-center lg:text-left"}>
      <Text as="h1" variant="pageTitle" className="text-balance">
        {title}
      </Text>
      <Text variant="description" className="mt-1 text-pretty lg:mt-1.5">
        {description}
      </Text>
    </div>
  );
}
