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
      const printableTemplate = document.getElementById('pdf-printable-document-template');
      const element = printableTemplate || document.getElementById(elementId);
      if (!element) {
        console.error(`[PDF Export Error]: Element with ID "${elementId}" not found.`);
        return;
      }

      // Dynamically import html-to-image and jsPDF
      const { toPng } = await import('html-to-image');
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF;

      const safeTitle = reportTitle
        ? reportTitle.toLowerCase().replace(/[^a-z0-9_á-źä-ወ]+/gi, '_').replace(/_+/g, '_')
        : 'sletena_report';

      const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Convert DOM node to PNG data URL natively (handles Tailwind v4 oklab/oklch colors perfectly)
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF document (A4 Landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page handling if report is long
      while (heightLeft > 5) {
        pdf.addPage();
        position = position - pdfHeight;
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Save PDF file directly (no print dialog)
      pdf.save(filename);
    } catch (err) {
      console.error('[PDF Export Error]:', err);
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
