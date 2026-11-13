import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fairinterviews.org"),
  title: {
    default: "Fair Interviews | Structured Interview Management",
    template: "%s | Fair Interviews",
  },
  description:
    "Plan structured job interviews, build reusable question kits, capture candidate feedback, and make hiring decisions with a consistent process.",
  icons: {
    icon: "/fair-interviews-logo.png",
    shortcut: "/fair-interviews-logo.png",
    apple: "/fair-interviews-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${GeistMono.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader session={session} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
