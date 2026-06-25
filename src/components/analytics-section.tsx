import Link from "next/link";

const summaryCards = [
  { amharic: "አጠቃላይ መዋቅር", value: "106,174", sub: "ክልሎች / ዞኖች / ወረዳዎች" },
  { amharic: "የኮሚሽን አባላት", value: "531,894", sub: "በሁሉም ክልሎች" },
  { amharic: "የኮሚሽን ኀላፊዎች", value: "2,584", sub: "ንቁ አመራር" },
];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="relative overflow-hidden bg-white py-24 sm:py-28" aria-labelledby="analytics-heading">
      <div className="container-site flex flex-col gap-12">
        <div>
          <h2 id="analytics-heading" className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            የኮሚሽኑ <span style={{ color: "#014BAA" }}>መዋቅር</span> <span style={{ color: "#FFB800" }}>መረጃዎች</span>
          </h2>
          <div className="mt-5 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.amharic} className="group flex flex-col gap-3 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_-8px_rgba(1,75,170,0.10)] hover:ring-[#014BAA]/20">
              <p className="text-3xl font-bold tabular-nums" style={{ color: "#014BAA" }}>{card.value}</p>
              <div>
                <p className="text-sm font-semibold text-slate-800">{card.amharic}</p>
              </div>
              <div className="h-px w-8 rounded-full" style={{ backgroundColor: "#FFB800" }} />
              <p className="text-[11px] text-slate-400">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <Link
            href="/statistics"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#014BAA" }}
          >
            ዝርዝር ይመልከቱ →
          </Link>
        </div>
      </div>
    </section>
  );
}
