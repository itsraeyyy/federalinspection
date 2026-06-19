"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Shield,
  Users,
  MapPin,
  Scale,
  ChevronRight,
} from "lucide-react";

const LINE_1 = "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን";
const LINE_2 = "ዋና ጽ/ቤት";
const FULL_TEXT = LINE_1 + "\n" + LINE_2;
const TYPING_SPEED = 80;

const heroStats = [
  { value: 531894, label: "አባላት", icon: Users },
  { value: 106174, label: "መዋቅር", icon: Shield },
  { value: 14, label: "ክልሎች", icon: MapPin },
];

function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

export function HeroSection() {
  const [charCount, setCharCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (charCount < FULL_TEXT.length) {
      const timeout = setTimeout(() => setCharCount((c) => c + 1), TYPING_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [charCount]);

  useEffect(() => {
    if (charCount >= FULL_TEXT.length) {
      const interval = setInterval(() => setShowCursor((v) => !v), 530);
      return () => clearInterval(interval);
    }
  }, [charCount]);

  const typed = FULL_TEXT.slice(0, charCount);
  const line1Typed = typed.slice(0, Math.min(charCount, LINE_1.length));
  const line2Typed = charCount > LINE_1.length + 1 ? typed.slice(LINE_1.length + 1) : "";
  const cursorOnLine1 = charCount <= LINE_1.length;
  const isDone = charCount >= FULL_TEXT.length;

  return (
    <section
      id="home"
      className="hero-mesh-bg relative flex min-h-[100svh] items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(1,75,170,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(1,75,170,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Horizontal accent stripe — top */}
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: "#014BAA" }}
        />
        <div className="absolute inset-x-0 top-1.5 h-px bg-white/50" />

        {/* Glowing orbs */}
        <div
          className="hero-float absolute -right-[15%] top-[15%] h-[420px] w-[420px] rounded-full opacity-30 blur-[90px]"
          style={{ background: "radial-gradient(circle, #014BAA 0%, transparent 70%)" }}
        />
        <div
          className="hero-float-delayed absolute -bottom-[10%] -left-[5%] h-[380px] w-[380px] rounded-full opacity-25 blur-[80px]"
          style={{ background: "radial-gradient(circle, #FFB800 0%, transparent 70%)" }}
        />

        {/* Decorative rings */}
        <div className="hero-spin-slow absolute right-[8%] top-[18%] hidden size-[280px] rounded-full border border-dashed border-[#014BAA]/15 lg:block" />
        <div className="hero-spin-slow absolute right-[10%] top-[20%] hidden size-[220px] rounded-full border border-[#FFB800]/20 lg:block" style={{ animationDirection: "reverse", animationDuration: "32s" }} />

        {/* Dot constellation */}
        {[
          { top: "18%", left: "15%", size: 6 },
          { top: "35%", left: "8%", size: 4 },
          { top: "55%", left: "18%", size: 5 },
          { top: "72%", left: "12%", size: 3 },
          { top: "25%", right: "22%", size: 4 },
          { top: "65%", right: "15%", size: 6 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#014BAA]/20"
            style={{ top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size }}
          />
        ))}
      </div>

      <div className="container-site relative z-10 grid items-center gap-12 py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-32">
        {/* Main content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

          {/* Logo with pulse ring */}
          <div className="relative mb-10">
            <div
              className="hero-pulse-ring absolute -inset-3 rounded-full border-2 border-[#FFB800]/40"
              aria-hidden="true"
            />
            <div className="relative size-28 overflow-hidden rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(1,75,170,0.25)] ring-4 ring-white sm:size-32">
              <div className="absolute inset-2">
                <Image
                  src="/logo.jpg"
                  alt="የብልፅግና ኢንስፔክሽን ኮሚሽን ምልክት"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Typing title */}
          <div className="relative">
            {/* Invisible spacer — reserves exact space */}
            <h1
              aria-hidden="true"
              className="font-heading invisible flex flex-col gap-1 sm:gap-2 text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[3.75rem]"
            >
              <span className="text-slate-900">{LINE_1}</span>
              <span style={{ color: "#014BAA" }}>{LINE_2}</span>
            </h1>
            {/* Animated overlay */}
            <h1
              id="hero-heading"
              className="font-heading absolute inset-0 flex flex-col gap-1 sm:gap-2 text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[3.75rem]"
            >
              <span className="text-slate-900">
                {line1Typed}
                {cursorOnLine1 && (
                  <span
                    className="ml-0.5 inline-block h-[0.85em] w-[4px] translate-y-[0.05em] rounded-sm"
                    style={{ backgroundColor: "#FFB800", opacity: isDone && !showCursor ? 0 : 1 }}
                  />
                )}
              </span>
              <span style={{ color: "#014BAA" }}>
                {line2Typed}
                {!cursorOnLine1 && (
                  <span
                    className="ml-0.5 inline-block h-[0.85em] w-[4px] translate-y-[0.05em] rounded-sm"
                    style={{ backgroundColor: "#FFB800", opacity: isDone && !showCursor ? 0 : 1 }}
                  />
                )}
              </span>
            </h1>
          </div>

          {/* Motto */}
          <div
            className="mt-7 flex flex-col items-center gap-3 lg:items-start"
          >
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "#FFB800" }} />
              <div className="h-1 w-4 rounded-full bg-[#014BAA]/30" />
            </div>
            <p className="text-lg font-bold text-slate-800 sm:text-xl">
              ጠንካራ ኢንስፔክሽን ለጠንካራ ፓርቲ!
            </p>
          </div>

          {/* CTAs */}
          <div
            className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center"
          >
            <Link
              href="/abetuta"
              className="group flex h-14 items-center justify-center gap-3 rounded-2xl bg-white/90 px-10 text-base font-bold shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              style={{ color: "#014BAA" }}
            >
              <FileText className="size-5 text-slate-400 transition-colors group-hover:text-[#014BAA]" />
              አቤቱታ
            </Link>
            <Link
              href="/tikoma"
              className="group flex h-14 items-center justify-center gap-3 rounded-2xl px-10 text-base font-bold text-white shadow-[0_8px_24px_-6px_rgba(1,75,170,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(1,75,170,0.55)]"
              style={{ backgroundColor: "#014BAA" }}
            >
              ጥቆማ
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right side panel */}
        <div
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-[0_24px_60px_-20px_rgba(1,75,170,0.2)] ring-1 ring-white/80 backdrop-blur-md sm:p-8">
            {/* Accent top bar */}
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: "#014BAA" }} />

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "#014BAA" }}>
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">የኮሚሽኑ መዋቅር</p>
                <p className="text-xs text-slate-500">ዋና መረጃዎች</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {heroStats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: "rgba(1,75,170,0.04)" }}
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: "#014BAA" }}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="text-2xl font-bold tabular-nums text-slate-900">
                      <AnimatedNumber target={value} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/analytics"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:opacity-90"
              style={{ backgroundColor: "#014BAA" }}
            >
              ሙሉ መረጃ ይመልከቱ
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Decorative offset card */}
          <div
            className="absolute -bottom-4 -right-4 -z-10 hidden h-full w-full rounded-3xl lg:block"
            style={{ background: "linear-gradient(135deg, #014BAA 0%, #FFB800 100%)", opacity: 0.12 }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full text-white" preserveAspectRatio="none">
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
