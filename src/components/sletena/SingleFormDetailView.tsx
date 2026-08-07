'use client';

import React, { useState } from 'react';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import { PdfExportButton } from './PdfExportButton';
import { NeedReportView } from './NeedReportView';
import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';
import {
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconFileAnalytics,
  IconInbox,
} from '@tabler/icons-react';

interface SingleFormDetailViewProps {
  category: TrainingCategory;
  submissions: SletenaSubmission[];
  onBack: () => void;
}

export const SingleFormDetailView: React.FC<SingleFormDetailViewProps> = ({
  category,
  submissions,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  // STRICTLY filter submissions for THIS specific category ONLY (No fallback to all submissions)
  const formSubmissions = submissions.filter((s) => s.categoryId === category.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(category.shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="single-form-detail-report-container" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-all cursor-pointer mt-1"
            title="ተመለስ ወደ ቅጾች ዝርዝር"
          >
            <IconArrowLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <IconFileAnalytics className="text-brand-blue" size={26} />
              <h2 className="text-xl font-black text-text-primary">{category.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                የቅጽ ዝርዝር ሪፖርት (Single Form Analytics)
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{category.description}</p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 bg-surface-secondary/70 p-2 rounded-xl border border-border/50 shrink-0">
            <span className="text-[11px] font-mono text-brand-blue truncate max-w-[180px]">
              {category.shareableLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-primary hover:bg-surface-secondary text-brand-blue text-xs font-bold shadow-2xs transition-all border border-border/40 cursor-pointer"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span>{copied ? 'ኮፒ ተደርጓል' : 'ሊንክ ኮፒ'}</span>
            </button>
          </div>

          <PdfExportButton
            elementId="single-form-detail-report-container"
            reportTitle={`የቅጽ_ሪፖርት_${category.title.replace(/\s+/g, '_')}`}
          />
        </div>
      </div>

      {/* Render Single Form Report or Empty State Card */}
      {formSubmissions.length === 0 ? (
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center">
            <IconInbox size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-text-primary">
              ለዚህ ቅጽ እስካሁን የተሞላ መረጃ የለም (No Submissions Recorded Yet)
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              ተሳታፊዎች የዚህን ቅጽ የሕዝብ ሊንክ ተጠቅመው መረጃ ሲሞሉ ሪፖርቱ እና ትንተናው በራስ-ሰር እዚህ ይታያል።
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconCopy size={16} />
            <span>የቅጹን መሙያ ሊንክ ኮፒ አድርግ</span>
          </button>
        </div>
      ) : (
        <NeedReportView
          submissions={formSubmissions}
          category={category}
          onBack={onBack}
          hideHeaderBanner={true}
        />
      )}

      {/* Hidden Printable PDF Document Template */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
        <SletenaReportPdfTemplate
          needSubmissions={formSubmissions}
          satisfactionSubmissions={[]}
          category={category}
          reportTitle={`የስልጠና ፍላጎት ሪፖርት - ${category.title}`}
        />
      </div>
    </div>
  );
};
