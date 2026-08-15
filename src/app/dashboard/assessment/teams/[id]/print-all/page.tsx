'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer, ArrowLeft, Table, FileText, Layers, Download } from 'lucide-react';
import { PrintableReport } from '@/components/assessment/PrintableReport';
import { EvaluationSummaryReport, SummaryMemberRow } from '@/components/assessment/EvaluationSummaryReport';
import { AssessmentReportPDF } from '@/components/assessment/AssessmentReportPDF';
import { SummaryReportPDF } from '@/components/assessment/SummaryReportPDF';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';
import { downloadPDFDocument } from '@/lib/exportToPDF';
import Link from 'next/link';
import React from 'react';

export default function PrintAllPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const periodId = params.id as string;
  const singleUserId = searchParams.get('user');

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [period, setPeriod] = useState<any>(null);
  const [printMode, setPrintMode] = useState<'both' | 'summary' | 'detailed'>('both');

  useEffect(() => {
    async function fetchAllData() {
      try {
        const { data: periodData } = await supabase.from('assessment_periods').select('*').eq('id', periodId).single();
        setPeriod(periodData);

        let query = supabase.from('period_members').select('*, users(*, user_profiles(*))').eq('period_id', periodId);
        
        if (singleUserId) {
          query = query.eq('user_id', singleUserId);
        }
        
        const { data: members } = await query;
        
        const [selfRes, evalRes, apprRes] = await Promise.all([
          supabase.from('self_assessments').select('*').eq('period_id', periodId),
          supabase.from('evaluations').select('*, evaluator:users!evaluations_evaluator_id_fkey(full_name)').eq('period_id', periodId),
          supabase.from('approver_evaluations').select('*').eq('period_id', periodId),
        ]);

        const builtReports = members?.map(member => {
          const user = member.users;
          const profile = user?.user_profiles?.[0] || {};
          
          const selfData = selfRes.data?.find(s => s.user_id === member.user_id);
          const evals = evalRes.data?.filter(e => e.target_user_id === member.user_id) || [];
          
          // CALCULATIONS FOR 20%
          let peerTotalWeight = 0, peerTotalScore = 0;
          let evaluatorTotals = new Array(evals.length).fill(0);

          const peerRows = LEADERSHIP_EVALUATION_QUESTIONS_20.flatMap(category => 
            category.questions.map(q => {
              const w = q.weight;
              peerTotalWeight += w;
              
              let validScores = 0, sumScores = 0;
              const scores = evals.map((ev, idx) => {
                const s = ev.responses?.[q.question_id];
                if (s !== undefined && s !== null) {
                  evaluatorTotals[idx] += s * w;
                  validScores++;
                  sumScores += s;
                  return s;
                }
                return '-';
              });

              const avgRaw = validScores > 0 ? sumScores / validScores : 0;
              const score = avgRaw * w;
              peerTotalScore += score;

              return { id: q.question_id, criteria: q.criteria, weight: w, scores, avgRaw: avgRaw.toFixed(2), score: score.toFixed(2) };
            })
          );
          const peer20 = peerTotalScore / 5;

          // CALCULATIONS FOR 10%
          let selfTotalWeight = 0, selfTotalScore = 0;
          const selfRows = SELF_ASSESSMENT_QUESTIONS.flatMap(category => 
            category.questions.map(q => {
              const w = q.weight;
              selfTotalWeight += w;
              const sRaw = selfData?.responses?.[q.question_id];
              const score = sRaw ? sRaw * w : 0;
              selfTotalScore += score;
              return { id: q.question_id, criteria: q.criteria, weight: w, raw: sRaw || '-', score: score.toFixed(2) };
            })
          );
          const self10 = selfTotalScore / 10;
          
          const apprData = apprRes.data?.find(a => a.target_user_id === member.user_id);
          const appr70 = Number(apprData?.score_70 || 0);
          const sum30 = peer20 + self10;
          const final100 = sum30 + appr70;

          const getGrade = (s: number) => {
            if (s > 95) return 'በጣም ከፍተኛ';
            if (s >= 85) return 'ከፍተኛ';
            if (s >= 65) return 'መካከለኛ';
            if (s >= 50) return 'ዝቅተኛ';
            return 'በጣም ዝቅተኛ';
          };

          return {
            user, profile, period: periodData,
            evaluators: evals,
            peerRows, peerTotalWeight, evaluatorTotals, peerTotalScore, peer20,
            selfRows, selfTotalWeight, self10,
            sum30, appr70, final100, grade: getGrade(final100)
          };
        });

        setReportsData(builtReports || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [periodId, singleUserId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const summaryRows: SummaryMemberRow[] = reportsData.map(r => ({
    userId: r.user.id,
    name: r.user.full_name || 'ያልታወቀ',
    institution: r.profile.institution || '-',
    responsibilityGov: r.profile.current_responsibility_gov || '-',
    responsibilityCom: r.profile.current_responsibility_com || '-',
    s10: r.self10,
    s20: r.peer20,
    s70: r.appr70,
    f100: r.final100,
    grade: r.grade
  }));

  const periodName = period?.name || 'Assessment';
  const safePeriodName = periodName.replace(/\s+/g, '_');

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      if (printMode === 'summary') {
        // Download summary table as real PDF
        const docEl = React.createElement(SummaryReportPDF, {
          periodName: period?.name,
          members: summaryRows,
        });
        await downloadPDFDocument(docEl, `${safePeriodName}_Summary.pdf`);
      } else if (printMode === 'detailed' && reportsData.length === 1) {
        // Single user detail
        const r = reportsData[0];
        const docEl = React.createElement(AssessmentReportPDF, {
          user: r.user,
          profile: r.profile,
          period: r.period,
          evaluators: r.evaluators,
          peerRows: r.peerRows,
          peerTotalWeight: r.peerTotalWeight,
          evaluatorTotals: r.evaluatorTotals,
          peerTotalScore: r.peerTotalScore,
          peer20: r.peer20,
          selfRows: r.selfRows,
          selfTotalWeight: r.selfTotalWeight,
          self10: r.self10,
          sum30: r.sum30,
          appr70: r.appr70,
          final100: r.final100,
          grade: r.grade,
        });
        await downloadPDFDocument(docEl, `${r.user?.full_name?.replace(/\s+/g, '_') || 'Report'}.pdf`);
      } else {
        // Default: download summary PDF (best for multiple members)
        const docEl = React.createElement(SummaryReportPDF, {
          periodName: period?.name,
          members: summaryRows,
        });
        await downloadPDFDocument(docEl, `${safePeriodName}_Summary.pdf`);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top Action Bar */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-md p-4 flex flex-col sm:flex-row justify-between items-center z-50 gap-4">
        <Link 
          href={`/dashboard/assessment/teams/${periodId}`} 
          className="flex items-center text-text-secondary hover:text-brand-blue transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> ተመለስ (Back)
        </Link>

        {/* Print Filter Controls */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
          <button
            onClick={() => setPrintMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              printMode === 'summary' ? 'bg-white text-brand-blue shadow-sm font-bold' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> ማጠቃለያ ብቻ (Summary Only)
          </button>
          <button
            onClick={() => setPrintMode('detailed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              printMode === 'detailed' ? 'bg-white text-brand-blue shadow-sm font-bold' : 'text-gray-600 hover:text-black'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> ነጠላ ሪፖርቶች ብቻ (Detailed Only)
          </button>
          <button
            onClick={() => setPrintMode('both')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              printMode === 'both' ? 'bg-white text-brand-blue shadow-sm font-bold' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> ሁሉንም (Both)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-blue/90 shadow-sm text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? 'ፒዲኤፍ በመዘጋጀት ላይ...' : 'PDF አውርድ (Export PDF)'}
          </button>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-text-primary border border-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 shadow-sm text-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" /> ማተሚያ (Print)
          </button>
        </div>
      </div>
      
      {/* Printable Body Content */}
      <div id="printable-content" className="print:m-0 print:p-0 pt-24 sm:pt-28 pb-12 space-y-12 print:space-y-0">
        
        {/* SECTION 1: Evaluation Summary Table */}
        {(printMode === 'both' || printMode === 'summary') && (
          <div className={printMode === 'both' ? 'print:break-after-page mb-12 print:mb-0' : ''}>
            <EvaluationSummaryReport 
              periodName={period?.name} 
              members={summaryRows} 
            />
          </div>
        )}

        {/* SECTION 2: Individual Detailed Reports */}
        {(printMode === 'both' || printMode === 'detailed') && (
          reportsData.map((reportData, idx) => (
            <div 
              key={reportData.user.id} 
              className={idx < reportsData.length - 1 ? "mb-16 print:mb-0 print:break-after-page" : ""}
            >
              <PrintableReport data={reportData} {...reportData} />
            </div>
          ))
        )}

      </div>
    </div>
  );
}
