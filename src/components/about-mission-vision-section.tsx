import { Eye, Info, Target } from "lucide-react";

import { SectionHeader } from "@/components/section-header";

const pillars = [
  {
    icon: Info,
    title: "About",
    description:
      "The Prosperity Party Inspection Sector is a dedicated government body responsible for overseeing quality assurance, regulatory compliance, and accountability across public institutions. We serve citizens by ensuring that government services meet the highest standards of excellence and transparency.",
    accent: "from-primary/10 to-primary/5",
  },
  {
    icon: Target,
    title: "Mission",
    description:
      "To conduct rigorous, impartial inspections that uphold national standards, protect public interest, and drive continuous improvement in government service delivery through evidence-based evaluation and actionable recommendations.",
    accent: "from-brand-gold/15 to-brand-gold/5",
  },
  {
    icon: Eye,
    title: "Vision",
    description:
      "A transparent, accountable, and high-performing public sector where every institution delivers quality services that earn the trust and confidence of all Ethiopian citizens.",
    accent: "from-brand-light/10 to-brand-light/5",
  },
] as const;

export function AboutMissionVisionSection() {
  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden bg-surface-elevated"
      aria-labelledby="about-heading"
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 size-96 rounded-full bg-brand-gold/8 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-site relative">
        <SectionHeader
          id="about-heading"
          eyebrow="Who We Are"
          title="About Our Organization"
          description="Committed to excellence, integrity, and public service across Ethiopia."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {pillars.map(({ icon: Icon, title, description, accent }, index) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated p-8 shadow-[0_1px_3px_rgba(15,53,68,0.06)] transition-all duration-300 hover:border-primary/20 hover:shadow-[0_20px_40px_-12px_rgba(15,53,68,0.1)] lg:p-10"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-5xl leading-none text-border/80">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-heading text-2xl text-foreground">{title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
