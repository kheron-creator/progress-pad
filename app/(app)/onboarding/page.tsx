import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { stepPath } from "@/lib/onboarding/draft";

export default async function OnboardingIndexPage() {
  const user = await requireUser();
  redirect(stepPath(user.onboarding.farthestStep));
}
