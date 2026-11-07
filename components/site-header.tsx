"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/pages/question-kits", label: "Question Kits" },
  { href: "/pages/interviews", label: "Interviews" },
];

export function SiteHeader({
  session,
}: {
  session?: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-cyan-200/80 bg-white/70 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase"
          onClick={closeMenu}
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/90 p-1.5 shadow-[0_10px_20px_rgba(14,165,233,0.25)]">
            <Image
              src="/fair-interviews-logo.png"
              alt="Fair Interviews logo"
              width={38}
              height={38}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="flex items-center gap-2">Fair Interviews</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50 hover:text-cyan-900"
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700 transition-transform hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_20px_rgba(14,165,233,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-cyan-500"
            >
              Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex items-center justify-center rounded-md border border-cyan-200 bg-white/80 p-2 text-cyan-700 shadow-sm transition-colors hover:bg-cyan-50 md:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-cyan-100 bg-white/90 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
            {session?.user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50"
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="mt-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-left text-sm font-medium text-cyan-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-lg bg-cyan-600 px-3 py-2 text-center text-sm font-medium text-white"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
