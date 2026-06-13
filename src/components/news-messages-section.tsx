import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { newsItems } from "@/lib/site-data";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";

export function NewsMessagesSection() {
  const [featured, ...rest] = newsItems;

  return (
    <section
      id="news"
      className="section-padding bg-surface-elevated"
      aria-labelledby="news-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="news-heading"
          eyebrow="Latest Updates"
          title="News & Messages"
          description="Announcements, reports, and official communications from the Inspection Sector."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="group card-hover relative overflow-hidden rounded-2xl bg-brand-dark shadow-[0_4px_24px_rgba(15,53,68,0.15)] lg:row-span-2">
            <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <Image
                src={featured.image}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/40 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-brand-gold-light">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <time dateTime={featured.date}>{featured.date}</time>
                <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-brand-gold-light">
                  Featured
                </span>
              </div>
              <h3 className="font-heading text-2xl leading-snug text-white sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70 sm:text-base">
                {featured.description}
              </p>
              <Button
                asChild
                className="mt-6 h-10 rounded-full bg-white/15 px-5 text-white backdrop-blur-sm hover:bg-white/25"
              >
                <Link
                  href={`#news-${featured.id}`}
                  aria-label={`Read more about ${featured.title}`}
                >
                  Read More
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>

          <div className="flex flex-col gap-6">
            {rest.map((item) => (
              <article
                key={item.id}
                className="group card-hover flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated sm:flex-row"
              >
                <div className="relative aspect-[16/10] shrink-0 overflow-hidden sm:aspect-auto sm:w-44 sm:min-h-[180px] lg:w-52">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="208px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <time dateTime={item.date}>{item.date}</time>
                  </div>
                  <h3 className="mt-2 font-heading text-lg leading-snug text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <Link
                    href={`#news-${item.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-light"
                    aria-label={`Read more about ${item.title}`}
                  >
                    Read More
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
