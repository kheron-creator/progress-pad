import type { Metadata } from "next";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HomeCtas } from "./home-ctas";
import { MountainIllustration } from "@/components/auth/mountain-illustration";
import { Card } from "@/components/ui/card";
import { ChartLineIcon, HeadCircuitIcon, LightningIcon } from "@/components/ui/icon";
import { IconMark } from "@/components/ui/icon-mark";
import { Logo } from "@/components/ui/logo";
import { Text } from "@/components/ui/text";
import { LANDING } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Progress Pad · Progress Today",
  description: LANDING.description,
};

const FEATURE_ICONS = [
  {
    icon: <HeadCircuitIcon />,
    tone: "secondary" as const,
  },
  {
    icon: <LightningIcon />,
    tone: "success" as const,
  },
  {
    icon: <ChartLineIcon />,
    tone: "info" as const,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-page-x">
          <Logo size="sm" priority className="h-8 md:h-9" />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <HomeCtas size="sm" compact className="justify-end" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-page-x py-10 md:gap-20 md:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col">
            <Text variant="overline" className="text-primary">
              {LANDING.kicker}
            </Text>
            <Text as="h1" variant="display" className="mt-3 text-balance">
              {LANDING.title}
            </Text>
            <Text variant="description" className="mt-4 max-w-xl text-pretty">
              {LANDING.lede}
            </Text>
            <Text variant="bodySmall" className="mt-3 max-w-xl text-pretty text-foreground-muted">
              {LANDING.description}
            </Text>
            <HomeCtas className="mt-8" />

          </div>
          <div className="hidden min-h-64 items-end justify-center lg:flex">
            <MountainIllustration className="h-full max-h-[28rem] w-full" />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div>
            <Text variant="overline" className="text-primary">
              {LANDING.featuresKicker}
            </Text>
            <Text as="h2" variant="sectionTitle" className="mt-2">
              {LANDING.featuresTitle}
            </Text>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {LANDING.features.map((feature, index) => (
              <Card key={feature.title} className="flex flex-col gap-3">
                <IconMark size="lg" tone={FEATURE_ICONS[index]?.tone ?? "primary"} look="outline">
                  {FEATURE_ICONS[index]?.icon}
                </IconMark>
                <Text as="h3" variant="cardTitle">
                  {feature.title}
                </Text>
                <Text variant="bodySmall" className="text-foreground-muted">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="flex flex-col gap-3 bg-primary-muted sm:p-8">
            <Text variant="overline" className="text-primary">
              {LANDING.companyName}
            </Text>
            <Text as="h2" variant="sectionTitle">
              {LANDING.companyTitle}
            </Text>
            <Text variant="description" className="max-w-3xl text-pretty">
              {LANDING.companyBody}
            </Text>

          </Card>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-page-x py-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" className="h-7" />
          <Text variant="caption" className="text-foreground-muted">
            {LANDING.footerNote}
          </Text>
        </div>
      </footer>
    </div>
  );
}
