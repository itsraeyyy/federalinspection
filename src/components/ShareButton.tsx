'use client';

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            url: window.location.href,
          });
          return;
        } catch (e) {
          // Fallback to clipboard if user cancelled native share
        }
      }
      
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/80 transition-all hover:bg-[#014BAA] hover:text-white hover:ring-[#014BAA]"
        aria-label="ያጋሩ"
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
        <span>{copied ? 'ሊንኩ ተቀድቷል!' : 'ያጋሩ'}</span>
      </button>

      {copied && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white shadow-md animate-in fade-in">
          ተቀድቷል!
        </span>
      )}
    </div>
  );
}
