'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GapAnalyticsChart } from '@/components/sletena/GapAnalyticsChart';
import { NpsWidget } from '@/components/sletena/NpsWidget';
import { PdfExportButton } from '@/components/sletena/PdfExportButton';
import { TrainingProgressWidget } from '@/components/sletena/TrainingProgressWidget';
import { MOCK_SUBMISSIONS } from '@/data/sletenaDirectives';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { calculateNPS } from '@/lib/sletena/npsEngine';
import { IconFileAnalytics, IconTrendingUp, IconTarget, IconFlame, IconMessage2, IconChartBar } from '@tabler/icons-react';

import { SletenaSubmission } from '@/types/sletena';
import { sletenaService } from '@/services/sletena';
import { SletenaReportPdfTemplate } from '@/components/sletena/SletenaReportPdfTemplate';

export default function SletenaFullReportPage() {
  const [submissions, setSubmissions] = useState<SletenaSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const subs = await sletenaService.getNeedSubmissions();
        setSubmissions(subs);
      } catch (err) {
        console.error('Error fetching submissions for full report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute analytics dynamically via engines
  const gapAnalysisItems = calculateKnowledgeGaps(submissions);
  const npsData = calculateNPS(submissions);

  const highPriorityDirectives = gapAnalysisItems.filter((i) => i.priorityFlag === 'HIGH');

  return (
    <DashboardLayout>
      <div id="sletena-report-view" className="space-y-8 pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <IconFileAnalytics className="text-brand-blue" size={26} />
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                የስልጠና ፍላጎት እና የዕርካታ ሙሉ ሪፖርት
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              የብሔራዊ የፌደራል ፍተሻ ፖርታል የተሰበሰቡ የስልጠና ፍላጎቶች፣ የክፍተት ትንተና እና የድህረ-ስልጠና ዕርካታ ደረጃዎች አጠቃላይ ሪፖርት::
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <PdfExportButton
              elementId="sletena-report-view"
              reportTitle="የስልጠና_ፍላጎት_እና_ዕርካታ_ሙሉ_ሪፖርት"
            />
          </div>
        </div>

        {/* SECTION 1: EXECUTIVE KPI OVERVIEW */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-7 h-7 rounded-lg bg-brand-blue text-white text-xs font-black flex items-center justify-center shadow-xs">
              01
            </span>
            <h2 className="text-base font-extrabold text-text-primary">
              የአጠቃላይ አፈጻጸም እና የብቃት ማጠቃለያ (Executive KPI Summary)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Evaluated */}
            <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">ጠቅላላ የምዘና ተሳታፊዎች</span>
                <IconTrendingUp size={20} className="text-brand-blue" />
              </div>
              <div className="text-3xl font-black text-text-primary">{submissions.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">በሁሉም ክልሎች የተሰበሰቡ ቅጾች</div>
            </div>

            {/* Card 2: High Priority Needs */}
            <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">ከፍተኛ ቅድሚያ የሚሹ</span>
                <IconFlame size={20} className="text-rose-500" />
              </div>
              <div className="text-3xl font-black text-rose-600">{highPriorityDirectives.length} ርዕሶች</div>
              <div className="text-[11px] text-rose-600 font-medium">አስቸኳይ ስልጠና የሚያስፈልጋቸው</div>
            </div>

            {/* Card 3: Overall Competency Level */}
            <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">የአባላት የብቃት ደረጃ</span>
                <IconTarget size={20} className="text-amber-500" />
              </div>
              <div className="text-base font-extrabold text-amber-600">🟡 መካከለኛ ብቃት</div>
              <div className="text-[11px] text-text-muted">የስልጠና ማሻሻያ የሚፈልጉ ርዕሶች</div>
            </div>

            {/* Card 4: Net Promoter Score */}
            <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">የNPS ዕርካታ ደረጃ</span>
                <IconFileAnalytics size={20} className="text-brand-blue" />
              </div>
              <div className="text-3xl font-black text-brand-blue">
                {npsData.npsScore > 0 ? `+${npsData.npsScore}` : npsData.npsScore}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">{npsData.promotersPct}% የተደሰቱ አባላት</div>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRAINING STRATEGY OVERVIEW */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-7 h-7 rounded-lg bg-brand-blue text-white text-xs font-black flex items-center justify-center shadow-xs">
              02
            </span>
            <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <IconChartBar size={18} className="text-brand-blue" />
              የስልጠና ስትራቴጂ እና ልማት አፈፃፀም (Strategy and Development)
            </h2>
          </div>

          <TrainingProgressWidget gapItems={gapAnalysisItems} />
        </section>

        {/* SECTION 3: TRAINING NEEDS & COMPETENCY BREAKDOWN */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-7 h-7 rounded-lg bg-brand-blue text-white text-xs font-black flex items-center justify-center shadow-xs">
              03
            </span>
            <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <IconTarget size={18} className="text-brand-blue" />
              የስልጠና ፍላጎቶች እና የብቃት ደረጃዎች ትንተና (Training Needs & Competency Breakdown)
            </h2>
          </div>

          <GapAnalyticsChart gapItems={gapAnalysisItems} />
        </section>

        {/* SECTION 4: TRAINING SATISFACTION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-7 h-7 rounded-lg bg-brand-blue text-white text-xs font-black flex items-center justify-center shadow-xs">
              04
            </span>
            <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <IconMessage2 size={18} className="text-brand-blue" />
              የስልጠና ዕርካታ (Training Satisfaction)
            </h2>
          </div>

          <NpsWidget nps={npsData} />
        </section>

        {/* Hidden Official PDF Document Template for Clean Printing */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
          <SletenaReportPdfTemplate
            needSubmissions={submissions}
            satisfactionSubmissions={[]}
            reportTitle="የስልጠና ፍላጎት እና የዕርካታ ሙሉ ሪፖርት"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
