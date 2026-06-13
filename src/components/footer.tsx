import Link from "next/link";
import {
  Globe,
  Link2,
  Mail,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
} from "lucide-react";

import { navLinks } from "@/lib/site-data";

const socialLinks = [
  { label: "Official Website", href: "#", icon: Globe },
  { label: "Share Updates", href: "#", icon: Share2 },
  { label: "Resources", href: "#", icon: Link2 },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand-dark text-white">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-gold via-brand-gold-light to-brand-gold"
        aria-hidden="true"
      />
      <div
        className="pattern-grid absolute inset-0 opacity-30"
        aria-hidden="true"
      />

      <div className="container-site relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-xl">Prosperity Party</p>
                <p className="text-sm text-white/60">Inspection Sector</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Ensuring quality, accountability, and transparency in government
              services for the benefit of all Ethiopian citizens.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-xl bg-white/8 text-white/60 ring-1 ring-white/10 transition-all hover:bg-white/15 hover:text-white"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-light">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-light">
              Contact Us
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/60" role="list">
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-brand-gold-light"
                  aria-hidden="true"
                />
                <span>
                  Kirkos Sub-City, Woreda 08
                  <br />
                  Addis Ababa, Ethiopia
                </span>
              </li>
              <li>
                <a
                  href="tel:+251111234567"
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Phone
                    className="size-4 shrink-0 text-brand-gold-light"
                    aria-hidden="true"
                  />
                  +251 11 123 4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@pp-inspection.gov.et"
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Mail
                    className="size-4 shrink-0 text-brand-gold-light"
                    aria-hidden="true"
                  />
                  info@pp-inspection.gov.et
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/45">
            &copy; {currentYear} Prosperity Party Inspection Sector. All rights
            reserved.
          </p>
          <p className="text-xs text-white/35">
            Federal Democratic Republic of Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
