'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconMessageStar,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconStar,
  IconStarFilled,
  IconLoader2,
  IconTag
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { getFeedbacks } from "@/app/actions/feedback";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { formatECDateTime } from "@/lib/date-formatter";

type RatingId = "very-good" | "good" | "needs-improvement" | "excellent" | "bad" | "very-bad";

interface FeedbackItem {
  id: string;
  category?: string;
  rating: RatingId;
  review: string;
  sentiment: string;
  created_at: string;
}

const RATING_LABELS: Record<string, string> = {
  "excellent": "እጅግ በጣም ጥሩ",
  "very-good": "በጣም ጥሩ",
  "good": "ጥሩ",
  "needs-improvement": "መሻሻል የሚፈልግ",
  "bad": "መሻሻል የሚፈልግ",
  "very-bad": "መሻሻል የሚፈልግ",
};

const RATING_COLORS: Record<string, string> = {
  "very-good": "text-success bg-success/10",
  "good": "text-brand-blue/80 bg-brand-blue/5",
  "needs-improvement": "text-warning bg-warning/10",
  "excellent": "text-success bg-success/10",
  "bad": "text-warning bg-warning/10",
  "very-bad": "text-danger bg-danger/10",
};

const ratingFilters: { id: RatingId | "all"; label: string }[] = [
  { id: "all", label: "ሁሉም" },
  { id: "excellent", label: "እጅግ በጣም ጥሩ" },
  { id: "very-good", label: "በጣም ጥሩ" },
  { id: "good", label: "ጥሩ" },
  { id: "needs-improvement", label: "መሻሻል የሚፈልግ" },
];

function RatingStars({ rating }: { rating: string }) {
  const positive = ["excellent", "very-good", "good"].includes(rating);
  let count = 0;
  if (rating === "excellent" || rating === "very-good") count = 5;
  else if (rating === "good") count = 4;
  else if (rating === "needs-improvement" || rating === "bad") count = 2;
  else count = 1;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < count ? (
          <IconStarFilled key={i} size={12} className={positive ? "text-brand-yellow" : "text-danger/60"} />
        ) : (
          <IconStar key={i} size={12} className="text-text-muted/30" />
        )
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const [activeFilter, setActiveFilter] = useState<RatingId | "all">("all");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFeedbacks();
        setFeedbacks(data as FeedbackItem[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered =
    activeFilter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.rating === activeFilter);

  const counts = {
    all: feedbacks.length,
    excellent: feedbacks.filter((f) => f.rating === "excellent").length,
    "very-good": feedbacks.filter((f) => f.rating === "very-good").length,
    good: feedbacks.filter((f) => f.rating === "good").length,
    "needs-improvement": feedbacks.filter((f) => f.rating === "needs-improvement").length,
  };

  const barData = [
    { name: 'እጅግ በጣም ጥሩ', count: counts["excellent"] },
    { name: 'በጣም ጥሩ', count: counts["very-good"] },
    { name: 'ጥሩ', count: counts.good },
    { name: 'መሻሻል የሚፈልግ', count: counts["needs-improvement"] },
  ];

  // Calculate category data
  const categoryStats = feedbacks.reduce((acc, f) => {
    if (!f.category) return acc;
    const cat = f.category;
    if (!acc[cat]) {
        acc[cat] = { name: cat, positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    acc[cat].total += 1;
    if (f.sentiment === 'positive') acc[cat].positive += 1;
    else if (f.sentiment === 'negative') acc[cat].negative += 1;
    else acc[cat].neutral += 1;
    return acc;
  }, {} as Record<string, { name: string, positive: number, negative: number, neutral: number, total: number }>);

  const categoryData = Object.values(categoryStats)
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አስተያየት መቀበያ</h1>
            <p className="text-sm text-text-muted mt-1">
              ከድረ-ገጹ የሚቀበሉ የአገልግሎት ግምገማዎች እና አስተያየቶች።
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="ግምገማዎችን ይፈልጉ..."
                className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors"
              />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              <IconAdjustmentsHorizontal size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <IconLoader2 className="animate-spin text-brand-blue" size={32} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ratingFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all ${
                    activeFilter === filter.id
                      ? "border-brand-blue/30 bg-brand-blue/5 shadow-sm"
                      : "border-border/20 bg-surface-primary/30 hover:bg-surface-primary/50"
                  }`}
                >
                  <span className="text-2xl font-light text-text-primary tabular-nums">
                    {counts[filter.id as keyof typeof counts] || 0}
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted leading-tight">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Feedback list */}
            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-[2rem] border border-border/20 bg-surface-primary/20">
                  <IconMessageStar size={32} className="text-text-muted" stroke={1.5} />
                  <p className="text-sm text-text-muted">በዚህ ደረጃ ምንም አስተያየት የለም።</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-primary/30 border border-border/20 rounded-2xl p-5 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-text-muted truncate max-w-24">#{item.id.split('-')[0]}</span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${RATING_COLORS[item.rating]}`}
                            >
                              {RATING_LABELS[item.rating] || item.rating}
                            </span>
                            <RatingStars rating={item.rating} />
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              item.sentiment === 'positive' ? 'bg-success/10 text-success' :
                              item.sentiment === 'negative' ? 'bg-danger/10 text-danger' :
                              'bg-brand-blue/10 text-brand-blue'
                            }`}>
                              {item.sentiment === 'positive' ? 'አወንታዊ' : item.sentiment === 'negative' ? 'አሉታዊ' : 'መካከለኛ'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-text-muted shrink-0 whitespace-nowrap">
                          {formatECDateTime(item.created_at)}
                        </span>
                      </div>
                      
                      {item.category && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary bg-surface-secondary/50 p-2 rounded-lg w-fit">
                          <IconTag size={14} className="text-brand-blue" />
                          {item.category}
                        </div>
                      )}
                      
                      <p className="text-sm text-text-primary leading-relaxed border-l-2 border-border/30 pl-3">
                        {item.review}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Charts Section */}
            {feedbacks.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {/* Ratings Distribution */}
                <div className="p-5 border border-border/20 rounded-2xl bg-surface-primary/30 flex flex-col h-[320px]">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4">የግምገማ ስርጭት (Ratings Distribution)</h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                        <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                        <Tooltip cursor={{ fill: 'var(--surface-secondary)', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--surface-primary)' }} />
                        <Bar dataKey="count" fill="#014BAA" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Distribution Recharts Chart */}
                {categoryData.length > 0 && (
                  <div className="p-5 border border-border/20 rounded-2xl bg-surface-primary/30 flex flex-col h-[320px]">
                    <div className="flex flex-col mb-4">
                      <h3 className="text-sm font-semibold text-text-secondary">የአገልግሎት ዘርፍ ግምገማዎች (Service Category Ratings)</h3>
                    </div>
                    
                    <div className="flex-1 w-full min-h-0 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      <div style={{ height: Math.max(220, categoryData.length * 48) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={categoryData} 
                            layout="vertical" 
                            margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                            barGap={2}
                            barCategoryGap={12}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="var(--border)" strokeOpacity={0.4} />
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={140} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                            />
                            <Tooltip 
                              cursor={{ fill: 'var(--surface-secondary)', opacity: 0.5 }} 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                fontSize: '12px', 
                                border: '1px solid var(--border)', 
                                background: 'var(--surface-primary)', 
                                color: 'var(--text-primary)', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
                              iconType="circle"
                              iconSize={8}
                            />
                            <Bar dataKey="positive" name="ጥሩ (Positive)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                            <Bar dataKey="neutral" name="መካከለኛ (Neutral)" fill="#64748b" radius={[0, 4, 4, 0]} barSize={8} />
                            <Bar dataKey="negative" name="ውስንነት (Negative)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={8} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
