import React from 'react';

const activities = [
  { 
    id: '#8942', 
    date: '12/04/2026 16:22', 
    user: 'አበበ ብ.',
    type: 'ህትመት', 
    module: 'ዜና', 
    target: 'የሚዲያ መግለጫ',
    message: 'ስለ ዓመታዊው የኮሚሽን ስብሰባ የሚዲያ መግለጫ በዋናው መድረክ ታትሟል።' 
  },
  { 
    id: '#8941', 
    date: '11/04/2026 14:05', 
    user: 'ስርዓት',
    type: 'ማስገባ', 
    module: 'ሰነዶች', 
    target: 'Q3_Report.pdf',
    message: 'Q3_Report.pdf ሰነድ ከማዕከላዊ ቤተ-መጽሐፍት ተመሳስሏል። መጠኑ 4.2MB ነው።' 
  },
  { 
    id: '#8940', 
    date: '11/04/2026 10:15', 
    user: 'ቻላ ድ.',
    type: 'ማጽደቅ', 
    module: 'QR ጥያቄ', 
    target: 'መዳረሻ መለያ፡ 4912',
    message: 'ለቻላ ድ. የእንግዳ መዳረሻ ጥያቄ ለህንጻ አ፣ 3ኛ ፎቅ ጸድቷል።' 
  },
  { 
    id: '#8939', 
    date: '10/04/2026 09:30', 
    user: 'ያልታወቀ',
    type: 'ማስገባ', 
    module: 'ጥቆማ', 
    target: 'ቲኬት #492',
    message: 'ስለ 2ኛ ፎቅ ሽንት ቤት ጥገና የሚመለከት መጻሕፍት ተቀብሏል።' 
  },
];

export const RecentActivity = () => {
  return (
    <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md mb-8">
      <div className="p-8 pb-6 flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-xl font-light text-text-primary tracking-tight">የቅርብ ጊዜ እንቅስቃሴ</h2>
        </div>
        <button className="text-xs font-semibold text-text-primary bg-surface-secondary/50 hover:bg-surface-secondary px-5 py-2.5 rounded-full transition-colors border border-border/30">ሁሉንም ይመልከቱ</button>
      </div>
      
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
              <th className="font-semibold py-4 px-4 pl-6">መለያ እና ተጠቃሚ</th>
              <th className="font-semibold py-4 px-4">እርምጃ</th>
              <th className="font-semibold py-4 px-4">ዒላማ</th>
              <th className="font-semibold py-4 px-4 pr-6">ዝርዝር</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                <td className="py-5 px-4 pl-6 align-top w-40">
                  <div className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{activity.id}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.user}</div>
                </td>
                <td className="py-5 px-4 align-top w-40">
                  <div className="text-[11px] font-bold text-text-primary tracking-wider uppercase">{activity.type}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.module}</div>
                </td>
                <td className="py-5 px-4 align-top w-48">
                  <div className="text-sm font-medium text-text-secondary">{activity.target}</div>
                </td>
                <td className="py-5 px-4 pr-6 align-top">
                  <div className="text-sm text-text-muted group-hover:text-text-secondary transition-colors leading-relaxed">
                    {activity.message}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
