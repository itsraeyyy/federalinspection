'use client';

import React, { useState } from 'react';
import { IconDownload, IconLoader2 } from '@tabler/icons-react';

interface PdfExportButtonProps {
  elementId?: string;
  reportTitle?: string;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  elementId = 'sletena-report-view',
  reportTitle = 'የስልጠና ፍላጎት እና ትንተና ሙሉ ሪፖርት',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPdf = async () => {
    setIsGenerating(true);
    try {
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        const element = document.getElementById(elementId);
        if (element) {
          const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          };
          await (window as any).html2pdf().set(opt).from(element).save();
        }
      } else {
        const originalTitle = document.title;
        document.title = reportTitle;
        window.print();
        document.title = originalTitle;
      }
    } catch (err) {
      console.error('[PDF Export Error]:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExportPdf}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
    >
      {isGenerating ? (
        <IconLoader2 size={16} className="animate-spin" />
      ) : (
        <IconDownload size={16} />
      )}
      <span>{isGenerating ? 'PDF ሪፖርት በመፍጠር ላይ...' : 'የPDF ሪፖርት አውርድ (Export PDF)'}</span>
    </button>
  );
};
