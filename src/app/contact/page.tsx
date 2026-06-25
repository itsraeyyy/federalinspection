"use client";

import Link from "next/link";
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
        <section className="container-site -mt-10 relative z-20 pb-16 lg:pb-24">
          <div className="mx-auto max-w-5xl">

            {/* Info Cards - 2x2 Grid */}
            <div className="grid gap-6 sm:grid-cols-2">

              {/* Address */}
              <div className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(1,75,170,0.12)]">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, #014BAA, #3B82F6)" }} />
                <div className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#014BAA]">
                      <MapPin className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">አድራሻ</h3>
                      <p className="text-sm text-slate-500">ቢሮ አድራሻ</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-5">
                    <p className="text-base font-semibold text-slate-800">ዋና ጽ/ቤት</p>
                    <p className="text-sm text-slate-500">አዲስ አበባ, ኢትዮጵያ</p>
                    <Link
                      href="https://maps.app.goo.gl/oyibfw8ymVbvGZhx9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#014BAA] transition-colors hover:text-blue-700"
                    >
                      በካርታ ላይ ይመልከቱ
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(1,75,170,0.12)]">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, #FFB800, #F59E0B)" }} />
                <div className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#FFB800]">
                      <Phone className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">ስልክ ቁጥር</h3>
                      <p className="text-sm text-slate-500">የስልክ መረጃዎች</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5" style={{ direction: "ltr" }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ዋና ጽ/ቤት</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">+251 111 243 462</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ኢንስፔክሽን ዳይሬክቶሬት</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">+2511112434</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ሥነ-ምግባር ዳይሬክቶሬት</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">+251 111 243 462</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ፓስታ ሳጥን</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">80002/80012</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(1,75,170,0.12)]">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, #014BAA, #3B82F6)" }} />
                <div className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#014BAA]">
                      <Mail className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">ኢሜይል</h3>
                      <p className="text-sm text-slate-500">የኢሜይል አድራሻዎች</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    {[
                      "ppinspectioncommission@gmail.com",
                    ].map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="group/email flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 transition-all hover:bg-blue-50 hover:text-[#014BAA] hover:ring-blue-200"
                        style={{ direction: "ltr" }}
                      >
                        <Mail className="size-3.5 shrink-0 text-slate-400 transition-colors group-hover/email:text-[#014BAA]" />
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(1,75,170,0.12)]">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, #FFB800, #F59E0B)" }} />
                <div className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#FFB800]">
                      <Clock className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">የስራ ሰዓት</h3>
                      <p className="text-sm text-slate-500">የስራ ቀናት</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
                      <span className="text-sm font-bold text-slate-700">ሰኞ - እሑድ</span>
                      <span className="text-sm font-semibold text-slate-500">2:30 - 11:30</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400">(የሀገር ውስጥ ሰዓት)</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Social Media */}
            <div className="mt-16">
              <h3 className="text-center font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                በማህበራዊ <span style={{ color: "#014BAA" }}>ሚዲያ</span>
              </h3>
              <div className="mx-auto mt-6 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {[
                  { href: "https://facebook.com", label: "Facebook", color: "#1877F2" },
                ].map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:text-white"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = s.color; e.currentTarget.style.borderColor = s.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    aria-label={s.label}
                  >
                    {s.label === "YouTube" && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    )}
                    {s.label === "X" && (
                      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    )}
                    {s.label === "Facebook" && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    )}
                    {s.label === "WhatsApp" && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    )}
                    {s.label === "LinkedIn" && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mt-16 overflow-hidden rounded-3xl bg-white p-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] ring-1 ring-slate-100">
              <iframe
                src="https://maps.google.com/maps?q=9.025,38.747&z=14&output=embed"
                width="100%"
                height="480"
                style={{ borderRadius: "1rem" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="የኮሚሽኑ ካርታ"
              />
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
