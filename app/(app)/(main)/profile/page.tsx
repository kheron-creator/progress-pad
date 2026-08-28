import type { Metadata } from "next";

import { ProfilePage } from "@/components/app/profile-page";
import { routineOptions } from "@/lib/onboarding/content";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Profile · Progress Pad",
  description: "Customize your experience.",
};

function memberSinceLabel(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function ProfileRoute() {
  const user = await requireUser();
  const roleLabels = user.onboarding.routine.flatMap((id) => {
    const label = routineOptions.find((option) => option.id === id)?.label;
    return label ? [label] : [];
  });

  return (
    <ProfilePage
      name={user.name}
      email={user.email}
      avatarUrl={user.avatarUrl}
      roleLabels={roleLabels}
      memberSince={memberSinceLabel(user.createdAt)}
    />
  );
}
