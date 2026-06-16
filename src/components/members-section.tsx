"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { memberCategories } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function MembersSection() {
  const [activeTab, setActiveTab] = useState(memberCategories[0].id);
  const scrollRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRefs.current[activeTab];
    if (el) el.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  };

  const checkScroll = useCallback(() => {
    const el = scrollRefs.current[activeTab];
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  }, [activeTab]);

  useEffect(() => {
    const t = setTimeout(checkScroll, 50);
    window.addEventListener("resize", checkScroll);
    return () => { clearTimeout(t); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  return (
    <section
      id="members"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-white py-16"
      aria-labelledby="members-heading"
    >
      <div className="container-site relative z-10 flex h-full flex-col gap-10">

        {/* Top Row */}
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-md">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              ቡድናችን
            </p>
            <h2
              id="members-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              <span style={{ color: "#014BAA" }}>አባ</span>ላት
            </h2>
            {/* Yellow accent rule */}
            <div className="mt-5 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>

          {/* Arrow Controls */}
          <div className="flex shrink-0 items-center gap-2 pt-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border transition-all duration-200",
                canScrollLeft
                  ? "border-slate-200 bg-white text-slate-700 shadow-sm"
                  : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
              )}
              style={canScrollLeft ? {} : {}}
              onMouseEnter={(e) => canScrollLeft && ((e.currentTarget as HTMLElement).style.backgroundColor = "#014BAA", (e.currentTarget as HTMLElement).style.borderColor = "#014BAA", (e.currentTarget as HTMLElement).style.color = "white")}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "white"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border transition-all duration-200",
                canScrollRight
                  ? "border-slate-200 bg-white text-slate-700 shadow-sm"
                  : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
              )}
              onMouseEnter={(e) => canScrollRight && ((e.currentTarget as HTMLElement).style.backgroundColor = "#014BAA", (e.currentTarget as HTMLElement).style.borderColor = "#014BAA", (e.currentTarget as HTMLElement).style.color = "white")}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "white"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div role="tablist" aria-label="የአባላት ምድቦች" className="flex items-center gap-2">
          {memberCategories.map((category) => {
            const isActive = activeTab === category.id;
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(category.id)}
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300"
                style={{
                  backgroundColor: isActive ? "#014BAA" : "white",
                  color: isActive ? "white" : "#64748b",
                  boxShadow: isActive ? "0 4px 16px rgba(1,75,170,0.25)" : "none",
                  border: isActive ? "2px solid #014BAA" : "2px solid #e2e8f0",
                }}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Slider */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 min-h-[380px] sm:min-h-[420px]">
          {memberCategories.map((category) => (
            <div
              key={category.id}
              role="tabpanel"
              hidden={activeTab !== category.id}
              className="transition-opacity duration-300"
            >
              <ul
                ref={(el) => { scrollRefs.current[category.id] = el; }}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-6 lg:px-8 pb-6 pt-1"
                role="list"
              >
                {category.members.map((member) => (
                  <li key={member.id} className="shrink-0 snap-start w-[220px] sm:w-[240px]">
                    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(1,75,170,0.12)] hover:ring-[#014BAA]/20">
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                        {member.image === "__placeholder__" ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-100 to-slate-200">
                            <div className="flex size-16 items-center justify-center rounded-full bg-slate-200">
                              <svg className="size-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-slate-400">ፎቶ ያልተሰቀለ</span>
                          </div>
                        ) : (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 220px, 240px"
                          />
                        )}
                        {/* Yellow top accent bar on hover */}
                        <div
                          className="absolute inset-x-0 top-0 h-1 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"
                          style={{ backgroundColor: "#FFB800" }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center px-4 py-5 text-center">
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 transition-colors group-hover:text-[#014BAA]">
                          {member.name}
                        </h3>
                        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-400 line-clamp-2">
                          {member.position}
                        </p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
