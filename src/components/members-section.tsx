"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { personnelService } from "@/services/personnel";
import { Personnel } from "@/types";
import { IconBrandFacebook, IconBrandX, IconBrandLinkedin, IconBrandWhatsapp } from "@tabler/icons-react";

// @BACKEND: This section reads from the personnel service.
// Members are grouped by office tab in a 1-row slidable carousel.

const OFFICE_TABS = [
  { id: 'commission-members', label: 'ኮሚሽን አባላት', labelEn: 'Commission Members' },
  { id: 'main', label: 'ኮሚሽን ዋና ጽ/ቤት', labelEn: 'Main Office' },
  { id: 'branch', label: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', labelEn: 'Branch Office' },
];

function MemberCard({ member }: { member: Personnel }) {
  const [imageError, setImageError] = useState(false);

  const rawPhoto = member.photo?.trim();
  const isValidUrl = Boolean(
    rawPhoto && 
    (rawPhoto.startsWith('/') || rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://'))
  );
  const showPhoto = isValidUrl && !imageError;

  return (
    <div className="w-full sm:w-[320px] md:w-[340px] shrink-0">
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white p-3 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.12)]">
        {/* Executive Photo Container with Standard 330px Height */}
        <div className="relative h-[310px] sm:h-[330px] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
          {showPhoto ? (
            <Image
              src={rawPhoto!}
              alt={member.nameAm || member.name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 340px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/80 p-6 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-slate-200/60">
                <User size={38} className="text-slate-400" />
              </div>
              <span className="mt-4 text-sm font-semibold text-slate-500 line-clamp-1">{member.nameAm || member.name}</span>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="flex flex-1 flex-col justify-between p-4 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-slate-900" title={member.nameAm || member.name}>
                  {member.nameAm || member.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 line-clamp-2">
                  {member.positionAm === 'ኮሚሽን ቅርንጫፍ ጽ/ቤት ኃላፊ' && member.region 
                    ? `የ ${member.region} ኮሚሽን ቅርንጫፍ ጽ/ቤት ኃላፊ` 
                    : member.positionAm}
                </p>
              </div>
              
              {/* Social Icons */}
              <div className="flex shrink-0 gap-1.5 pt-0.5">
                {member.facebook_url && (
                  <a 
                    href={member.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    aria-label={`${member.nameAm || member.name} Facebook Profile`}
                  >
                    <IconBrandFacebook size={18} />
                  </a>
                )}
                {member.x_url && (
                  <a 
                    href={member.x_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900"
                    aria-label={`${member.nameAm || member.name} X (Twitter) Profile`}
                  >
                    <IconBrandX size={18} />
                  </a>
                )}
                {member.linkedin_url && (
                  <a 
                    href={member.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    aria-label={`${member.nameAm || member.name} LinkedIn Profile`}
                  >
                    <IconBrandLinkedin size={18} />
                  </a>
                )}
                {member.whatsapp_url && (
                  <a 
                    href={member.whatsapp_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    aria-label={`${member.nameAm || member.name} WhatsApp`}
                  >
                    <IconBrandWhatsapp size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <svg className="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {member.officeCategoryAm}
          </p>
        </div>
      </div>
    </div>
  );
}

function getRegionRank(regionStr?: string): number {
  if (!regionStr) return 999;
  const str = regionStr.trim();
  
  if (str.includes('ኦሮሚያ') || str.toLowerCase().includes('oromia')) return 1;
  if (str.includes('አማራ') || str.toLowerCase().includes('amhara')) return 2;
  if (str.includes('ሱማሌ') || str.includes('ሶማሌ') || str.toLowerCase().includes('somali')) return 3;
  if (str.includes('አፋር') || str.toLowerCase().includes('afar')) return 4;
  if (str.includes('ቤን') || str.includes('ቤኒሻንጉል') || str.toLowerCase().includes('benishangul')) return 5;
  if (str.includes('ጋምቤላ') || str.toLowerCase().includes('gambella')) return 6;
  if (str.includes('ሐረሪ') || str.toLowerCase().includes('harari')) return 7;
  if (str.includes('ሲዳማ') || str.toLowerCase().includes('sidama')) return 8;
  if (str.includes('ደ/ም/ኢ/ያ') || str.includes('ምዕራብ') || str.toLowerCase().includes('south west')) return 9;
  if (str.includes('ደቡብ ኢ/ያ') || (str.includes('ደቡብ') && !str.includes('ምዕራብ')) || (str.toLowerCase().includes('south') && !str.toLowerCase().includes('west'))) return 10;
  if (str.includes('ማዕ/ኢ/ያ') || str.includes('ማዕከላዊ') || str.toLowerCase().includes('central')) return 11;
  if (str.includes('አዲስ አበባ') || str.toLowerCase().includes('addis')) return 12;
  if (str.includes('ድሬ') || str.toLowerCase().includes('dire')) return 13;
  if (str.includes('ፌዴራል') || str.toLowerCase().includes('federal')) return 14;

  return 999;
}

function getCommissionMemberRank(nameStr?: string): number {
  if (!nameStr) return 999;
  const str = nameStr.trim();

  if (str.includes('ደስታ ተስፋው') || str.includes('ደስታ')) return 1;
  if (str.includes('ያሲን ሀቢብ') || str.includes('ያሲን')) return 2;
  if (str.includes('ሀብታሙ ሲሳይ') || str.includes('ሀብታሙ')) return 3;
  if (str.includes('አብዱል ሃኪም') || str.includes('አብዱልሃኪም') || str.includes('አብዱል')) return 4;
  if (str.includes('ሀፍታይ') || str.includes('ሀፍታይ ገ/እግዚአብሔር')) return 5;
  if (str.includes('ቢንያም') || str.includes('ቢንያም መንገሻ')) return 6;
  if (str.includes('ሮዛ') || str.includes('ሮዛ ቢያ')) return 7;
  if (str.includes('ጀማል') || str.includes('ጀማል ከዲር')) return 8;
  if (str.includes('እሱባለው') || str.includes('እሱባለው መሠለ')) return 9;
  if (str.includes('ኦላዶ') || str.includes('ኦላዶ ኦሎ')) return 10;
  if (str.includes('ማርታ') || str.includes('ማርታ ሉዊጂ')) return 11;
  if (str.includes('መሐሙድ') || str.includes('መሐሙድ ዩሱፍ') || str.includes('መህሙድ')) return 12;
  if (str.includes('ቻም') || str.includes('ቻም ኡቦንግ')) return 13;
  if (str.includes('እመቤት') || str.includes('እመቤት ኢሳያስ')) return 14;

  return 999;
}

function getPositionRank(pos?: string): number {
  if (!pos) return 99;
  if (pos.includes('ዋና ኮሚሽነር')) return 1;
  if (pos.includes('ምክትል ኮሚሽነር')) return 2;
  if (pos.includes('ጸሃፊ') || pos.includes('ጽህፈት ቤት ሃላፊ')) return 3;
  if (pos.includes('ስራ አመራር')) return 4;
  if (pos.includes('ማኔጅመንት')) return 5;
  if (pos.includes('ቅርንጫፍ')) return 6;
  if (pos.includes('አባል')) return 7;
  return 10;
}

export function MembersSection() {
  const [activeTab, setActiveTab] = useState(OFFICE_TABS[0].id);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    personnelService.getPersonnel().then(data => {
      setPersonnel(data);
      setLoading(false);
    });
  }, []);

  const activePersonnel = personnel.filter(p => p.status === 'Active');

  const currentOffice = activePersonnel
    .filter(p => {
      if (activeTab === 'main') return p.officeCategory === 'Main Office' || p.officeCategoryAm === 'ኮሚሽን ዋና ጽ/ቤት' || p.officeCategoryAm === 'ኮሚሽን ጽ/ቤት';
      if (activeTab === 'branch') return p.officeCategory === 'Branch Office' || p.officeCategoryAm === 'ኮሚሽን ቅርንጫፍ ጽ/ቤት';
      if (activeTab === 'commission-members') return p.officeCategory === 'Commission Members' || p.officeCategoryAm === 'ኮሚሽን አባላት';
      return false;
    })
    .sort((a, b) => {
      if (activeTab === 'branch') {
        const rankA = getRegionRank(a.region);
        const rankB = getRegionRank(b.region);
        if (rankA !== rankB) return rankA - rankB;
      }
      if (activeTab === 'commission-members') {
        const rankA = getCommissionMemberRank(a.nameAm || a.name);
        const rankB = getCommissionMemberRank(b.nameAm || b.name);
        if (rankA !== rankB) return rankA - rankB;
      }
      const posA = getPositionRank(a.positionAm || a.position);
      const posB = getPositionRank(b.positionAm || b.position);
      if (posA !== posB) return posA - posB;
      return 0;
    });

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [currentOffice, activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -350 : 350;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

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

          {/* Office Tabs + Slide Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="የኮሚሽን ቢሮዎች" className="flex flex-wrap items-center gap-2">
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

            {/* Slide Navigation Buttons */}
            {currentOffice.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous Slide"
                  className={`flex size-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-300 ${
                    canScrollLeft
                      ? "border-slate-200 text-slate-800 hover:bg-[#014BAA] hover:text-white hover:border-[#014BAA] cursor-pointer"
                      : "border-slate-100 text-slate-300 cursor-not-allowed opacity-40"
                  }`}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Next Slide"
                  className={`flex size-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-300 ${
                    canScrollRight
                      ? "border-slate-200 text-slate-800 hover:bg-[#014BAA] hover:text-white hover:border-[#014BAA] cursor-pointer"
                      : "border-slate-100 text-slate-300 cursor-not-allowed opacity-40"
                  }`}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Slidable 1-Row Members Container */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">በመጫን ላይ...</div>
        ) : currentOffice.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">ምንም አባላት አልተገኙም።</div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-stretch gap-6 overflow-x-auto scroll-smooth pb-8 pt-6 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentOffice.map((member) => (
              <div key={member.id} className="snap-start shrink-0">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
