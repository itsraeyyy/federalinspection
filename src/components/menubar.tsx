"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navLinks } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

export function Menubar() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
          href="/"
          onClick={handleNavClick}
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
          aria-label="መነሻ"
        >
          <div className="relative size-12 overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="የብልፅግና ኢንስፔክሽን ኮሚሽን ምልክት"
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight text-slate-900">
              የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር
            </div>
            <div className="text-sm font-medium leading-tight text-slate-700">
              ኮሚሽን ዋና ጽ/ቤት
            </div>
          </div>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-transparent bg-slate-50/50 p-1 backdrop-blur-sm transition-all hover:bg-slate-50/80" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "relative z-10 block rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                  {isActive && (
                    <div className="absolute inset-0 z-0 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-all" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        </div>

        <div className="flex items-center gap-3">
          {session && (
            <Link
              href="/dashboard"
              className="hidden items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] md:flex"
            >
              Dashboard
            </Link>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-slate-100 md:hidden text-slate-900 hover:bg-slate-200"
                aria-label="የሂደት ምናሌ ክፈት"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)] border-l-0 p-0 sm:max-w-sm">
              <div className="border-b border-slate-100 bg-white px-6 py-8">
                <SheetHeader>
                  <SheetTitle className="text-left text-2xl font-bold tracking-tight text-slate-900">
                    ምናሌ
                  </SheetTitle>
                </SheetHeader>
              </div>
              <ul className="flex flex-col gap-2 p-6" role="list">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className={cn(
                          "block rounded-2xl px-5 py-4 text-base font-semibold transition-all duration-300",
                          isActive
                            ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                {session && (
                  <li className="mt-8 border-t border-slate-100 pt-8">
                    <Link
                      href="/dashboard"
                      onClick={handleNavClick}
                      className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-slate-800 hover:shadow-lg"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
