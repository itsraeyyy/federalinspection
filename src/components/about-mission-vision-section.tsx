"use client";

import { useState } from "react";
import { Target, Compass, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "mission",
    label: "ዓላማ",
    labelEn: "የፓርቲው ዓላማዎች",
    sublabel: "የፓርቲው ዓላማዎች",
    tagline: "የፓርቲው ዋና ዓላማዎች — ለጠንካራ፣ ዲሞክራሲያዊና ዘላቂ ሀገር",
    icon: Target,
    accent: "#014BAA",
    accentSoft: "rgba(1,75,170,0.08)",
    items: [
      { letter: "ሀ", text: "ጠንካራ፣ ዲሞክራሲያዊ፣ ቅቡልነት ያለው፣ ዘላቂ ሀገረ-መንግሥትና የፖለቲካ ሥርዓት መገንባት" },
      { letter: "ለ", text: "ፈጣንና ፍትሐዊ ተጠቃሚነትን የሚያረጋግጥ ሥር-ነቀል የኢኮኖሚ ሥርዓት መገንባት" },
      { letter: "ሐ", text: "ሁለንተናዊ ብልጽግናን የሚያስገኝ ማኅበራዊ ልማትን ማረጋገጥ" },
      { letter: "መ", text: "ሀገራዊ ክብርንና ጥቅምን ማዕከል ያደረገ የውጭ ግንኙነት ማካሄድ" },
    ],
  },
  {
    id: "vision",
    label: "ራዕይ",
    labelEn: "የፓርቲው መርሆዎች",
    sublabel: "የፓርቲው መርሆዎች",
    tagline: "የፓርቲው መሪ መርሆዎች — በተግባር የሚገለጹ ቁምነገሮች",
    icon: Compass,
    accent: "#FFB800",
    accentSoft: "rgba(255,184,0,0.12)",
    items: [
      { letter: "ሀ", text: "ሕዝባዊነት" },
      { letter: "ለ", text: "ዲሞክራሲያዊነት" },
      { letter: "ሐ", text: "የሕግ የበላይነት" },
      { letter: "መ", text: "ልማትና ፍትሐዊ ተጠቃሚነት" },
      { letter: "ሠ", text: "ተግባራዊ ዕውቀት" },
      { letter: "ረ", text: "ሀገራዊ አንድነትና ህብረ-ብሔራዊነት" },
    ],
  },
  {
    id: "values",
    label: "ዕሴቶች",
    labelEn: "የፓርቲው ዕሴቶች",
    sublabel: "የፓርቲው ዕሴቶች",
    tagline: "የፓርቲው ዕሴቶች — በእያንዳንዱ ተግባር የሚጠበቁ መመሪያዎች",
    icon: Sparkles,
    accent: "#014BAA",
    accentSoft: "rgba(1,75,170,0.06)",
    items: [
      { letter: "ሀ", text: "የዜጎችና የሕዝቦች ክብር" },
      { letter: "ለ", text: "ነፃነት" },
      { letter: "ሐ", text: "ፍትሕ" },
      { letter: "መ", text: "ኅብረ-ብሔራዊ ወንድማማችነትና እህትማማችነት" },
      { letter: "ሠ", text: "ሀገራዊ መግባባት" },
      { letter: "ረ", text: "ታማኝነትና አገልጋይነት" },
      { letter: "ሰ", text: "ውጤታማነትና ተወዳዳሪነት" },
    ],
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AboutMissionVisionSection() {
  const [activeId, setActiveId] = useState<TabId>("mission");
  const activeTab = TABS.find((t) => t.id === activeId)!;
  const ActiveIcon = activeTab.icon;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#f8fafc] py-20 sm:py-24 lg:py-28"
      aria-labelledby="ppv-heading"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(1,75,170,0.08) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full blur-[100px]"
          style={{ backgroundColor: "rgba(1,75,170,0.06)" }}
        />
        <div
          className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full blur-[100px]"
          style={{ backgroundColor: "rgba(255,184,0,0.08)" }}
        />
      </div>

      <div className="container-site relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#014BAA]/70">
            የእኛ መሠረት
          </p>
          <h2
            id="ppv-heading"
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            ዓላማ፣ ራዕይ{" "}
            <span style={{ color: "#014BAA" }}>&amp;</span>{" "}
            <span style={{ color: "#FFB800" }}>ዕሴቶች</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            የፓርቲው ዓላማዎች፣ መርሆዎችና ዕሴቶች — የእኛን መንገድ የሚያበራ መሠረታዊ መመሪያዎች
          </p>
          <div className="mx-auto mt-6 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
        </div>

        {/* Top tab buttons */}
        <div
          role="tablist"
          aria-label="ዓላማ፣ ራዕይ እና ዕሴቶች"
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeId;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "group relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-300 ease-out",
                  "ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#014BAA]/40 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-white shadow-[0_12px_40px_-12px_rgba(1,75,170,0.18)] ring-[#014BAA]/15"
                    : "bg-white/60 ring-slate-200/80 hover:bg-white hover:shadow-md hover:ring-slate-300/80"
                )}
              >
                {isActive && (
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-b-full transition-all duration-300"
                    style={{ backgroundColor: tab.accent }}
                  />
                )}
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ease-out",
                    isActive ? "text-white shadow-sm" : "bg-slate-100 text-slate-500 group-hover:scale-105"
                  )}
                  style={isActive ? { backgroundColor: tab.accent } : undefined}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.25 : 2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-base font-bold leading-tight transition-colors duration-300",
                      isActive ? "text-slate-900" : "text-slate-700"
                    )}
                  >
                    {tab.label}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {tab.labelEn}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-all duration-300",
                    isActive ? "translate-x-0 opacity-100 text-[#014BAA]" : "opacity-0 -translate-x-1"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div
          id={`panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          className="mx-auto mt-10 max-w-5xl"
        >
          <div
            key={activeTab.id}
            className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-24px_rgba(1,75,170,0.12)] ring-1 ring-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {/* Panel header */}
            <div
              className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
              style={{ backgroundColor: activeTab.accentSoft }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: activeTab.accent }}
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                    style={{ backgroundColor: activeTab.accent }}
                  >
                    <ActiveIcon className="size-7" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      {activeTab.sublabel}
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                      {activeTab.label}
                      <span className="ml-2 text-lg font-semibold text-slate-400">
                        ({activeTab.labelEn})
                      </span>
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                      {activeTab.tagline}
                    </p>
                  </div>
                </div>
                <div
                  className="flex size-16 shrink-0 items-center justify-center self-start rounded-2xl bg-white/80 text-2xl font-bold tabular-nums shadow-sm ring-1 ring-slate-100 sm:self-center"
                  style={{ color: activeTab.accent }}
                >
                  {activeTab.items.length}
                </div>
              </div>
            </div>

            {/* Items grid */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <ul
                className={cn(
                  "grid gap-4",
                  activeTab.items.length <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
                )}
                role="list"
              >
                {activeTab.items.map((item, index) => (
                  <li
                    key={item.letter}
                    className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                    style={{ animationDelay: `${index * 60}ms`, animationDuration: "400ms" }}
                  >
                    <div
                      className="group flex h-full items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-transparent hover:bg-white hover:shadow-[0_12px_32px_-12px_rgba(1,75,170,0.12)]"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform duration-300 ease-out group-hover:scale-110"
                        style={{ backgroundColor: activeTab.accent }}
                      >
                        {item.letter}
                      </span>
                      <p className="text-sm font-medium leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-900">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
