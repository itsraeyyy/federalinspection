"use client";

import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, Users, Building2, MapPin, Layers, TrendingUp, BarChart3, Network } from "lucide-react";
import { useState } from "react";

/* ─── Raw data from Section 5 ─── */

const summaryCards = [
  { label: "አጠቃላይ መዋቅር", labelEn: "Total Structure", value: 106174, icon: Layers, color: "#014BAA" },
  { label: "የኮሚሽን አባላት", labelEn: "Commission Members", value: 531894, icon: Users, color: "#FFB800" },
  { label: "ኃላፊዎች", labelEn: "Responsible Persons", value: 2584, icon: Building2, color: "#10B981" },
  { label: "ቀበሌ", labelEn: "Kebeles", value: 16796, icon: MapPin, color: "#8B5CF6" },
];

const coverage = [
  { label: "ክልሎች", labelEn: "Regions", value: 14 },
  { label: "ዞኖች", labelEn: "Zones", value: 154 },
  { label: "ወረዳዎች", labelEn: "Woredas", value: 1348 },
];

interface RegionRow {
  id: number;
  name: string;
  regions: number;
  zones: number;
  woredas: number;
  kebeles: number;
  union: number;
  structure: number;
  members: number;
  officials: number;
}

const regionalData: RegionRow[] = [
  { id: 1,  name: "ኦሮሚያ",     regions: 1, zones: 44, woredas: 432, kebeles: 7342,  union: 38343, structure: 46162, members: 231928, officials: 931 },
  { id: 2,  name: "አማራ",      regions: 1, zones: 22, woredas: 266, kebeles: 2398,  union: 9029,  structure: 11716, members: 56473,  officials: 456 },
  { id: 3,  name: "ሶማሌ",      regions: 1, zones: 17, woredas: 95,  kebeles: 1064,  union: 9194,  structure: 10371, members: 52119,  officials: 210 },
  { id: 4,  name: "አፋር",      regions: 1, zones: 7,  woredas: 50,  kebeles: 497,   union: 4166,  structure: 4721,  members: 23740,  officials: 61  },
  { id: 5,  name: "ቤን-ጉሙዝ",   regions: 1, zones: 8,  woredas: 24,  kebeles: 546,   union: 692,   structure: 1271,  members: 6438,   officials: 35  },
  { id: 6,  name: "ጋምቤላ",     regions: 1, zones: 5,  woredas: 12,  kebeles: 264,   union: 200,   structure: 483,   members: 2474,   officials: 44  },
  { id: 7,  name: "ሐረሪ",      regions: 1, zones: 0,  woredas: 9,   kebeles: 36,    union: 249,   structure: 255,   members: 1502,   officials: 14  },
  { id: 8,  name: "ሲዳማ",      regions: 1, zones: 5,  woredas: 44,  kebeles: 568,   union: 3619,  structure: 4238,  members: 21313,  officials: 102 },
  { id: 9,  name: "ደ/ም/ኢ/ያ",   regions: 1, zones: 6,  woredas: 61,  kebeles: 906,   union: 2881,  structure: 3855,  members: 19493,  officials: 119 },
  { id: 10, name: "ደቡብ ኢ/ያ",  regions: 1, zones: 15, woredas: 111, kebeles: 1527,  union: 10295, structure: 11949, members: 60067,  officials: 255 },
  { id: 11, name: "ማዕ/ኢ/ያ",   regions: 1, zones: 10, woredas: 79,  kebeles: 1317,  union: 4602,  structure: 6010,  members: 30297,  officials: 179 },
  { id: 12, name: "አዲስ አበባ",  regions: 1, zones: 12, woredas: 136, kebeles: 0,     union: 4474,  structure: 4623,  members: 23353,  officials: 158 },
  { id: 13, name: "ድሬ ደዋ",    regions: 1, zones: 0,  woredas: 13,  kebeles: 331,   union: 331,   structure: 345,   members: 1731,   officials: 20  },
  { id: 14, name: "ፌዴራል ተአ.",  regions: 1, zones: 3,  woredas: 16,  kebeles: 0,     union: 157,   structure: 175,   members: 966,    officials: 0   },
];

const totals = {
  regions: 14, zones: 154, woredas: 1348, kebeles: 16796,
  union: 88232, structure: 106174, members: 531894, officials: 2584,
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
        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-600">
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
  const [activeMetric, setActiveMetric] = useState<"members" | "structure" | "kebeles">("members");

  const maxMembers = Math.max(...regionalData.map((r) => r.members));
  const maxStructure = Math.max(...regionalData.map((r) => r.structure));
  const maxKebeles = Math.max(...regionalData.map((r) => r.kebeles));

  const metricConfig = {
    members:   { max: maxMembers,   key: "members" as const,   label: "የኮሚሽን አባላት", color: "#014BAA" },
    structure: { max: maxStructure, key: "structure" as const, label: "አጠቃላይ መዋቅር",   color: "#FFB800" },
    kebeles:   { max: maxKebeles,   key: "kebeles" as const,   label: "ቀበሌ",           color: "#10B981" },
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
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              የኮሚሽኑ መዋቅር መረጃዎች — የክልሎች፣ ዞኖች፣ ወረዳዎች፣ ቀበሌዎች፣ አባላት እና ኃላፊዎች አጠቃላይ ማጠቃለያ
            </p>
          </div>
        </section>

        {/* ═══ Summary Cards ═══ */}
        <section className="container-site -mt-12 relative z-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* ═══ Coverage Strip ═══ */}
        <section className="container-site mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-50 px-6 py-5 ring-1 ring-slate-100">
            <Network className="size-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-500">የሽፋን፡</span>
            {coverage.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900 tabular-nums">{c.value}</span>
                <span className="text-sm text-slate-500">{c.label}</span>
                {i < coverage.length - 1 && <span className="ml-2 text-slate-200">|</span>}
              </span>
            ))}
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
              {(["members", "structure", "kebeles"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    activeMetric === m
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  {metricConfig[m].label}
                </button>
              ))}
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
              <h3 className="font-heading text-xl font-bold text-slate-900">የአባላት ስርጭት</h3>
              <p className="mb-6 text-sm text-slate-500">በክልል የአባላት ስርጭት</p>
              <DonutChart
                data={regionalData.map((r) => ({ label: r.name, value: r.members }))}
                colors={donutColors}
              />
            </div>

            {/* Top 5 */}
            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 sm:p-8">
              <h3 className="font-heading text-xl font-bold text-slate-900">ከፍተኛ 5 ክልሎች</h3>
              <p className="mb-6 text-sm text-slate-500">በአባላት ብዛት ከፍተኛ 5 ክልሎች</p>
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
                  <th className="px-5 py-4 text-left font-bold text-slate-500 text-xs tracking-wider uppercase">ተ.ቁ</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 text-xs tracking-wider uppercase">ቅ/ጽ/ቤት</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ዞን</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ወረዳ</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ቀበሌ</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ህብረት</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">መዋቅር</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">አባላት</th>
                  <th className="px-5 py-4 text-right font-bold text-slate-500 text-xs tracking-wider uppercase">ኃላፊዎች</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((r, i) => (
                  <tr key={r.id} className={`border-b border-slate-50 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="px-5 py-3.5 font-bold text-slate-400 tabular-nums">{r.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{r.name}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.zones)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.woredas)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.kebeles)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.union)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.structure)}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: "#014BAA" }}>{formatNumber(r.members)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{formatNumber(r.officials)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-5 py-4" />
                  <td className="px-5 py-4 font-bold text-slate-900">ጠቅላላ ድምር</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.zones)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.woredas)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.kebeles)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.union)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.structure)}</td>
                  <td className="px-5 py-4 text-right font-bold tabular-nums" style={{ color: "#014BAA" }}>{formatNumber(totals.members)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 tabular-nums">{formatNumber(totals.officials)}</td>
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
