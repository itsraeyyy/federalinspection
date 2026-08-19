"use client";

import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, Users, Building2, MapPin, TrendingUp, BarChart3, Network } from "lucide-react";
import { useState } from "react";

/* ─── Raw data from Section 5 ─── */

const summaryCards = [
  { label: "የኮሚሽን አባላት", labelEn: "Commission Members", value: 546064, icon: Users, color: "#014BAA" },
  { label: "ክልል/ከተማ ኮሚሽን", labelEn: "Regional Commissions", value: 180, icon: Building2, color: "#10B981" },
  { label: "የወረዳ ኮሚሽን", labelEn: "Woreda Commissions", value: 9464, icon: MapPin, color: "#FFB800" },
];

const coverage = [
  { label: "ክልሎች", labelEn: "Regions", value: 14 },
  { label: "የዞን ኮሚሽን", labelEn: "Zone Commissions", value: 1550 },
  { label: "የወረዳ ኮሚሽን", labelEn: "Woreda Commissions", value: 9464 },
];

interface RegionRow {
  id: number;
  name: string;
  regions: number;
  zones: number;
  woredas: number;
  kebeles: number;
  union: number;
  members: number;
  officials: number;
}

const regionalData: RegionRow[] = [
  { id: 1,  name: "ኦሮሚያ",     regions: 1, zones: 434, woredas: 3054, kebeles: 36700,  union: 191715, members: 231918, officials: 15 },
  { id: 2,  name: "አማራ",      regions: 1, zones: 242, woredas: 1827, kebeles: 14717,  union: 50937,  members: 67737,  officials: 14 },
  { id: 3,  name: "ሶማሌ",      regions: 1, zones: 153, woredas: 665,  kebeles: 6180,   union: 45985,  members: 52994,  officials: 11 },
  { id: 4,  name: "አፋር",      regions: 1, zones: 63,  woredas: 350,  kebeles: 2775,   union: 20830,  members: 24030,  officials: 12 },
  { id: 5,  name: "ቤን-ጉሙዝ",   regions: 1, zones: 72,  woredas: 168,  kebeles: 2690,   union: 3505,   members: 6447,   officials: 11 },
  { id: 6,  name: "ጋምቤላ",     regions: 1, zones: 55,  woredas: 84,   kebeles: 1320,   union: 1330,   members: 2804,   officials: 15 },
  { id: 7,  name: "ሐረሪ",      regions: 1, zones: 0,   woredas: 63,   kebeles: 180,    union: 1300,   members: 1557,   officials: 14 },
  { id: 8,  name: "ሲዳማ",      regions: 1, zones: 55,  woredas: 308,  kebeles: 2840,   union: 18095,  members: 21313,  officials: 15 },
  { id: 9,  name: "ደ/ም/ኢ/",   regions: 1, zones: 57,  woredas: 486,  kebeles: 4635,   union: 14645,  members: 19838,  officials: 15 },
  { id: 10, name: "ደ/ኢ/ያ",    regions: 1, zones: 165, woredas: 777,  kebeles: 7885,   union: 51640,  members: 60482,  officials: 15 },
  { id: 11, name: "ማዕ/ኢ/",    regions: 1, zones: 104, woredas: 586,  kebeles: 6585,   union: 23010,  members: 30297,  officials: 12 },
  { id: 12, name: "አዲስ አበባ",  regions: 1, zones: 126, woredas: 918,  kebeles: 0,      union: 22840,  members: 23896,  officials: 12 },
  { id: 13, name: "ድሬዳዋ",    regions: 1, zones: 0,   woredas: 65,   kebeles: 0,      union: 1660,   members: 1736,   officials: 11 },
  { id: 14, name: "ፌዴራል ተአ",  regions: 1, zones: 24,  woredas: 113,  kebeles: 0,      union: 850,    members: 1015,   officials: 8  },
];

const totals = {
  regions: 14, zones: 1550, woredas: 9464, kebeles: 86507,
  union: 448342, members: 546064, officials: 180,
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/* ─── Animated Counter (simple CSS approach) ─── */
function AnimatedValue({ value }: { value: number }) {
  return <span className="tabular-nums">{formatNumber(value)}</span>;
}

/* ─── CSS-only horizontal bar ─── */
function HorizontalBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max((value / max) * 100, 1);
  return (
    <div className="group flex items-center gap-4">
      <span className="w-24 shrink-0 text-right text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative flex-1 h-8 rounded-xl bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <span className={`absolute inset-y-0 right-3 flex items-center text-xs font-bold ${pct > 70 ? "text-white" : "text-slate-600"}`}>
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

/* ─── Donut slice (CSS conic) ─── */
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const start = cumulative;
    cumulative += (d.value / total) * 360;
    return { ...d, start, end: cumulative, color: colors[i % colors.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
      <div
        className="relative size-48 shrink-0 rounded-full shadow-inner"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{formatNumber(total)}</span>
          <span className="text-[0.65rem] font-semibold text-slate-400 tracking-wide">ጠቅላላ</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="block size-3 rounded-full" style={{ backgroundColor: s.color }} />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">{s.label}</span>
              <span className="text-[0.65rem] text-slate-400 tabular-nums">{formatNumber(s.value)} ({((s.value / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function StatisticsPage() {
  const [activeMetric, setActiveMetric] = useState<"members" | "woredas" | "kebeles">("members");

  const maxMembers = Math.max(...regionalData.map((r) => r.members));
  const maxWoredas = Math.max(...regionalData.map((r) => r.woredas));
  const maxKebeles = Math.max(...regionalData.map((r) => r.kebeles));

  const metricConfig = {
    members: { max: maxMembers, key: "members" as const, label: "የኮሚሽን አባላት", color: "#014BAA" },
    woredas: { max: maxWoredas, key: "woredas" as const, label: "ወረዳ", color: "#FFB800" },
    kebeles: { max: maxKebeles, key: "kebeles" as const, label: "ቀበሌ", color: "#10B981" },
  };

  const config = metricConfig[activeMetric];

  // Top 5 regions by members
  const top5 = [...regionalData].sort((a, b) => b.members - a.members).slice(0, 5);

  const donutColors = ["#014BAA", "#FFB800", "#10B981", "#8B5CF6", "#F43F5E", "#06B6D4", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6", "#EF4444", "#3B82F6", "#A855F7", "#78716C"];

  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-white pt-24 pb-20">

        {/* ═══ Hero ═══ */}
        <section className="relative overflow-hidden bg-slate-50 py-16 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(#014BAA 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div className="container-site relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white text-[#014BAA] shadow-sm ring-1 ring-slate-200/60">
              <BarChart3 className="size-8" />
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              <span style={{ color: "#014BAA" }}>መረጃ</span>
            </h1>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-4" />
              <span style={{ color: "#014BAA" }}>መረጃ</span>
            </div>

          </div>
        </section>



        {/* ═══ Summary Cards ═══ */}
        <section className="container-site -mt-12 relative z-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.labelEn}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)]"
                >
                  <div className="absolute -right-6 -top-6 size-24 rounded-full opacity-[0.06]" style={{ backgroundColor: card.color }} />
                  <div className="flex size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${card.color}10`, color: card.color }}>
                    <Icon className="size-6" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      <AnimatedValue value={card.value} />
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{card.label}</p>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-300">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ═══ Bar Chart: Regional Comparison ═══ */}
        <section className="container-site mt-16 lg:mt-24">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                የክልል ንጽጽር
              </h2>
              <p className="mt-1 text-sm text-slate-500">በመለኪያ የክልል ንጽጽር</p>
            </div>
            <div className="flex gap-2">
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 sm:p-8">
            <div className="flex flex-col gap-3">
              {[...regionalData].sort((a, b) => b[config.key] - a[config.key]).map((r) => (
                <HorizontalBar
                  key={r.id}
                  label={r.name}
                  value={r[config.key]}
                  max={config.max}
                  color={config.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Donut + Top 5 Side-by-Side ═══ */}
        <section className="container-site mt-16 lg:mt-24">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Donut */}
            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 sm:p-8">
              <h3 className="font-heading text-xl font-bold text-slate-900">የኮሚሽን አባላት ስርጭት</h3>
              <p className="mb-6 text-sm text-slate-500">በክልል የኮሚሽን አባላት ስርጭት</p>
              <DonutChart
                data={regionalData.map((r) => ({ label: r.name, value: r.members }))}
                colors={donutColors}
              />
            </div>

            {/* Top 5 */}
            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 sm:p-8">
              <h3 className="font-heading text-xl font-bold text-slate-900">ከፍተኛ 5 ክልሎች</h3>
              <p className="mb-6 text-sm text-slate-500">በኮሚሽን አባላት ብዛት ከፍተኛ 5 ክልሎች</p>
              <div className="flex flex-col gap-5">
                {top5.map((r, i) => {
                  const pct = (r.members / totals.members) * 100;
                  const medal = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
                  return (
                    <div key={r.id} className="flex items-center gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
                        {medal}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-slate-900">{r.name}</span>
                          <span className="text-xs font-bold text-slate-400 tabular-nums">{formatNumber(r.members)}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: donutColors[i] }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right text-xs font-bold tabular-nums" style={{ color: donutColors[i] }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ═══ Full Data Table ═══ */}
        <section className="container-site mt-16 lg:mt-24">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              የኮሚሽኑ ዝርዝር ሰንጠረዥ
            </h2>
            <p className="mt-1 text-sm text-slate-500">ዝርዝር የክልል ማጠቃለያ</p>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-4 text-left font-bold text-slate-500 text-xs tracking-wider uppercase">ተ.ቁ</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-500 text-xs tracking-wider uppercase">ቅ/ጽ/ቤት</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">የክልል ኮሚሽን</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">የዞን ኮሚሽን</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">የወረዳ ኮሚሽን</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">የቀበሌ ኮሚሽን</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">የብልፅግና ህብረት</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ጠቅላላ ድምር</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((r, i) => (
                  <tr key={r.id} className={`border-b border-slate-50 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3.5 font-bold text-slate-400 tabular-nums">{r.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.officials)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.zones)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.woredas)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.kebeles)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.union)}</td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums" style={{ color: "#014BAA" }}>{formatNumber(r.members)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-4 py-4" />
                  <td className="px-4 py-4 font-bold text-slate-900">ጠቅላላ ድምር</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.officials)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.zones)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.woredas)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.kebeles)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.union)}</td>
                  <td className="px-4 py-4 text-right font-bold tabular-nums" style={{ color: "#014BAA" }}>{formatNumber(totals.members)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
