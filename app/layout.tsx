import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { auth, signOut } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fair Interviews",
  description: "Interview and question kit management",
  icons: {
    icon: "/fair-interviews-logo.png",
    shortcut: "/fair-interviews-logo.png",
    apple: "/fair-interviews-logo.png",
  },
};

const navItems = [
  { href: "/pages/question-kits", label: "Question Kits" },
  { href: "/pages/interviews", label: "Interviews" },
];

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
        <header className="sticky top-0 z-20 border-b border-cyan-200/80 bg-white/70 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase"
            >
              <Image
                src="/abc.png"
                alt="Fair Interviews logo"
                width={50}
                height={38}
                priority
                className="h-9 min-w-14 object-cover shadow-[0_10px_20px_rgba(14,165,233,0.25)]"
              />
              <span className="flex items-center gap-2">Fair Interviews</span>
            </Link>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <NavigationMenu>
                  <NavigationMenuList className="gap-1.5">
                    {navItems.map((item) => (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink
                          href={item.href}
                          className="rounded-md px-3 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50 hover:text-cyan-900 data-[active=true]:bg-cyan-50 data-[active=true]:text-cyan-900"
                        >
                          {item.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              ) : null}

              {session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700 transition-transform hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_20px_rgba(14,165,233,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-cyan-500"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
