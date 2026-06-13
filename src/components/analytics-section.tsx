import {
  Briefcase,
  ClipboardCheck,
  FileBarChart,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { metrics } from "@/lib/site-data";
import { SectionHeader } from "@/components/section-header";

const iconMap = {
  clipboard: ClipboardCheck,
  shield: ShieldCheck,
  file: FileBarChart,
  briefcase: Briefcase,
} as const;

const chartData = [
  { month: "Jan", value: 88 },
  { month: "Feb", value: 89 },
  { month: "Mar", value: 91 },
  { month: "Apr", value: 92 },
  { month: "May", value: 93 },
  { month: "Jun", value: 94.2 },
];

export function AnalyticsSection() {
  const maxValue = 100;

  return (
    <section
      id="analytics"
      className="section-padding bg-surface"
      aria-labelledby="analytics-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="analytics-heading"
          eyebrow="Performance"
          title="Analytics & Statistics"
          description="Key performance indicators reflecting our inspection activities and compliance outcomes."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = iconMap[metric.icon];
            return (
              <article
                key={metric.id}
                className="card-hover group relative overflow-hidden rounded-2xl bg-surface-elevated p-6 ring-1 ring-border/60 sm:p-7"
              >
                <div
                  className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-5 font-heading text-4xl tracking-tight text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mt-8 overflow-hidden rounded-2xl bg-surface-elevated p-6 ring-1 ring-border/60 sm:p-8 lg:p-10"
          role="img"
          aria-label="Compliance rate trend chart showing steady improvement from 88% to 94.2% over six months"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="size-4" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Trend Analysis
                </span>
              </div>
              <h3 className="mt-1 font-heading text-xl text-foreground">
                Compliance Rate — Last 6 Months
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              +6.2% improvement
            </div>
          </div>

          <div className="mt-10 flex h-48 items-end justify-between gap-3 sm:gap-5">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              const isLast = index === chartData.length - 1;
              return (
                <div
                  key={item.month}
                  className="group/bar flex flex-1 flex-col items-center gap-3"
                >
                  <span
                    className={`text-xs font-semibold tabular-nums ${isLast ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {item.value}%
                  </span>
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? "bg-primary" : "bg-primary/25 group-hover/bar:bg-primary/40"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
