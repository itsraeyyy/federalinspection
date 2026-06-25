"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { personnelService } from "@/services/personnel";
import { Personnel, COMMISSION_POSITIONS } from "@/types";

// @BACKEND: This section reads from the personnel service.
// Members are grouped by office tab, then by position row.
// Each position (ዋና ኮሚሽነር, etc.) gets its own horizontal row.

const OFFICE_TABS = [
  { id: 'main', label: 'ኮሚሽን ዋና ጽ/ቤት', labelEn: 'Main Office' },
  { id: 'branch', label: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', labelEn: 'Branch Office' },
  { id: 'commission-members', label: 'ኮሚሽን አባላት', labelEn: 'Commission Members' },
];

export function MembersSection() {
  const [activeTab, setActiveTab] = useState(OFFICE_TABS[0].id);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personnelService.getPersonnel().then(data => {
      setPersonnel(data);
      setLoading(false);
    });
  }, []);

  const currentOffice = personnel.filter(p => {
    if (activeTab === 'main') return p.officeCategory === 'Main Office';
    if (activeTab === 'branch') return p.officeCategory === 'Branch Office';
    if (activeTab === 'commission-members') return p.officeCategory === 'Commission Members';
    return false;
  });

  const groupedByPosition = COMMISSION_POSITIONS
    .map(pos => ({
      ...pos,
      members: currentOffice.filter(m => m.positionAm === pos.nameAm),
    }))
    .filter(group => group.members.length > 0);

  // Fallback for commission members tab if they don't have a matching position
  if (activeTab === 'commission-members' && groupedByPosition.length === 0 && currentOffice.length > 0) {
    groupedByPosition.push({
      id: 'member',
      nameAm: 'ኮሚሽን አባል',
      nameEn: 'Commission Member',
      members: currentOffice
    } as any);
  }

  return (
    <section
      id="members"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
      aria-labelledby="members-heading"
    >
      <div className="container-site relative z-10">
        {/* Header + Tabs */}
        <div className="flex flex-col gap-10">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              የኮሚሽኑ መዋቅር
            </p>
            <h2
              id="members-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              <span style={{ color: "#014BAA" }}>የአመራር </span>አካላት
            </h2>
            <div className="mt-5 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>

          {/* Office Tabs */}
          <div role="tablist" aria-label="የኮሚሽን ቢሮዎች" className="flex items-center gap-2">
            {OFFICE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? "#014BAA" : "white",
                    color: isActive ? "white" : "#64748b",
                    boxShadow: isActive ? "0 4px 16px rgba(1,75,170,0.25)" : "none",
                    border: isActive ? "2px solid #014BAA" : "2px solid #e2e8f0",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Position Rows */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">በመጫን ላይ...</div>
        ) : groupedByPosition.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">ምንም አባላት አልተገኙም።</div>
        ) : (
          <div className="flex flex-col gap-14 pb-8">
            {groupedByPosition.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mt-6 mb-4">
                  {group.nameAm}
                </h3>
                <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-0.5">
                  {group.members.map((member) => (
                    <div key={member.id} className="shrink-0 snap-start w-[85vw] sm:w-[360px] md:w-[400px]">
                      <div className="group overflow-hidden rounded-3xl bg-white p-2 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.10)]">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                          {member.photo ? (
                            <Image
                              src={member.photo}
                              alt={member.nameAm || member.name}
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 85vw, 400px"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <div className="flex size-20 items-center justify-center rounded-full bg-white/60 shadow-sm">
                                <span className="text-3xl font-bold text-slate-400">
                                  {member.nameAm?.charAt(0) || member.name.charAt(0)}
                                </span>
                              </div>
                              <span className="mt-3 text-sm font-medium text-slate-400">{member.nameAm || member.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex min-h-[120px] flex-col justify-between p-5 sm:p-6">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{member.nameAm || member.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{member.positionAm}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            {member.officeCategoryAm}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
