"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";

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

export function Menubar() {
  const [activeSection, setActiveSection] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onHero = activeSection === "#home" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);

      const sections = navLinks.map((link) => link.href.replace("#", ""));
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(`#${sections[i]}`);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setActiveSection(href);
    setMobileOpen(false);
  };

  const linkClass = (isActive: boolean) =>
    cn(
      "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
      isActive
        ? onHero && !isScrolled
          ? "bg-white/15 text-white ring-1 ring-white/20"
          : "bg-primary/10 text-primary"
        : onHero && !isScrolled
          ? "text-white/75 hover:bg-white/10 hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isScrolled
          ? "border-b border-border/50 bg-surface-elevated/90 shadow-sm backdrop-blur-xl"
          : onHero
            ? "bg-transparent"
            : "bg-surface-elevated/80 backdrop-blur-md"
      )}
    >
      <nav
        className="container-site flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo Left (Desktop & Mobile) */}
        <Link
          href="#home"
          onClick={() => handleNavClick("#home")}
          className="flex items-center gap-2"
          aria-label="Home"
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              onHero && !isScrolled
                ? "bg-white/15 text-white ring-1 ring-white/25"
                : "bg-primary text-primary-foreground"
            )}
          >
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span
            className={cn(
              "hidden text-sm font-semibold tracking-wide sm:block",
              onHero && !isScrolled ? "text-white" : "text-foreground"
            )}
          >
            PP Inspection
          </span>
        </Link>

        {/* Desktop: centered nav — Home, Sle-Egna, Senedoch, Yagegnun */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={linkClass(isActive)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Action: Dashboard Button (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={cn(
              "hidden rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 md:inline-flex items-center gap-1.5",
              onHero && !isScrolled
                ? "bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/25"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Dashboard
          </Link>

          {/* Mobile: hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg md:hidden",
                  onHero && !isScrolled && "text-white hover:bg-white/10 hover:text-white"
                )}
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)] border-l-0 p-0">
              <div className="border-b border-border bg-primary px-6 py-7 text-primary-foreground">
                <SheetHeader>
                  <SheetTitle className="text-left text-primary-foreground">
                    Navigation
                  </SheetTitle>
                </SheetHeader>
              </div>
              <ul className="flex flex-col gap-1 p-4" role="list">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-4 border-t border-border pt-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-[0.9375rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
