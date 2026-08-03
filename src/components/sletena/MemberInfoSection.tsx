'use client';

import React from 'react';
import { MembershipLevel } from '@/types/sletena';
import { IconUserCheck, IconId, IconPhone, IconUser, IconBuildingStore } from '@tabler/icons-react';

interface MemberInfoSectionProps {
  memberId: string;
  memberName: string;
  contact: string;
  membershipLevel: MembershipLevel;
  region: string;
  zone: string;
  onChange: (fields: Partial<{ memberId: string; memberName: string; contact: string; membershipLevel: MembershipLevel; region: string; zone: string }>) => void;
}

const MEMBERSHIP_LEVEL_OPTIONS: { label: string; value: MembershipLevel }[] = [
  { label: 'ደረጃ 1 - ጀማሪ ተቆጣጣሪ', value: 'Level_1' },
  { label: 'ደረጃ 2 - ረዳት ተቆጣጣሪ', value: 'Level_2' },
  { label: 'ደረጃ 3 - የመስክ ተቆጣጣሪ', value: 'Level_3' },
  { label: 'ደረጃ 4 - መሪ ተቆጣጣሪ', value: 'Level_4' },
  { label: 'ደረጃ 5 - ዋና ተቆጣጣሪ', value: 'Level_5' },
  { label: 'ታችኛ ሰራተኛ', value: 'Junior' },
  { label: 'ከፍተኛ ባለሙያ', value: 'Senior' },
  { label: 'ሥራ መሪ (አመራር)', value: 'Executive' },
];

const ETHIOPIAN_REGIONS = [
  'አዲስ አበባ',
  'ዓፋር',
  'አማራ',
  'ቤኒሻንጉል ጉሙዝ',
  'ድሬዳዋ',
  'ጋምቤላ',
  'ሐረሪ',
  'ኦሮሚያ',
  'ሲዳማ',
  'ሱማሌ',
  'ደቡብ ኢትዮጵያ',
  'ደቡብ ምዕራብ ኢትዮጵያ',
  'ትግራይ',
];

export const MemberInfoSection: React.FC<MemberInfoSectionProps> = ({
  memberId,
  memberName,
  contact,
  membershipLevel,
  region,
  zone,
  onChange,
}) => {
  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <IconUserCheck className="text-brand-blue" size={20} />
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
          1. አባል/ሰራተኛ መለያ እና የክልል መረጃ
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Member ID */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconId size={15} className="text-text-muted" /> የመለያ ቁጥር (Member ID) *
          </label>
          <input
            type="text"
            required
            placeholder="ምሳሌ: MEM-9021"
            value={memberId}
            onChange={(e) => onChange({ memberId: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconUser size={15} className="text-text-muted" /> ሙሉ ስም *
          </label>
          <input
            type="text"
            required
            placeholder="ምሳሌ: ዳዊት አበበ"
            value={memberName}
            onChange={(e) => onChange({ memberName: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Contact Email / Phone */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconPhone size={15} className="text-text-muted" /> ስልክ / ኢሜይል *
          </label>
          <input
            type="text"
            required
            placeholder="ምሳሌ: dawit.a@inspection.gov.et"
            value={contact}
            onChange={(e) => onChange({ contact: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Membership Level */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            የአባልነት / የሥራ ደረጃ *
          </label>
          <select
            value={membershipLevel}
            onChange={(e) => onChange({ membershipLevel: e.target.value as MembershipLevel })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          >
            {MEMBERSHIP_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconBuildingStore size={15} className="text-text-muted" /> ክልል / ከተማ አስተዳደር *
          </label>
          <select
            value={region}
            onChange={(e) => onChange({ region: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          >
            {ETHIOPIAN_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Zone */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">ዞን / ክፍለ ከተማ *</label>
          <input
            type="text"
            required
            placeholder="ምሳሌ: ዞን 01 / ምስራቅ ሸዋ"
            value={zone}
            onChange={(e) => onChange({ zone: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>
    </div>
  );
};
