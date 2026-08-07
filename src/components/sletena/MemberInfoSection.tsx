'use client';

import React from 'react';
import { MembershipLevel } from '@/types/sletena';
import { regionsData } from '@/lib/regions-data';
import { IconUserCheck, IconId, IconPhone, IconUser, IconBuildingStore, IconMapPin } from '@tabler/icons-react';

interface MemberInfoSectionProps {
  memberId: string;
  memberName: string;
  contact: string;
  membershipLevel: MembershipLevel;
  region: string;
  zone: string;
  woreda?: string;
  maxWoredas?: number;
  onChange: (fields: Partial<{
    memberId: string;
    memberName: string;
    contact: string;
    membershipLevel: MembershipLevel;
    region: string;
    zone: string;
    woreda: string;
  }>) => void;
}

const MEMBERSHIP_LEVEL_OPTIONS: { label: string; value: MembershipLevel }[] = [
  { label: 'አባል', value: 'Abal' },
  { label: 'የቤተሰብ/የሕብረት አመራር', value: 'Yebeteseb_Yehbret_Amerar' },
  { label: 'መካከለኛ አመራር', value: 'Mekakelegna_Amerar' },
  { label: 'ከፍተኛ አመራር', value: 'Keftegna_Amerar' },
];

export const MemberInfoSection: React.FC<MemberInfoSectionProps> = ({
  memberId,
  memberName,
  contact,
  membershipLevel,
  region,
  zone,
  woreda = '',
  maxWoredas = 14,
  onChange,
}) => {
  const availableZones = React.useMemo(() => {
    if (!region) return [];
    if (regionsData[region]) return regionsData[region];
    const foundKey = Object.keys(regionsData).find(
      (k) => k.startsWith(region) || region.startsWith(k)
    );
    return foundKey ? regionsData[foundKey] : [];
  }, [region]);

  const woredaOptions = React.useMemo(() => {
    const count = Math.max(1, Math.min(maxWoredas, 50));
    return Array.from({ length: count }, (_, i) => `ወረዳ ${(i + 1).toString().padStart(2, '0')}`);
  }, [maxWoredas]);

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <IconUserCheck className="text-brand-blue" size={20} />
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
          1. ጥሬ ሃቅ
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Member ID */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconId size={15} className="text-text-muted" /> የመለያ ቁጥር (Member ID)
          </label>
          <input
            type="text"
            placeholder="ምሳሌ: MEM-9021"
            value={memberId}
            onChange={(e) => onChange({ memberId: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconUser size={15} className="text-text-muted" /> ሙሉ ስም
          </label>
          <input
            type="text"
            placeholder="ምሳሌ: ዳዊት አበበ"
            value={memberName}
            onChange={(e) => onChange({ memberName: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconPhone size={15} className="text-text-muted" /> ስልክ ቁጥር
          </label>
          <input
            type="text"
            placeholder="ምሳሌ: 0911223344"
            value={contact}
            onChange={(e) => onChange({ contact: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Membership Level */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            የአባልነት / የሥራ ደረጃ
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

        {/* Region / City */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconBuildingStore size={15} className="text-text-muted" /> ክልል / ከተማ
          </label>
          <select
            value={region}
            onChange={(e) => {
              const newRegion = e.target.value;
              onChange({ region: newRegion, zone: '', woreda: '' });
            }}
            className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          >
            <option value="">-- ክልል/ከተማ ይምረጡ --</option>
            {Object.keys(regionsData).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Zone / Sub-city */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            {region === 'አዲስ አበባ' ? 'ክፍለ ከተማ' : 'ዞን / ክፍለ ከተማ'}
          </label>
          <select
            value={zone}
            disabled={!region}
            onChange={(e) => {
              const newZone = e.target.value;
              onChange({ zone: newZone, woreda: '' });
            }}
            className={`w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue ${
              !region ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">
              {!region
                ? '-- በቅድሚያ ክልል ይምረጡ --'
                : region === 'አዲስ አበባ'
                ? '-- ክፍለ ከተማ ይምረጡ --'
                : '-- ዞን ይምረጡ --'}
            </option>
            {availableZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Woreda */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
            <IconMapPin size={15} className="text-text-muted" /> ወረዳ
          </label>
          <select
            disabled={!zone}
            value={woreda}
            onChange={(e) => onChange({ woreda: e.target.value })}
            className={`w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue cursor-pointer ${
              !zone ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">
              {!zone ? '-- በቅድሚያ ዞን ይምረጡ --' : '-- ወረዳ ይምረጡ --'}
            </option>
            {woredaOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
