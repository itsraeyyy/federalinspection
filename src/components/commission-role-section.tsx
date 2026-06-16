"use client";

import Link from "next/link";

const responsibilities = [
  { letter: "ሀ", text: "ኮሚሽኑ የፓርቲውን መተዳደሪያ ደንብና መመሪያዎች በሥራ ላይ መዋላቸውን ይከታተላል" },
  { letter: "ለ", text: "የፓርቲውን የፖለቲካ ጥራት እና የሥነ-ምግባር ጤናማነት ለማረጋገጥ አስፈላጊውን ክትትል ያደርጋል" },
  { letter: "ሐ", text: "የፓርቲው ገንዘብ፣ ንብረትና ሰነዶች በአግባቡ መጠበቃቸውን ቁጥጥር ያደርጋል" },
  { letter: "መ", text: "የፓርቲው አባላትና አካላት መብቶች እና ጥቅሞች መከበራቸውን ይከታተላል" },
  { letter: "ሠ", text: "ከአባላት የሚቀርቡ አቤቱታዎችን ይቀበላል፤ ይመረምራል፤ የእርምት የውሳኔ ሐሳቡን ያቀርባል" },
  { letter: "ረ", text: "በኮሚሽኑ የሚቀርበውን የእርምት ሐሳብ ሥራ አስፈጻሚው ካልተቀበለው ለብልፅግና ምክር ቤት ይቀርባል" },
  { letter: "ሰ", text: "ዝርዝር የፓርቲ የዲሲፕሊን፣ የኢንስፔክሽንና ቁጥጥር መመሪያ በማርቀቅ ያጸድቃል፤ ተፈጻሚነቱን ይከታተላል" },
  { letter: "ሸ", text: "የፓርቲው አባላትና አካላት የፓርቲውን ሥነ-ምግባር ማክበራቸውን ይከታተላል" },
  { letter: "ቀ", text: "ሙስናና ብልሹ አሠራር ላይ በፓርቲው ውስጥ ትግል ስለመደረጉ ይከታተላል፣ ያስተባብራል" },
  { letter: "በ", text: "የሙስናና ብልሹ አሰራሮች ዙሪያ ጥናቶችን ያደርጋል፣ ግንዛቤ ይሰጣል" },
  { letter: "ተ", text: "በየደረጃው የሥነ-ምግባር ጥሰቶችን ይመረምራል፣ ተገቢውን የእርምት ርምጃ እንዲወሰድ ያደርጋል" },
  { letter: "ነ", text: "ከፓርቲው የፖለቲካ አስተባባሪ ኮሚቴዎች ተልዕኮ መሠረት አስፈላጊ የምርመራ ሥራዎችን ይሠራል" },
];

const VISIBLE = 6;

export function CommissionRoleSection() {
  const displayed = responsibilities.slice(0, VISIBLE);

  return (
    <section
      id="commission-role"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-16"
      style={{ backgroundColor: "#014BAA" }}
      aria-labelledby="role-heading"
    >
      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      {/* Yellow accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: "#FFB800" }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 flex h-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">

        {/* Left */}
        <div className="shrink-0 lg:w-[300px] xl:w-[340px] lg:pt-2">
          <h2
            id="role-heading"
            className="font-heading text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl"
          >
            የኮሚሽኑ
            <br />
            <span style={{ color: "#FFB800" }}>ተግባርና ኃላፊነት</span>
          </h2>
          <div className="mt-8 h-px w-16 bg-white/20" />
          <p className="mt-6 text-6xl font-bold tabular-nums text-white/10">
            {responsibilities.length}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
            ዋና ኃላፊነቶች
          </p>
        </div>

        {/* Right */}
        <div className="flex-1">
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {displayed.map((item) => (
              <li key={item.letter}>
                <div className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/10">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200"
                    style={{ backgroundColor: "rgba(255,184,0,0.15)", color: "#FFB800" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "#FFB800";
                      el.style.color = "#014BAA";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "rgba(255,184,0,0.15)";
                      el.style.color = "#FFB800";
                    }}
                  >
                    {item.letter}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-white/60 transition-colors group-hover:text-white/90">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {responsibilities.length > VISIBLE && (
            <Link
              href="/about#responsibilities"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              ሁሉንም ኃላፊነቶች ይመልከቱ ↓
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
