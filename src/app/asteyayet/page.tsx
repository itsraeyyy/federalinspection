"use client";

import { useState } from "react";
import Link from "next/link";
import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { submitFeedback } from "@/app/actions/feedback";
import { IconStar, IconStarFilled, IconMessageCircle, IconCheck, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { regionsData } from "@/lib/regions-data";

type RatingId = "excellent" | "very-good" | "good" | "needs-improvement";

const RATING_OPTIONS: { id: RatingId; label: string; icon: React.ReactNode }[] = [
  { id: "excellent", label: "እጅግ በጣም ጥሩ", icon: <div className="flex"><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/></div> },
  { id: "very-good", label: "በጣም ጥሩ", icon: <div className="flex"><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStar size={20}/></div> },
  { id: "good", label: "ጥሩ", icon: <div className="flex"><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStar size={20}/><IconStar size={20}/></div> },
  { id: "needs-improvement", label: "መስተካከል አለበት (*)", icon: <div className="flex"><IconStarFilled size={20}/><IconStarFilled size={20}/><IconStar size={20}/><IconStar size={20}/><IconStar size={20}/></div> },
];

const CATEGORIES = [
  "የፖርቲ የፖለቲካዊ ጤንነት መጠበቁን ከማረጋገጥ አኳያ",
  "የፖርቲ አባላት መብቶች መከበርን ከማረጋገጥ አኳያ",
  "የፖርቲ ሀብቶች መጠበቃቸውን ከማረጋገጥ አኳያ",
  "የኮሚሽኑ ተቋማዊ አቅም ከማጠናከር አኳያ",
  "የአቤቱታ/ጥቆማ አፈታት ሂደት"
];

const REGIONS = [
  { label: "ኦሮሚያ", value: "ኦሮሚያ" },
  { label: "አማራ", value: "አማራ" },
  { label: "ሶማሌ", value: "ሶማሌ" },
  { label: "አፋር", value: "አፋር" },
  { label: "ቤን-ጉሙዝ", value: "ቤን-ጉሙዝ" },
  { label: "ጋምቤላ", value: "ጋምቤላ" },
  { label: "ሐረሪ", value: "ሐረሪ" },
  { label: "ሲዳማ", value: "ሲዳማ" },
  { label: "ደ/ም/ኢ/ያ", value: "ደ/ም/ኢ/ያ" },
  { label: "ደቡብ ኢ/ያ", value: "ደቡብ ኢ/ያ" },
  { label: "ማዕ/ኢ/ያ", value: "ማዕ/ኢ/ያ" },
  { label: "አዲስ አበባ", value: "አዲስ አበባ" },
  { label: "ድሬዳዋ", value: "ድሬዳዋ" },
  { label: "ፌዴራል ተቋማት", value: "ፌዴራል ተቋማት" }
];

const getZonesForRegion = (reg: string): string[] => {
  if (!reg) return [];
  if (regionsData[reg]) return regionsData[reg];
  const foundKey = Object.keys(regionsData).find(
    k => k.includes(reg) || reg.includes(k.replace(' ክልል', '').replace(' ሕዝቦች', ''))
  );
  return foundKey ? regionsData[foundKey] : [];
};

export default function AsteyayetPage() {
  const [rating, setRating] = useState<RatingId | null>(null);
  const [category, setCategory] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError("እባክዎ አስተያየትዎ የሚያተኩርበትን ጉዳይ ይምረጡ");
      return;
    }
    if (!region) {
      setError("እባክዎ ቅርንጫፍ ጽ/ቤት ይምረጡ");
      return;
    }
    if (!zone) {
      setError(region === 'አዲስ አበባ' ? "እባክዎ ክፍለ ከተማ ይምረጡ" : "እባክዎ ዞን ይምረጡ");
      return;
    }
    if (!rating) {
      setError("እባክዎ የደረጃ አሰጣጥ ይምረጡ");
      return;
    }
    if (!review.trim()) {
      setError("እባክዎ አስተያየትዎን ያስገቡ");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await submitFeedback(category, rating, review, region, zone);
      setIsSuccess(true);
      setRating(null);
      setCategory("");
      setRegion("");
      setZone("");
      setReview("");
    } catch (err: any) {
      const errorMessage = err?.message || "አስተያየትዎን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <section className="container-site relative z-10 flex flex-col items-center py-10">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#014BAA]/10 mb-6">
                <IconMessageCircle className="size-8 text-[#014BAA]" />
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                አስተያየት <span style={{ color: "#FFB800" }}>መስጫ</span>
              </h1>
              <p className="mt-4 text-base text-slate-600">
                የእርስዎ አስተያየት ለኛ በጣም አስፈላጊ ነው። እባክዎ በተለያዩ ጉዳዮች ላይ ያለዎትን አስተያየት ያጋሩን።
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] ring-1 ring-slate-100">
              {isSuccess ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <IconCheck className="size-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">እናመሰግናለን!</h2>
                  <p className="text-slate-600 mb-8">አስተያየትዎ በተሳካ ሁኔታ ተልኳል። ለተሻለ አገልግሎት እንጠቀምበታለን።</p>
                  <Link
                    href="/"
                    className="inline-flex justify-center items-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    ወደ ዋናው ገጽ ተመለስ
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                      <IconAlertCircle className="size-5 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{error}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label htmlFor="category" className="block text-sm font-semibold text-slate-900">
                      አስተያየትዎ የሚያተኩርበት ጉዳይ <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors appearance-none cursor-pointer"
                      style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65em auto' }}
                    >
                      <option value="" disabled>የጉዳይ አይነት ይምረጡ</option>
                      {CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label htmlFor="region" className="block text-sm font-semibold text-slate-900">
                        ቅርንጫፍ ጽ/ቤት (ክልል) <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="region"
                        value={region}
                        onChange={(e) => {
                          setRegion(e.target.value);
                          setZone("");
                        }}
                        className="block w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors appearance-none cursor-pointer"
                        style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65em auto' }}
                      >
                        <option value="" disabled>ክልል ይምረጡ</option>
                        {REGIONS.map((reg, idx) => (
                            <option key={idx} value={reg.value}>
                              {reg.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="zone" className="block text-sm font-semibold text-slate-900">
                        {region === 'አዲስ አበባ' ? 'ክፍለ ከተማ' : 'ዞን'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="zone"
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        disabled={!region}
                        className="block w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65em auto' }}
                      >
                        <option value="" disabled>{region === 'አዲስ አበባ' ? 'ክፍለ ከተማ ይምረጡ' : 'ዞን ይምረጡ'}</option>
                        {getZonesForRegion(region).map((z, idx) => (
                          <option key={idx} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-900">
                      የደረጃ አሰጣጥ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {RATING_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRating(opt.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-1",
                            rating === opt.id
                              ? "border-[#014BAA] bg-blue-50 text-[#014BAA] shadow-sm ring-1 ring-[#014BAA]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={rating === opt.id ? "text-[#FFB800]" : "text-slate-400"}>
                            {opt.icon}
                          </div>
                          <span className="text-sm font-bold text-center">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="review" className="block text-sm font-semibold text-slate-900">
                      ተጨማሪ ማብራሪያ ወይም አስተያየት <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="review"
                      rows={6}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="ስለ መረጡት ጉዳይ ዝርዝር አስተያየትዎን እዚህ ይጻፉ..."
                      className="block w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#014BAA] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="size-5 animate-spin" />
                        በመላክ ላይ...
                      </>
                    ) : (
                      "አስተያየት ላክ"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
