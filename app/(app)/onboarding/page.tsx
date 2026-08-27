import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { withRedirected } from "@/lib/auth/routing";
import { stepPath } from "@/lib/onboarding/draft";

export default async function OnboardingIndexPage() {
  const user = await requireUser();
  redirect(await withRedirected(stepPath(user.onboarding.farthestStep)));
}
