import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="gradient-hero absolute inset-0" />
        <div className="pattern-grid absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(201,162,39,0.1),transparent)]"
          aria-hidden="true"
        />
      </div>

      <div className="container-site flex w-full flex-col items-center px-4 py-32 text-center sm:py-36">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ring-white/25 backdrop-blur-sm sm:size-24 sm:rounded-3xl">
            <ShieldCheck className="size-10 sm:size-12" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold-light sm:text-sm">
            Prosperity Party
          </p>
        </div>

        {/* Title */}
        <h1
          id="hero-heading"
          className="font-heading max-w-4xl text-balance text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Inspection Sector
        </h1>

        {/* Motto */}
        <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/75 sm:text-lg md:text-xl">
          Ensuring Quality and Accountability in Government Services
        </p>

        <p className="mt-2 text-sm font-medium text-white/50">
          Federal Democratic Republic of Ethiopia
        </p>

        {/* Buttons */}
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full bg-brand-gold px-8 text-base font-semibold text-brand-dark shadow-[0_4px_24px_rgba(201,162,39,0.35)] hover:bg-brand-gold-light sm:w-auto"
          >
            <Link href="#news">
              Tikoma
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full border-white/30 bg-white/10 px-8 text-base font-medium text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
          >
            <Link href="#about">Abetuta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
