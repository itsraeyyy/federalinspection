"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { navLinks } from "@/lib/site-data";

const submissionLinks = [
  { label: "ጥቆማ", href: "/tikoma" },
  { label: "አቤቱታ", href: "/abetuta" },
];

const socialLinks = [
  { href: "https://www.facebook.com/share/1Ejo7j8cf2/", label: "Facebook", color: "#1877F2" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: "#FFB800" }}
        aria-hidden="true"
      />

      <div className="container-site py-14 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Brand + Social */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-full ring-2 ring-[#FFB800]/50">
                <Image src="/logo.jpg" alt="የብልፅግና ኢንስፔክሽን ኮሚሽን ምልክት" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-white">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር</p>
                <p className="text-sm font-medium leading-tight text-slate-400">ኮሚሽን ዋና ጽ/ቤት</p>
              </div>
            </Link>
            <p className="mt-4 text-sm font-semibold text-slate-400">
              ጠንካራ ኢንስፔክሽን ለጠንካራ ፖርቲ!
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-sm ring-1 ring-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:text-white"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = s.color; e.currentTarget.style.borderColor = s.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1e293b"; e.currentTarget.style.borderColor = "#334155"; }}
                  aria-label={s.label}
                >
                  {s.label === "YouTube" && (
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )}
                  {s.label === "X" && (
                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )}
                  {s.label === "Facebook" && (
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  )}
                  {s.label === "WhatsApp" && (
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  )}
                  {s.label === "LinkedIn" && (
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-10 sm:gap-16">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#FFB800" }}>
                ምናሌ
              </h3>
              <ul className="mt-4 space-y-2.5" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#FFB800" }}>
                ማቅረቢያ
              </h3>
              <ul className="mt-4 space-y-2.5" role="list">
                {submissionLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#FFB800" }}>
                አግኙን
              </h3>
              <ul className="mt-4 space-y-4 text-sm text-slate-400" role="list">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                  <span>
                    አዲስ አበባ፣ ኢትዮጵያ
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                  <div>
                    <p>+251 111 243 462</p>
                    <p className="text-xs text-slate-500">ዋና ጽ/ቤት</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                  <a
                    href="mailto:ppinspectioncommission@gmail.com"
                    className="transition-colors hover:text-white"
                    style={{ direction: "ltr" }}
                  >
                    ppinspectioncommission@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                   <span>ሰኞ - እሑድ፣ 2:30 - 11:30</span>
                </li>
              </ul>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: "#FFB800" }}
            >
              ሙሉ የእውቂያ መረጃ
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {year} የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን። ሁሉም መብቶች የተጠበቁ ናቸው።
          </p>
          <p className="text-xs text-slate-600">የኢትዮጵያ ዲሞክራሲያዊ ሪፐብሊክ</p>
        </div>
      </div>
    </footer>
  );
}
