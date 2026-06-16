import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { navLinks } from "@/lib/site-data";

const submissionLinks = [
  { label: "ጥቆማ", href: "/tikoma" },
  { label: "አቤቱታ", href: "/abetuta" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-100 bg-white">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: "#FFB800" }}
        aria-hidden="true"
      />

      <div className="container-site py-14 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-full ring-2 ring-[#FFB800]/50">
                <Image src="/logo.jpg" alt="የብልፅግና ኢንስፔክሽን ኮሚሽን ምልክት" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">የብልፅግና ኢንስፔክሽን</p>
                <p className="text-xs text-slate-400">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን</p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-500">
              በፓርቲ ተቋማት ውስጥ ጥራት፣ ተጠያቂነትና ግልጽነትን ማረጋገጥ።
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-800">
              ጠንካራ ኢንስፔክሽን ለጠንካራ ፖርቲ!
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#014BAA" }}>
                ምናሌ
              </h3>
              <ul className="mt-4 space-y-2.5" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#014BAA" }}>
                ማቅረቢያ
              </h3>
              <ul className="mt-4 space-y-2.5" role="list">
                {submissionLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#014BAA" }}>
              አግኙን
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-slate-600" role="list">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                <span>
                  ቂርቆስ ክ/ከተማ፣ ወረዳ 08
                  <br />
                  አዲስ አበባ፣ ኢትዮጵያ
                </span>
              </li>
              <li>
                <a
                  href="tel:+251111234567"
                  className="flex items-center gap-2.5 transition-colors hover:text-slate-900"
                >
                  <Phone className="size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                  +251 11 123 4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@pp-inspection.gov.et"
                  className="flex items-center gap-2.5 transition-colors hover:text-slate-900"
                >
                  <Mail className="size-4 shrink-0" style={{ color: "#FFB800" }} aria-hidden="true" />
                  info@pp-inspection.gov.et
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: "#014BAA" }}
            >
              ሙሉ የእውቂያ መረጃ →
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {year} የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን። ሁሉም መብቶች የተጠበቁ ናቸው።
          </p>
          <p className="text-xs text-slate-300">የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</p>
        </div>
      </div>
    </footer>
  );
}
