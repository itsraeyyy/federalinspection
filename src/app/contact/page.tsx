import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden bg-white py-16 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#FFB800 2px, transparent 2px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />
          <div className="container-site relative z-10 flex flex-col items-center text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              ያግ<span style={{ color: "#FFB800" }}>ኙን</span>
            </h1>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-4" />
              <span style={{ color: "#FFB800" }}>ያግኙን</span>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              ለማንኛውም ጥያቄ፣ መረጃ ወይም ማብራሪያ ኮሚሽናችንን በሚከተሉት አድራሻዎች ማግኘት ይችላሉ።
            </p>
          </div>
        </section>

        {/* --- Content Section --- */}
        <section className="container-site py-16 lg:py-24">
          <div className="mx-auto max-w-5xl">
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Address */}
              <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-12px_rgba(1,75,170,0.12)] transition-shadow">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-[#014BAA]">
                  <MapPin className="size-8" />
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">አድራሻ</h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">ዋና ጽ/ቤት</p>
                <p className="mt-1 text-sm text-slate-500">አዲስ አበባ, ኢትዮጵያ</p>
              </div>

              {/* Phone */}
              <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-12px_rgba(1,75,170,0.12)] transition-shadow">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-[#FFB800]">
                  <Phone className="size-8" />
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">ስልክ ቁጥር</h3>
                <p className="mt-2 text-sm font-semibold text-slate-700" style={{ direction: "ltr" }}>+251 11 123 4567</p>
                <p className="mt-1 text-sm text-slate-500" style={{ direction: "ltr" }}>+251 11 123 4568</p>
              </div>

              {/* Email */}
              <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-12px_rgba(1,75,170,0.12)] transition-shadow">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-[#014BAA]">
                  <Mail className="size-8" />
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">ኢሜይል</h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">info@pp-inspection.gov.et</p>
                <p className="mt-1 text-sm text-slate-500">contact@pp-inspection.gov.et</p>
              </div>

              {/* Working Hours */}
              <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-12px_rgba(1,75,170,0.12)] transition-shadow">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-[#FFB800]">
                  <Clock className="size-8" />
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">የስራ ሰዓት</h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">ሰኞ - አርብ</p>
                <p className="mt-1 text-sm text-slate-500">2:00 - 11:30 (የሀገር ውስጥ ሰዓት)</p>
              </div>

            </div>

            {/* Map Placeholder */}
            <div className="mt-12 overflow-hidden rounded-3xl bg-white p-2 ring-1 ring-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl bg-slate-100 sm:aspect-[21/9]">
                <MapPin className="size-12 text-slate-300" />
                <p className="font-heading text-lg font-semibold text-slate-400">ካርታ</p>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
