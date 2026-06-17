"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, ArrowRight } from "lucide-react";

export function NewsMessagesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/services/news").then(({ newsService }) => {
      newsService.getArticles().then(data => {
        // Filter out drafts just in case the user is an admin looking at the homepage
        const published = data.filter(a => a.status === 'Published');
        setArticles(published);
        setLoading(false);
      });
    });
  }, []);

  const checkState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setScrollProgress(max > 0 ? (scrollLeft / max) * 100 : 0);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < max - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkState);
    checkState();
    window.addEventListener("resize", checkState);
    return () => {
      el.removeEventListener("scroll", checkState);
      window.removeEventListener("resize", checkState);
    };
  }, [articles]); // Re-run when articles load

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section
      id="news"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-28"
      aria-labelledby="news-heading"
    >
      <div className="container-site relative z-10">

        {/* Header Row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              የቅርብ ጊዜ
            </p>
            <h2
              id="news-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              ዜና እና{" "}
              <span style={{ color: "#014BAA" }}>መልዕክቶች</span>
            </h2>
            {/* Yellow accent rule */}
            <div className="mt-6 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ ...(canScrollLeft ? {} : {})} }
              onMouseEnter={(e) => canScrollLeft && ((e.currentTarget as HTMLElement).style.backgroundColor = "#014BAA", (e.currentTarget as HTMLElement).style.borderColor = "#014BAA")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "white", (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0")}
              aria-label="ወደ ግራ ይגלגלו"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              onMouseEnter={(e) => canScrollRight && ((e.currentTarget as HTMLElement).style.backgroundColor = "#014BAA", (e.currentTarget as HTMLElement).style.borderColor = "#014BAA")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "white", (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0")}
              aria-label="ወደ ቀኝ ይגלגלו"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-14">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 px-0.5"
          >
            {loading ? (
              <div className="w-full flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="w-full flex justify-center py-10 text-slate-500">
                ምንም ዜና አልተገኘም (No news found)
              </div>
            ) : articles.map((item, index) => (
              <article
                key={item.id}
                className="group w-[85vw] shrink-0 snap-start overflow-hidden rounded-3xl bg-white p-2 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.10)] sm:w-[360px] md:w-[400px]"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                  {/* Defaulting to placeholder since there's no image field yet */}
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
                    <svg className="size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21Z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-400">ፎቶ ያልተሰቀለ</span>
                  </div>
                  {index === 0 && (
                    <div
                      className="absolute right-3 top-3 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: "#014BAA" }}
                    >
                      አዲስ
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex min-h-[200px] flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      <time dateTime={item.published || item.created}>{item.published || item.created}</time>
                    </div>
                    <h3 className="font-heading text-xl font-semibold leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-slate-700">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
                      {item.content || "No description provided."}
                    </p>
                  </div>
                  <Link
                    href={`#news-${item.id}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                    style={{ color: "#014BAA" }}
                    aria-label={`${item.title} ሙሉ ይዘት`}
                  >
                    የጽሁፉን ሙሉ ይዘት ያንብቡ
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(8, scrollProgress)}%`, backgroundColor: "#FFB800" }}
              />
            </div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400 select-none">
              ለመመልከት ይጎትቱ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
