import { Check, FileText, Shield } from "lucide-react";

import { responsibilities } from "@/lib/site-data";
import { SectionHeader } from "@/components/section-header";

const iconMap = {
  check: Check,
  shield: Shield,
  file: FileText,
} as const;

export function CommissionRoleSection() {
  return (
    <section
      className="section-padding bg-brand-dark text-white"
      aria-labelledby="commission-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="commission-heading"
          eyebrow="Our Mandate"
          title="Commission Role & Responsibilities"
          description="Comprehensive oversight to strengthen governance and service quality nationwide."
          dark
        />

        <ul
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {responsibilities.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/8 sm:p-7"
              >
                <div className="mb-5 flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-light ring-1 ring-brand-gold/20">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-3xl leading-none text-white/15">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-gold transition-all duration-300 group-hover:w-full"
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
