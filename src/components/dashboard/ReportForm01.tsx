"use client";

import { useState } from "react";
import { saveReportFormAction, submitReportAction } from "@/app/actions/reports";
import { ReportPeriod } from "@/lib/et-calendar";
import { IconDeviceFloppy, IconSend, IconLoader2, IconCheck } from "@tabler/icons-react";

export function ReportForm01({ 
  userId, 
  region, 
  year, 
  period, 
  existingData, 
  onSuccess 
}: { 
  userId: string, 
  region: string, 
  year: number, 
  period: ReportPeriod, 
  existingData?: any,
  onSuccess: () => void,
  isReadOnly?: boolean
}) {
  const [formData, setFormData] = useState<any>(existingData?.form_01 || {
    "ለክልል ተጠሪ የሆኑ ዞን/ከተማ/ልዩ ወረዳ": { "ብዛት": "", "ያዋቀሩ": "", "ያላዋቀሩ": "" },
    "ለዞን ተጠሪ የሆኑ ወረዳ/ከተማ": { "ብዛት": "", "ያዋቀሩ": "", "ያላዋቀሩ": "" },
    "ለወረዳ ተጠሪ የሆኑ ቀበሌዎች": { "ብዛት": "", "ያዋቀሩ": "", "ያላዋቀሩ": "" },
    "በብልፅግና ህብረት ደረጃ": { "ብዛት": "", "ያዋቀሩ": "", "ያላዋቀሩ": "" }
  });

  const [loading, setLoading] = useState<'save' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "ለክልል ተጠሪ የሆኑ ዞን/ከተማ/ልዩ ወረዳ",
    "ለዞን ተጠሪ የሆኑ ወረዳ/ከተማ",
    "ለወረዳ ተጠሪ የሆኑ ቀበሌዎች",
    "በብልፅግና ህብረት ደረጃ"
  ];

  const handleInputChange = (category: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const calculateTotals = () => {
    let totalCount = 0;
    let totalEstablished = 0;
    let totalNotEstablished = 0;

    categories.forEach(cat => {
      totalCount += Number(formData[cat]?.["ብዛት"]) || 0;
      totalEstablished += Number(formData[cat]?.["ያዋቀሩ"]) || 0;
      totalNotEstablished += Number(formData[cat]?.["ያላዋቀሩ"]) || 0;
    });

    const percentage = totalCount > 0 ? ((totalEstablished / totalCount) * 100).toFixed(2) : "0";

    return {
      "ጠቅላላ ድምር": { "ብዛት": totalCount.toString(), "ያዋቀሩ": totalEstablished.toString(), "ያላዋቀሩ": totalNotEstablished.toString() },
      "ያዋቀሩ%": percentage
    };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    setLoading('save');
    setError(null);
    const fullData = { ...existingData, form_01: { ...formData, ...totals } };
    const res = await saveReportFormAction(userId, region, year, period, fullData);
    if (res.error) setError(res.error);
    else alert("በተሳካ ሁኔታ ተቀምጧል! (Saved successfully)");
    setLoading(null);
  };

  const handleSubmit = async () => {
    if (!confirm("እርግጠኛ ነዎት ሪፖርቱን መላክ ይፈልጋሉ? አንዴ ከተላከ በኋላ ማስተካከል አይቻልም።")) return;
    
    setLoading('submit');
    setError(null);
    const fullData = { ...existingData, form_01: { ...formData, ...totals } };
    const res = await submitReportAction(userId, region, year, period, fullData);
    if (res.error) {
      setError(res.error);
      setLoading(null);
    } else {
      alert("በተሳካ ሁኔታ ተልኳል! (Submitted successfully)");
      onSuccess();
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-status-error/10 border border-status-error/20 text-status-error rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category, idx) => (
          <div key={idx} className="bg-surface-secondary border border-border-light rounded-xl overflow-hidden shadow-sm">
            <div className="bg-surface-secondary/80 border-b border-border-light p-4 font-semibold text-text-primary text-sm flex items-center gap-2">
              <span className="bg-brand-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">{idx + 1}</span>
              {category}
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">ብዛት</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData[category]?.["ብዛት"]} 
                  onChange={(e) => handleInputChange(category, "ብዛት", e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-surface-primary border border-border-light rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all ${isReadOnly ? 'opacity-90 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">ያዋቀሩ</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData[category]?.["ያዋቀሩ"]} 
                  onChange={(e) => handleInputChange(category, "ያዋቀሩ", e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-surface-primary border border-border-light rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all ${isReadOnly ? 'opacity-90 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">ያላዋቀሩ</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData[category]?.["ያላዋቀሩ"]} 
                  onChange={(e) => handleInputChange(category, "ያላዋቀሩ", e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-surface-primary border border-border-light rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all ${isReadOnly ? 'opacity-90 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-5">
        <h3 className="font-bold text-brand-blue mb-4 text-sm uppercase tracking-wider">ጠቅላላ ድምር (Total Summary)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border border-border-light shadow-sm text-center">
            <p className="text-xs text-text-secondary font-medium mb-1">ብዛት</p>
            <p className="text-xl font-bold text-text-primary">{totals["ጠቅላላ ድምር"]["ብዛት"]}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-light shadow-sm text-center">
            <p className="text-xs text-text-secondary font-medium mb-1">ያዋቀሩ</p>
            <p className="text-xl font-bold text-status-success">{totals["ጠቅላላ ድምር"]["ያዋቀሩ"]}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-light shadow-sm text-center">
            <p className="text-xs text-text-secondary font-medium mb-1">ያላዋቀሩ</p>
            <p className="text-xl font-bold text-status-warning">{totals["ጠቅላላ ድምር"]["ያላዋቀሩ"]}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-brand-blue/30 shadow-sm text-center">
            <p className="text-xs text-brand-blue/80 font-medium mb-1">ያዋቀሩ %</p>
            <p className="text-xl font-bold text-brand-blue">{totals["ያዋቀሩ%"]}%</p>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-light">
          <button
            onClick={handleSave}
            disabled={loading !== null}
            className="flex-1 px-4 py-3 bg-surface-secondary hover:bg-border-light text-text-secondary font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-border-medium shadow-sm"
          >
            {loading === 'save' ? <IconLoader2 size={20} className="animate-spin" /> : <IconDeviceFloppy size={20} />}
            በመሰራት ላይ አቆይ (Save Draft)
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading !== null}
            className="flex-1 px-4 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === 'submit' ? <IconLoader2 size={20} className="animate-spin" /> : <IconSend size={20} />}
            ወደ አድሚን ላክ (Submit Report)
          </button>
        </div>
      )}
    </div>
  );
}
