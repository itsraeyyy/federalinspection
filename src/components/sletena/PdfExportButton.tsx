'use client';

import React, { useState } from 'react';
import { IconDownload, IconLoader2 } from '@tabler/icons-react';

interface PdfExportButtonProps {
  elementId?: string;
  reportTitle?: string;
  filename?: string;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  elementId = 'sletena-report-view',
  reportTitle = 'የስልጠና ፍላጎት እና ትንተና ሙሉ ሪፖርት',
  filename,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPdf = async () => {
    setIsGenerating(true);
    try {
      // Prioritize dedicated printable PDF document template if present
      const element =
        document.getElementById('pdf-printable-document-template') ||
        document.getElementById(elementId) ||
        document.getElementById('need-report-container') ||
        document.getElementById('single-form-detail-report-container') ||
        document.getElementById('satisfaction-report-container');

      if (!element) {
        console.error(`[PDF Export Error]: Element with ID "${elementId}" not found.`);
        return;
      }

      // Dynamically import html-to-image and jsPDF
      const { toPng } = await import('html-to-image');
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF;

      // Construct clean, publication-ready filename preserving Amharic & English characters
      const rawTitle = filename || reportTitle || `Training Needs Form - ${new Date().toISOString().split('T')[0]}`;
      const sanitizedTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '').trim();
      const pdfFilename = sanitizedTitle.toLowerCase().endsWith('.pdf')
        ? sanitizedTitle
        : `${sanitizedTitle}.pdf`;

      // Filter out action buttons during capture
      const filterNode = (node: HTMLElement) => {
        if (node.tagName === 'BUTTON' && node.textContent?.includes('PDF')) {
          return false;
        }
        if (node.classList && node.classList.contains('pdf-export-hide')) {
          return false;
        }
        return true;
      };

      // Convert DOM node to PNG data URL natively
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          margin: '0',
          padding: '0',
          transform: 'none',
        },
        filter: filterNode as any,
      });

      // Determine orientation based on aspect ratio
      const imgProps = { width: element.scrollWidth, height: element.scrollHeight };
      const isPortrait = imgProps.height > imgProps.width;

      const pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Professional 10mm side margin & 8mm top/bottom margin for publication quality edge spacing
      const marginX = 10;
      const marginY = 8;
      const printableWidth = pdfWidth - marginX * 2; // 190mm
      const printableHeight = pdfHeight - marginY * 2; // 281mm

      // Check if document has dedicated page break containers
      const pageElements = element.querySelectorAll('.pdf-page');

      if (pageElements && pageElements.length > 0) {
        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i] as HTMLElement;
          const pageDataUrl = await toPng(pageEl, {
            quality: 0.98,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: '#ffffff',
            style: {
              margin: '0',
              padding: '0',
              transform: 'none',
            },
            filter: filterNode as any,
          });

          const pageImgWidth = pageEl.scrollWidth || 850;
          const pageImgHeight = pageEl.scrollHeight || 1100;
          const calcHeight = (pageImgHeight * printableWidth) / pageImgWidth;

          let drawWidth = printableWidth;
          let drawHeight = calcHeight;
          let posX = marginX;
          let posY = marginY;

          if (calcHeight > printableHeight) {
            drawHeight = printableHeight;
            drawWidth = (pageImgWidth * printableHeight) / pageImgHeight;
            posX = marginX + (printableWidth - drawWidth) / 2;
          }

          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(pageDataUrl, 'PNG', posX, posY, drawWidth, drawHeight);
        }
      } else {
        const imgHeight = (imgProps.height * printableWidth) / imgProps.width;
        let heightLeft = imgHeight;
        let position = marginY;

        pdf.addImage(dataUrl, 'PNG', marginX, position, printableWidth, imgHeight);
        heightLeft -= printableHeight;

        while (heightLeft > 5) {
          pdf.addPage();
          position = position - printableHeight;
          pdf.addImage(dataUrl, 'PNG', marginX, position, printableWidth, imgHeight);
          heightLeft -= printableHeight;
        }
      }

      // Save PDF file directly (downloads to user's computer)
      pdf.save(pdfFilename);
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
