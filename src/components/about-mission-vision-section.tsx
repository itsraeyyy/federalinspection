"use client";

import { useState } from "react";
import { Eye, Target, Diamond, MessageSquareText, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const responsibilities = [
  { letter: "ሀ", text: "ኮሚሽኑ የፓርቲውን መተዳደሪያ ደንብና መመሪያዎች በሥራ ላይ መዋላቸውን ይከታተላል" },
  { letter: "ለ", text: "የፓርቲውን የፖለቲካ ጥራት እና የሥነ-ምግባር ጤናማነት ለማረጋገጥ አስፈላጊውን ክትትል ያደርጋል" },
  { letter: "ሐ", text: "የፓርቲው ገንዘብ፣ ንብረትና ሰነዶች በአግባቡ መጠበቃቸውን ቁጥጥር ያደርጋል፤ የፓርቲው አባላት መዋጮ በወቅቱና በትክክል መሰብሰቡን ይቆጣጠራል" },
  { letter: "መ", text: "የፓርቲው አባላትና አካላት መብቶች እና ጥቅሞች መከበራቸውን ይከታተላል" },
  { letter: "ሠ", text: "ከአባላት የሚቀርቡ አቤቱታዎችን ይቀበላል፤ ይመረምራል፤ የእርምት የውሳኔ ሐሳቡን ለሥራ አስፈጻሚ ኮሚቴ እና እንደአግባቡ በየደረጃው ላሉ የፓርቲ አስተባባሪ ኮሚቴዎች ያቀርባል" },
  { letter: "ረ", text: "በኮሚሽኑ የሚቀርበውን የእርምት ሐሳብ የሥራ አስፈጻሚው ካልተቀበለው ለብልፅግና ምክር ቤት ይቀርባል፤ ምክር ቤቱ በጉዳዩ ላይ የሚሰጠው ውሳኔ እስከ ጉባኤ ድረስ ተፈጻሚ ይሆናል። እንዲሁም በየደረጃው በሚገኙ የኮሚሽን መዋቅር ለፓርቲ አስተባባሪ ኮሚቴ የሚቀርበው የእርምት ሐሳብ ተቀባይነት ካላገኘ ኮሚሽኑ አንድ እርከን ከፍ ብሎ ላለው የፓርቲ አስተባባሪ ኮሚቴ የዲሲፕሊን ክስ ያቀርባል" },
  { letter: "ሰ", text: "ዝርዝር የፓርቲ የዲሲፕሊን፣ የኢንስፔክሽንና ቁጥጥጥር መመሪያ በማርቀቅ ለብልፅግና ምክር ቤት አቅርቦ ያጸድቃል፣ ተፈጻሚነቱን ይከታተል" },
  { letter: "ሸ", text: "የፓርቲው አባላትና አካላት የፓርቲውን ሥነ-ምግባር ማክበራቸውን ይከታተላል፣ የፓርቲ አባላትና አመራር ሊኖራቸው የሚገባ የፓርቲ ሥነ-ምግባር ከፓርቲ ጽ/ቤቶች ጋር ግንዛቤ ይሰጣል" },
  { letter: "ቀ", text: "ሙስናና ብልሹ አሠራር ላይ በፓርቲው ውስጥ ትግል ስለመደረጉ ይከታተላል፣ ያስተባብራል፣ የሙስና ጥፋቶች ሲፈጸሙ ተገቢውን የእርምት እርምጃ እንዲወሰድ ለሚመለከተው የፓርቲ አካላት ያቀርባል፣ አፈጻጸሙን ይከታተላል" },
  { letter: "በ", text: "የሙስናና ብልሹ አሰራሮች ዙሪያ ጥናቶችን ያደርጋል፣ ግንዛቤ ይሰጣል" },
  { letter: "ተ", text: "በየደረጃው የሥነ-ምግባር ጥሰቶችን ይመረምራል፣ ተገቢውን የእርምት ርምጃ እንዲወሰድ ያደርጋል" },
  { letter: "ነ", text: "ከፓርቲው የፖለቲካ አስተባባሪ ኮሚቴዎች በሚሰጥ ተልዕኮ መሠረት አስፈላጊ ሆነው የተገኙ የምርመራ፣ የክትትል እና የቁጥጥር ሥራዎችን ይሠራል" },
  { letter: "ኘ", text: "በፓርቲው አካላት መካከል ልዩነት ሲኖር ወይም ፓርቲውን የሚመለከቱና መጣራት የሚገባቸው ጉዳዮች ሲኖሩ፤ እንዲሁም በፓርቲው ብልፅግና ምክር ቤት ወይም የሥራ አስፈጻሚ ኮሚቴ በኩል ጥያቄ ሲቀርብለት እንደ አንድ ነጻ አጣሪ አካል ሆኖ ያገለግላል፤ የራሱን የውሳኔ ሀሳብ ያካተተ ሪፖርትም ለብልፅግና ምክር ቤት ወይም ሥራ አስፈጻሚ ኮሚቴ ያቀርባል" },
  { letter: "አ", text: "ኮሚሽኑ በፓርቲው መተዳደሪያ ደንቡ የተሰጡትን ተግባራትና ኃላፊነቶች አስመልክቶ በየወቅቱ ኢንስፔክሽንና ልዩ ልዩ ጥናቶችን ያካሂዳል፡፡ የጥናቱን ግኝቶች ከውሳኔ ምክረ-ሐሳብ ጋር ለሚመለከታቸው የፓርቲ አካላት ያቀርባል፣ አፈጻጸሙንም ይከታተላል" },
  { letter: "ከ", text: "ኮሚሽኑ ለሥራ የሚያስፈልገውን ዓመታዊ በጀት በማዘጋጀት እንዲፀድቅ ለብልፅግና ምክር ቤት ያቀርባል፣ ሲፀድቅ ያስተዳድራል፣ ይመራል፣ በየደረጃው የሚገኙ የኮሚሽን መዋቅር ለሥራ የሚያስፈልግ በጀት ትይዩ ለሚገኙ የፓርቲ አስተባባሪ ኮሚቴ ያቀርባሉ፣ ሲጸድቅ ያስተዳድራሉ" },
  { letter: "ወ", text: "ለፓርቲው ፕሮግራም፣ መተዳደሪያ ደንብና ለኮሚሽኑ መመሪያ ተገዢ ያልሆኑ የኮሚሽን አባላትን በሁለት ሶስተኛ ድምፅ ያግዳል" },
  { letter: "ዘ", text: "ስለሥራው አፈጻጸም ለፓርቲው ጉባኤ፣ እንዲሁም እንደአግባብነቱ በክልል እና አካባቢያዊ መዋቅሮች አንድ ደረጃ ከፍ ብሎ ላለው ኮሚሽን እና ለኮንፈረንስ ሪፖርት ያቀርባሉ" },
  { letter: "ዠ", text: "ይህንን መተዳደሪያ ደንብ መሠረት በማድረግ የኮሚሽኑን የውስጥ አሠራር መመሪያዎች ማውጣት ይችላል" },
];

const TABS = [
  {
    id: "vision",
    label: "ራዕይ",
    icon: Eye,
    accent: "#FFB800",
    accentSoft: "rgba(255,184,0,0.08)",
    content: (
      <div>
        <h3 className="mt-1 font-heading text-xl font-bold text-slate-900 sm:text-2xl">የኮሚሽኑ ራዕይ</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
          በ2024 ዓ.ም በሥነ-ምግባር የታነፀ አባልና አመራር ያለው፣ የአሠራር ሥርዓቱ የተጠበቀ እና ውጤታማነቱ የተረጋገጠ ጠንካራ ፓርቲ ተገንብቶ ማየት!
        </p>
      </div>
    ),
  },
  {
    id: "mission",
    label: "ተልዕኮ",
    icon: Target,
    accent: "#014BAA",
    accentSoft: "rgba(1,75,170,0.06)",
    content: (
      <div>
        <h3 className="mt-1 font-heading text-xl font-bold text-slate-900 sm:text-2xl">የኮሚሽኑ ተልዕኮ</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
          የኮሚሽኑን ተቋማዊ አቅም በማጠናከር፣ ውጤታማ ኢንስፔክሽንና ሱፐርቪዥን በማድረግ፤ የፓርቲውን የፖለቲካ ጥራት፣ የሥነ-ምግባር ጤናማነት፣ የአባላት መብት መከበሩን እና የፓርቲ ሀብት አስተዳደር ውጤታማነት በማረጋገጥ ለጠንካራ ፓርቲ ግንባታ የላቀ አስተዋጽኦ ማድረግ ነው፡፡
        </p>
      </div>
    ),
  },
  {
    id: "values",
    label: "ዕሴቶች",
    icon: Diamond,
    accent: "#FFB800",
    accentSoft: "rgba(255,184,0,0.08)",
    content: (
      <div>
        <h3 className="mt-1 font-heading text-xl font-bold text-slate-900 sm:text-2xl">የኮሚሽኑ ዕሴቶች</h3>
        <div className="mt-4 space-y-5">
          {[
            {
              num: "1", title: "ሚዛናዊነት",
              items: ["በሃሳብ ልዕልና መመራት (የመሀሉን መንገድ መከተል)፤ በሚተላለፉ ውሳኔዎች እና በሚሰጡ ምክረ-ሃሳቦች መርሐዊነትን መላበስ፤", "ሚዛናዊነት", "የፓርቲ አሠራር መጠበቁን እና ከፓርቲ አካላትና አባላት የተሰጠውን ተልዕኮና አደራ በታማኝነት፣ በኃላፊነትና በትጋት መፈፀም፣"]
            },
            {
              num: "2", title: "አሳታፊነት",
              items: ["በኮሚሽኑ አሠራርና ተልዕኮ በየደረጃው ለሚገኙ የኮሚሽን መዋቅሮች፣ ለተገልጋይና ባለድርሻ አካላት ግልጸኝነት መፍጠር የአሳታፊነት መርህን በተከተለ የተግባር ስምሪት መምራት፤"]
            },
            {
              num: "3", title: "ተጠያቂነት",
              items: ["የአስተሳሰብና የተግባር ብልሽት ሲያጋጥም፣ የአሠራር ጥሰት ሲከሰት እና ውጤት አልባነት ሲታይ የተጠያቂነት ሥርአትን ማስፈን፣"]
            },
            {
              num: "4", title: "መልካም ሥነ-ምግባር መላበስ",
              items: ["ለፓርቲ ዲሲፕሊን ተገዥ መሆን፣ ግብረገባዊ እሴትን መላበስና በተሟላ ስብዕና የታነጸ መሆን፣"]
            },
            {
              num: "5", title: "ትብብርና ቅንጅት",
              items: ["ለጋራ ተልዕኮ በመተባበርና በመደጋገፍ በስኬት አምጪ የአመራር ስምሪት ሁለንተናዊ እመርታ ማስመዝገብ።"]
            },
          ].map((v) => (
            <div key={v.num}>
              <h4 className="text-base font-bold text-slate-800">{v.num}. {v.title}</h4>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                {v.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "motto",
    label: "መሪ ቃል",
    icon: MessageSquareText,
    accent: "#014BAA",
    accentSoft: "rgba(1,75,170,0.06)",
    content: (
      <div>
        <h3 className="mt-1 font-heading text-xl font-bold text-slate-900 sm:text-2xl">የኮሚሽን ቀዳሚ /መሪ/ ቃል</h3>
        <div className="mt-5 rounded-2xl bg-[#014BAA]/5 p-6 ring-1 ring-[#014BAA]/10 sm:p-8">
          <p className="text-center text-xl font-bold text-[#014BAA] sm:text-2xl">
            &ldquo;ጠንካራ ኢንስፔክሽን፤ ለጠንካራ ፓርቲ!&rdquo;
          </p>
        </div>
        <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-lg">
          ይህ መሪ ቃል ኮሚሽኑ በአሠራርና በአደረጃጀት በመጠናከር፣ የፓርቲውን ደንብና መመሪያዎች መተግበራቸውን ለማረጋገጥ የሚያስችል ጠንካራ ኢንስፔክሽን ለማከናወን የሚያነሳሳ መሪ ሃሳብ ሲሆን የተገኙ ግኝቶችን ከምክረ-ሃሳብ ጋር ለፓርቲ መዋቅሮች በማቅረብ እና አፈፃፀሙን በመከታተል ለፓርቲው ግንባታ አስተዋጽኦ የማበርከት ዓላማን ያነገበ ነው።
        </p>
      </div>
    ),
  },
  {
    id: "responsibilities",
    label: "ተግባርና ኃላፊነት",
    icon: ClipboardList,
    accent: "#014BAA",
    accentSoft: "rgba(1,75,170,0.06)",
    content: (
      <div>
        <h3 className="mt-1 font-heading text-xl font-bold text-slate-900 sm:text-2xl">የኮሚሽኑ ተግባርና ኃላፊነት</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {responsibilities.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#014BAA]/20 hover:shadow-md"
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 group-hover:bg-[#014BAA] group-hover:text-white"
                style={{ backgroundColor: "rgba(1,75,170,0.1)", color: "#014BAA" }}
              >
                {item.letter}
              </span>
              <p className="text-sm leading-relaxed text-slate-600 transition-colors duration-200 group-hover:text-slate-900">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AboutMissionVisionSection() {
  const [activeId, setActiveId] = useState<TabId>("vision");
  const activeTab = TABS.find((t) => t.id === activeId)!;
  const ActiveIcon = activeTab.icon;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#f8fafc] py-20 sm:py-24 lg:py-28"
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
          <h2
            id="ppv-heading"
            className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            ራዕይ፣ ተልዕኮ፣{" "}
            <span style={{ color: "#014BAA" }}>ዕሴቶችና</span>{" "}
            <span style={{ color: "#FFB800" }}>ተግባርና ኃላፊነት</span>
          </h2>
        </div>

        {/* Tab buttons */}
        <div
          role="tablist"
          aria-label=" ራዕይ፣ ተልዕኮ፣ ዕሴቶችና ተግባርና ኃላፊነት"
          className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 sm:gap-2"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeId;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-4 text-left transition-all duration-300 ease-out",
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
                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ease-out",
                    isActive ? "text-white shadow-sm" : "bg-slate-100 text-slate-500 group-hover:scale-105"
                  )}
                  style={isActive ? { backgroundColor: tab.accent } : undefined}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.25 : 2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-bold leading-tight transition-colors duration-300",
                      isActive ? "text-slate-900" : "text-slate-700"
                    )}
                  >
                    {tab.label}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 transition-all duration-300",
                    isActive ? "translate-x-0 opacity-100 text-[#014BAA]" : "opacity-0 -translate-x-1"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div
          role="tabpanel"
          className="mx-auto mt-10 max-w-4xl"
        >
          <div
            key={activeTab.id}
            className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-24px_rgba(1,75,170,0.12)] ring-1 ring-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div
              className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
              style={{ backgroundColor: activeTab.accentSoft }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: activeTab.accent }}
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: activeTab.accent }}
                >
                  <ActiveIcon className="size-7" strokeWidth={2} />
                </div>
                {activeTab.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
