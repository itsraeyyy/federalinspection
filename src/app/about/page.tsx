import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { InstitutionalWorkflow } from "@/components/institutional-workflow";

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
  { letter: "ዘ", text: "ስለሥራው አፈጻጸም በፌደራል ደረጃ ለፓርቲው ጉባኤ፣ እንዲሁም እንደአግባብነቱ በክልል እና አካባቢያዊ መዋቅሮች አንድ ደረጃ ከፍ ብሎ ላለው ኮሚሽን እና ለኮንፈረንስ ሪፖርት ያቀርባሉ" },
  { letter: "ዠ", text: "ይህንን መተዳደሪያ ደንብ መሠረት በማድረግ የኮሚሽኑን የውስጥ አሠራር መመሪያዎች ማውጣት ይችላል" },
];

export default function AboutPage() {
  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden bg-white py-20 lg:py-32">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#014BAA 2px, transparent 2px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />
          <div className="container-site relative z-10 flex flex-col items-center text-center">
            <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              ስለ <span style={{ color: "#014BAA" }}>እኛ</span>
            </h1>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-4" />
              <span style={{ color: "#014BAA" }}>ስለ እኛ</span>
            </div>

          </div>
        </section>

        {/* --- Establishment Section --- */}
        <section className="container-site py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
            <div className="flex flex-col justify-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                የኮሚሽኑ <span style={{ color: "#FFB800" }}>አመሰራረት</span>
              </h2>
              <div className="mt-6 h-1 w-12 rounded-full" style={{ backgroundColor: "#014BAA" }} />
              
              <div className="mt-10 space-y-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                <p>
                  የኢህአዴግ 11ኛው መደበኛ ጉባዔ የፓርቲ ውሕደት እንዲፈጸም በተወሰነው መሰረት ህዳር 11 ቀን 2012 ዓ.ም. የኢሕአዴግ ምክር ቤት(ከህወሓት ውጭ) ውሕደቱንና የብልፅግና ፕሮግራምና የመተዳደሪያ ደንብ በመፅደቁ፣ የኢህአዴግ ማዕከላዊ የቁጥጥር ኮሚሽን ይባል የነበረው ከግንባሩ ጋር ከስሞ፤ በብልፅግና ፓርቲ በመጀመሪያው የመተዳደሪያ ደንብ አንቀጽ 15(2)(ረ) መሰረት የቁጥጥርና ኢንስፔክሽን ኮሚሽን ተብሎ ሲመሰረት ኋላም መጋቢት 3 ቀን 2014 ዓ.ም. በብልፅግና ፓርቲ የመጀመሪያው ጉባዔ በጸደቀው መተዳደሪያ ደንብ አንቀጽ 14(2)(ሰ) መሰረት ስያሜው ተሻሽሎ የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን እንዲሁም ጥር 24 ቀን 2017 ዓ.ም. በፓርቲው ሁለተኛ ጉባዔ በጸደቀው የተሻሻለው መተዳደሪያ ደንብ አንቀፅ 16(2) (ሰ) መሰረት ስያሜው እንደገና የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ተብሎ ከተቋቋሙ የፓርቲ ተቋማዊ መዋቅሮች አንዱ ሆኖ የተመሰረተ ነው፡፡
                </p>
                <p>
                  በተሻሻለው የመተዳደሪያ ደንብ አንቀጽ 25(5) (ሀ) መሰረት ኮሚሽኑ በየደረጃው በሚገኙ የፓርቲ አደረጃጀት ጽሕፈት ቤቶች ያደራጃል፣ የራሱን መዋቅር ይዘረጋል፤ የክልልን እና የአካባቢ የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን አባላት በየደረጃው በሚካሄዱ ኮንፈረንሶች ይመረጣሉ። ኮንፈረንስ እስከሚካሄድ ባለው ጊዜ የኮሚሽኑ አባላት መጓደል ወይም አዲስ ማቋቋም ሲያጋጥም ኮሚሽኑ ከየደረጃው ፓርቲ አስተባባሪ ኮሚቴ ጋር በመነጋገር ጊዜያዊ ምደባ ይሰጣል፣ በሚል በተደነገገው መሰረት የተመሰረተ የፓርቲው ተቋም ነው።
                </p>
              </div>
            </div>
            
            {/* Visual Accent for Establishment */}
            <div className="relative flex items-center justify-center rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#014BAA] opacity-5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[#FFB800] opacity-10 blur-3xl" />
              </div>
              <div className="relative flex flex-col items-center gap-6 text-center">
                <div className="relative size-64 overflow-hidden rounded-3xl shadow-inner sm:size-80">
                  <Image src="/logo.jpg" alt="የኮሚሽኑ ምልክት" fill className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Functions & Responsibilities Section --- */}
        <section id="responsibilities" className="relative scroll-mt-28 overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "#014BAA" }}>
          {/* Subtle dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          <div className="container-site relative z-10">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
                የኮሚሽኑ <span style={{ color: "#FFB800" }}>ተግባርና ኃላፊነት</span>
              </h2>
              <div className="mx-auto mt-6 h-0.5 w-10 rounded-full" style={{ backgroundColor: "#FFB800" }} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {responsibilities.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.07]"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 group-hover:bg-[#FFB800] group-hover:text-[#014BAA]"
                    style={{ backgroundColor: "rgba(255,184,0,0.12)", color: "#FFB800" }}
                  >
                    {item.letter}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-white/70 transition-colors duration-200 group-hover:text-white/90">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Institutional Structure Section --- */}
        <section className="container-site py-16 lg:py-24">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              የኮሚሽኑ <span style={{ color: "#014BAA" }}>ተቋማዊ መዋቅር</span>
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-10 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>

          <InstitutionalWorkflow />
        </section>

      </main>
      <Footer />
    </>
  );
}
