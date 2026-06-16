'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconMessageStar,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";

type RatingId = "excellent" | "very-good" | "good" | "bad" | "very-bad";

interface FeedbackItem {
  id: string;
  rating: RatingId;
  ratingLabel: string;
  review: string;
  date: string;
  page: string;
}

const RATING_LABELS: Record<RatingId, string> = {
  excellent: "በጣም ጥሩ",
  "very-good": "ጣም ጥሩ",
  good: "ጥሩ",
  bad: "መጥፎ",
  "very-bad": "በጣም መጥፎ",
};

const RATING_COLORS: Record<RatingId, string> = {
  excellent: "text-success bg-success/10",
  "very-good": "text-brand-blue bg-brand-blue/10",
  good: "text-brand-blue/80 bg-brand-blue/5",
  bad: "text-warning bg-warning/10",
  "very-bad": "text-danger bg-danger/10",
};

const mockFeedback: FeedbackItem[] = [
  {
    id: "FB-001",
    rating: "excellent",
    ratingLabel: RATING_LABELS.excellent,
    review: "አገልግሎቱ ግልጽና ወደ ጊዜው ነበር። ጥያቄዎቼ በጊዜው ተመለሱ።",
    date: "ሰኔ 14, 2026 · 10:32",
    page: "መነሻ",
  },
  {
    id: "FB-002",
    rating: "good",
    ratingLabel: RATING_LABELS.good,
    review: "ሰነዶችን ለማግኘት ቀላል ነው፣ ግን የፍለጋ ተግባሩ ትንሽ ሊሻሻል ይችላል።",
    date: "ሰኔ 13, 2026 · 15:18",
    page: "ሰነዶች",
  },
  {
    id: "FB-003",
    rating: "very-good",
    ratingLabel: RATING_LABELS["very-good"],
    review: "የኮሚሽኑ መረጃዎች በጣም ጠቃሚ ናቸው።",
    date: "ሰኔ 12, 2026 · 09:05",
    page: "መረጃ",
  },
  {
    id: "FB-004",
    rating: "bad",
    ratingLabel: RATING_LABELS.bad,
    review: "የስልክ መስመር ለረጅም ጊዜ ተያይዞ ነበር።",
    date: "ሰኔ 11, 2026 · 14:44",
    page: "ያግኙን",
  },
  {
    id: "FB-005",
    rating: "very-bad",
    ratingLabel: RATING_LABELS["very-bad"],
    review: "ጥቆማ ሲቀርብ ምላሽ አልተሰጠም።",
    date: "ሰኔ 10, 2026 · 11:20",
    page: "ጥቆማ",
  },
];

const ratingFilters: { id: RatingId | "all"; label: string }[] = [
  { id: "all", label: "ሁሉም" },
  { id: "excellent", label: RATING_LABELS.excellent },
  { id: "very-good", label: RATING_LABELS["very-good"] },
  { id: "good", label: RATING_LABELS.good },
  { id: "bad", label: RATING_LABELS.bad },
  { id: "very-bad", label: RATING_LABELS["very-bad"] },
];

function RatingStars({ rating }: { rating: RatingId }) {
  const positive = rating === "excellent" || rating === "very-good" || rating === "good";
  const count = rating === "excellent" ? 5 : rating === "very-good" ? 4 : rating === "good" ? 3 : rating === "bad" ? 2 : 1;

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

  const filtered =
    activeFilter === "all"
      ? mockFeedback
      : mockFeedback.filter((f) => f.rating === activeFilter);

  const counts = {
    all: mockFeedback.length,
    excellent: mockFeedback.filter((f) => f.rating === "excellent").length,
    "very-good": mockFeedback.filter((f) => f.rating === "very-good").length,
    good: mockFeedback.filter((f) => f.rating === "good").length,
    bad: mockFeedback.filter((f) => f.rating === "bad").length,
    "very-bad": mockFeedback.filter((f) => f.rating === "very-bad").length,
  };

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

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                {counts[filter.id]}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-text-muted">{item.id}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${RATING_COLORS[item.rating]}`}
                      >
                        {item.ratingLabel}
                      </span>
                      <RatingStars rating={item.rating} />
                      <span className="text-[11px] text-text-muted">{item.page}</span>
                    </div>
                    <p className="mt-3 text-sm text-text-primary leading-relaxed">{item.review}</p>
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0 whitespace-nowrap">{item.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
