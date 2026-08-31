import type { Metadata, Viewport } from "next";
import { Dosis, Poppins } from "next/font/google";

import "./globals.css";

const heading = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading-face",
  display: "swap",
});

const body = Dosis({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Progress Pad",
  description: "Progress Pad application foundation",
  applicationName: "Progress Pad",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`} data-theme="light">
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
