"use client";

import { Users, Landmark, MapPin, Building2, Home, Briefcase, Share2, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const leftSteps = [
  { label: "የብልፅግና ኮሚሽን", icon: Landmark },
  { label: "የክልል/ከተማ/ፌተአ ኮሚሽን", icon: Landmark },
  { label: "የዞን/ልዩ ወረዳ/ከተማ ኮሚሽን", icon: Landmark },
  { label: "የወረዳ/ከተማ ኮሚሽን", icon: Landmark },
  { label: "የቀበሌ ኮሚሽን", icon: Landmark },
];

const rightSteps = [
  { label: "የኮሚሽኑ ዋና ጽ/ቤት", icon: Landmark },
  { label: "የክልል/ከተማ ቅርንጫፍ ጽ/ቤት", icon: Landmark },
  { label: "የዞን/ልዩ ወረዳ/ከተማ ቅ/ጽ/ቤት", icon: Landmark },
  { label: "የወረዳ/ከተማ ቅርንጫፍ ጽ/ቤት", icon: Landmark },
  { label: "የቀበሌ ቅርንጫፍ ጽ/ቤት", icon: Landmark },
];

function ArrowDown() {
  return (
    <div className="flex justify-center py-2">
      <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
        <path d="M6 0V18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M1 14L6 22L11 14" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function LineConnector() {
  return (
    <div className="flex justify-center py-2">
      <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
        <path d="M6 0V24" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StepCard({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#014BAA]/15 bg-[#014BAA]/[0.03] px-6 py-4 shadow-sm w-full">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#014BAA] text-white">
        <Icon className="size-5" />
      </div>
      <span className="text-sm font-semibold text-slate-700 leading-snug">{label}</span>
    </div>
  );
}

function OrgBox({ icon: Icon, label, variant }: { icon: LucideIcon; label: string; variant: "top" | "bottom" }) {
  const bg = variant === "top"
    ? "bg-gradient-to-r from-[#014BAA] to-[#0263e0]"
    : "bg-gradient-to-r from-[#0D9488] to-[#14B8A6]";

  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl ${bg} px-8 py-4 text-white shadow-lg`}>
      <Icon className="size-6" />
      <span className="font-bold text-lg">{label}</span>
    </div>
  );
}

export function InstitutionalWorkflow() {
  return (
    <section className="py-10">
      {/* Top box - aligned with left column */}
      <div className="grid grid-cols-[1fr_48px_1fr] max-w-4xl mx-auto mb-0">
        <div className="flex justify-center">
          <OrgBox icon={Users} label="የብልፅግና ህብረት ጉባዔ" variant="top" />
        </div>
        <div /><div />
      </div>

      {/* Arrow from top box to first row */}
      <div className="grid grid-cols-[1fr_48px_1fr] max-w-4xl mx-auto">
        <div className="flex justify-center"><ArrowDown /></div>
        <div /><div />
      </div>

      {/* Chart rows */}
      <div className="max-w-4xl mx-auto">
        {leftSteps.map((left, i) => (
          <div key={i}>
            {/* Card row */}
            <div className="grid grid-cols-[1fr_48px_1fr] items-center">
              <div className="flex justify-end">
                <StepCard label={left.label} icon={left.icon} />
              </div>
              <div className="flex justify-center">
                <div className="w-full h-px bg-slate-300" />
              </div>
              <div className="flex justify-start">
                <StepCard label={rightSteps[i].label} icon={rightSteps[i].icon} />
              </div>
            </div>

            {/* Arrow row - left arrow */}
            {i < leftSteps.length - 1 && (
              <div className="grid grid-cols-[1fr_48px_1fr]">
                <div className="flex justify-center">{(i === 1 || i === 2 || i === 3) ? <LineConnector /> : <ArrowDown />}</div>
                <div />
                <div className="flex justify-center"><ArrowDown /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrow from last left card to bottom box */}
      <div className="grid grid-cols-[1fr_48px_1fr] max-w-4xl mx-auto">
        <div className="flex justify-center"><ArrowDown /></div>
        <div /><div />
      </div>

      {/* Bottom box - aligned with left column */}
      <div className="grid grid-cols-[1fr_48px_1fr] max-w-4xl mx-auto">
        <div className="flex justify-center">
          <OrgBox icon={HeartHandshake} label="የብልፅግና ህብረት ኮሚሽን" variant="bottom" />
        </div>
        <div /><div />
      </div>
    </section>
  );
}
