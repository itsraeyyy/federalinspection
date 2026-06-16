"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RATINGS = [
  { id: "excellent", label: "በጣም ጥሩ" },
  { id: "very-good", label: "ጣም ጥሩ" },
  { id: "good", label: "ጥሩ" },
  { id: "bad", label: "መጥፎ" },
  { id: "very-bad", label: "በጣም መጥፎ" },
] as const;

type RatingId = (typeof RATINGS)[number]["id"];

export function CommissionReviewPopup() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<RatingId | null>(null);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const selectedRating = RATINGS.find((r) => r.id === rating);

  function handleClose() {
    setOpen(false);
    setRating(null);
    setReview("");
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!review.trim() || !rating) return;
    setSubmitted(true);
  }

  function handleReset() {
    setRating(null);
    setReview("");
    setSubmitted(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
        style={{ backgroundColor: "#014BAA" }}
        aria-label="ግምገማ ይስጡ"
      >
        <MessageSquarePlus className="size-4" />
        ግምገማ ይስጡ
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-5 right-5 z-40 w-[min(100vw-2.5rem,20rem)] animate-in fade-in slide-in-from-bottom-2 duration-300"
      aria-label="ስለ ኮሚሽኑ ግምገማ ይስጡ"
    >
      <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">ግምገማ ይስጡ</p>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="ግምገማ ዝጋ"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">አመሰግናለሁ!</p>
            <p className="text-xs leading-relaxed text-slate-500">
              ግምገማዎ ({selectedRating?.label}) ተቀብሏል። ለግብረመልስዎ እናመሰግናለን።
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              ሌላ ግምገማ ይስጡ
            </button>
          </div>
        ) : !rating ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">አገልግሎታችንን እንዴት ይገምግማሉ?</p>
            <div className="flex flex-col gap-2" role="group" aria-label="ደረጃ መምረጥ">
              {RATINGS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRating(option.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors",
                    option.id === "excellent" || option.id === "very-good" || option.id === "good"
                      ? "border-slate-200 text-slate-700 hover:border-[#014BAA]/30 hover:bg-[#014BAA]/5 hover:text-[#014BAA]"
                      : "border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-[#014BAA]">{selectedRating?.label}</p>
              <button
                type="button"
                onClick={() => setRating(null)}
                className="shrink-0 text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                ቀይር
              </button>
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              placeholder="ግምገማዎን እዚህ ይጻፉ..."
              className="block w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#014BAA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#014BAA]"
              aria-label="ግምገማዎ"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!review.trim()}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "#014BAA" }}
              >
                አስገባ
              </button>
              <button
                type="button"
                onClick={() => setReview("")}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                አጽዳ
              </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}
