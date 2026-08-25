import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { Text, type TypeVariant } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";

import { ComponentGallery } from "./component-gallery";
import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  title: "Design system · Progress Pad",
  description: "Progress Pad design-system preview",
};

const typeSpec: Array<{ variant: TypeVariant; sample: string; note: string }> = [
  { variant: "display", sample: "Make progress, one step at a time.", note: "Heading Bold · hero / onboarding" },
  { variant: "pageTitle", sample: "Progress Today", note: "Heading Semibold · page titles" },
  { variant: "sectionTitle", sample: "Plan with intention", note: "Heading Semibold · section headings" },
  { variant: "cardTitle", sample: "Personal progression", note: "Heading Medium · card headings" },
  { variant: "subtitle", sample: "Engage for growth", note: "Heading Medium · subheadings" },
  { variant: "nav", sample: "Dashboard", note: "Heading Medium · navigation" },
  { variant: "body", sample: "Small cues that help your day flow.", note: "Body Regular · body" },
  { variant: "bodySmall", sample: "Saved just now.", note: "Body Regular · supporting copy" },
  { variant: "description", sample: "Let’s create your account.", note: "Body Regular · secondary descriptions" },
  { variant: "label", sample: "Email address", note: "Body Medium · form labels" },
  { variant: "button", sample: "Get started now", note: "Body Medium · buttons" },
  { variant: "caption", sample: "Helper and metadata text", note: "Body Regular · captions" },
  { variant: "overline", sample: "Status", note: "Body Medium · overlines" },
  { variant: "quote", sample: "Your Progress Pad is ready.", note: "Body Italic · quotes / empty-state voice" },
  { variant: "status", sample: "Progression ratings saved", note: "Body Medium · status" },
];

const colorGroups: Array<{ title: string; tokens: Array<{ name: string; className: string }> }> = [
  {
    title: "Surfaces",
    tokens: [
      { name: "background", className: "bg-background" },
      { name: "backgroundSubtle", className: "bg-background-subtle" },
      { name: "surface", className: "bg-surface" },
      { name: "surfaceBrand", className: "bg-surface-brand" },
      { name: "surfaceBrandMuted", className: "bg-surface-brand-muted" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "textPrimary", className: "bg-foreground" },
      { name: "textSecondary", className: "bg-foreground-secondary" },
      { name: "textMuted", className: "bg-foreground-muted" },
      { name: "onBrand", className: "bg-foreground-on-brand" },
    ],
  },
  {
    title: "Action",
    tokens: [
      { name: "primary", className: "bg-primary" },
      { name: "primaryHover", className: "bg-primary-hover" },
      { name: "primaryMuted", className: "bg-primary-muted" },
      { name: "secondary", className: "bg-secondary" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "success", className: "bg-success" },
      { name: "warning", className: "bg-warning" },
      { name: "error", className: "bg-error" },
      { name: "info", className: "bg-info" },
    ],
  },
  {
    title: "Borders",
    tokens: [
      { name: "border", className: "bg-border" },
      { name: "borderSubtle", className: "bg-border-subtle" },
      { name: "borderFocus", className: "bg-border-focus" },
      { name: "borderError", className: "bg-border-error" },
    ],
  },
];

const primitiveRamps: Array<{ name: string; prefix: string; steps: string[] }> = [
  {
    name: "spring-green",
    prefix: "--pp-spring-green",
    steps: ["10", "25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "magenta",
    prefix: "--pp-magenta",
    steps: ["10", "25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "bondi-blue",
    prefix: "--pp-bondi-blue",
    steps: ["10", "25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "red",
    prefix: "--pp-red",
    steps: ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "green",
    prefix: "--pp-green",
    steps: ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "yellow",
    prefix: "--pp-yellow",
    steps: ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "blue",
    prefix: "--pp-blue",
    steps: ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "grey",
    prefix: "--pp-grey",
    steps: ["0", "25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
];

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <Text as="h2" variant="sectionTitle">
        {title}
      </Text>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[80rem] flex-col gap-section px-page-x py-page-y">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo size="sm" />
          <Text as="h1" variant="pageTitle">
            Design system
          </Text>
          <Text variant="description">
            Token and component preview. Not a product screen.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="type-label text-primary underline-offset-4 hover:underline">
            Home
          </Link>
        </div>
      </header>

      <PreviewSection title="Brand">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Text variant="caption">Light</Text>
            <div className="flex items-center rounded-md border border-border-subtle bg-[var(--pp-grey-0)] p-card">
              <Logo variant="light" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Text variant="caption">Dark</Text>
            <div className="flex items-center rounded-md bg-[var(--pp-grey-900)] p-card">
              <Logo variant="dark" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Text variant="caption">Auto (follows theme)</Text>
          <div className="flex items-center rounded-md border border-border-subtle bg-surface p-card">
            <Logo />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Breakpoints">
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">All</Badge>
          <Badge className="hidden sm:inline-flex">sm 640</Badge>
          <Badge className="hidden md:inline-flex" tone="secondary">
            md 768
          </Badge>
          <Badge className="hidden lg:inline-flex" tone="info">
            lg 1024
          </Badge>
          <Badge className="hidden xl:inline-flex" tone="success">
            xl 1280
          </Badge>
          <span className="type-caption text-foreground-muted sm:hidden">Currently below 640px</span>
        </div>
      </PreviewSection>

      <PreviewSection title="Scale">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Text variant="subtitle">Space</Text>
            {[4, 8, 12, 16, 24, 32, 48, 64, 96, 128].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="h-3 rounded-xs bg-primary"
                  style={{ width: `var(--pp-space-${step})` }}
                />
                <Text variant="caption">{step}</Text>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Text variant="subtitle">Type size</Text>
              <div className="flex flex-wrap items-end gap-2">
                {[11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 45].map((step) => (
                  <span
                    key={step}
                    className="font-heading text-foreground"
                    style={{ fontSize: `var(--pp-font-size-${step})`, lineHeight: 1 }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Text variant="subtitle">Control height</Text>
              <div className="flex flex-wrap items-end gap-2">
                {[22, 24, 28, 32, 36, 40, 44, 48, 52].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 rounded-xs bg-primary-muted"
                      style={{ height: `var(--pp-control-${step})` }}
                    />
                    <Text variant="caption">{step}</Text>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Text variant="subtitle">Radius</Text>
              <div className="flex flex-wrap gap-3">
                {[4, 8, 12, 16, 24].map((step) => (
                  <div
                    key={step}
                    className="h-12 w-12 border border-border bg-surface-brand-muted"
                    style={{ borderRadius: `var(--pp-radius-${step})` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Typography">
        <div className="flex flex-col gap-6">
          {typeSpec.map((item) => (
            <div key={item.variant} className="flex flex-col gap-1 border-b border-border-subtle pb-4">
              <Text variant="caption" className="text-foreground-muted">
                {item.variant} · {item.note}
              </Text>
              <Text variant={item.variant}>{item.sample}</Text>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Colour">
        <div className="grid gap-8 md:grid-cols-2">
          {colorGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <Text variant="subtitle">{group.title}</Text>
              <div className="grid grid-cols-2 gap-3">
                {group.tokens.map((token) => (
                  <div key={token.name} className="flex flex-col gap-2">
                    <div
                      className={cn(
                        "h-16 rounded-md border border-border-subtle",
                        token.className,
                      )}
                    />
                    <Text variant="caption">{token.name}</Text>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Primitive scales">
        <div className="flex flex-col gap-6">
          {primitiveRamps.map((ramp) => (
            <div key={ramp.name} className="flex flex-col gap-2">
              <Text variant="caption" className="text-foreground-muted">
                {ramp.name}
              </Text>
              <div className="flex overflow-hidden rounded-sm border border-border">
                {ramp.steps.map((step) => (
                  <div
                    key={step}
                    title={`${ramp.prefix}-${step}`}
                    className="h-10 min-w-0 flex-1"
                    style={{ backgroundColor: `var(${ramp.prefix}-${step})` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Layout spacing">
        <div className="flex flex-col gap-3">
          {[
            ["inline", "--pp-space-inline"],
            ["stack", "--pp-space-stack"],
            ["field", "--pp-space-field"],
            ["section", "--pp-space-section"],
            ["card", "--pp-space-card"],
            ["page-x", "--pp-space-page-x"],
          ].map(([name, token]) => (
            <div key={name} className="flex items-center gap-4">
              <div
                className="h-3 rounded-xs bg-primary"
                style={{ width: `var(${token})` }}
              />
              <Text variant="caption">
                {name} · {token}
              </Text>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Radius">
        <div className="flex flex-wrap gap-4">
          {[
            ["xs", "rounded-xs"],
            ["sm / button / input", "rounded-sm"],
            ["md / card", "rounded-md"],
            ["lg / modal", "rounded-lg"],
            ["xl", "rounded-xl"],
            ["full / badge", "rounded-full"],
          ].map(([name, radius]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className={cn("h-16 w-16 border border-border bg-surface-brand-muted", radius)} />
              <Text variant="caption">{name}</Text>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Shadows">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-surface p-6 shadow-sm">
            <Text variant="label">shadow-sm</Text>
          </div>
          <div className="rounded-md bg-surface p-6 shadow-md">
            <Text variant="label">shadow-md</Text>
          </div>
          <div className="rounded-md bg-surface p-6 shadow-lg">
            <Text variant="label">shadow-lg</Text>
          </div>
        </div>
      </PreviewSection>

      <ComponentGallery />
    </main>
  );
}
