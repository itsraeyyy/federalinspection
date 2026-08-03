'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Download, FileText, CheckCircle2, ChevronDown, ChevronUp, History, Award } from 'lucide-react';
import { FinalRevealView } from './FinalRevealView';
import { downloadPDFDocument } from '@/lib/exportToPDF';
import { AllAssessmentsReportPDF } from './AllAssessmentsReportPDF';
import { AssessmentReportPDF } from './AssessmentReportPDF';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

interface PreviousAssessmentsViewProps {
  userId: string;
}

export function PreviousAssessmentsView({ userId }: PreviousAssessmentsViewProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [openPeriodId, setOpenPeriodId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingSingle, setDownloadingSingle] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [uRes, pRes, mRes] = await Promise.all([
          supabase.from('users').select('*, user_profiles(*)').eq('id', userId).single(),
          supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
          supabase.from('period_members').select('*, assessment_periods(*)').eq('user_id', userId).order('created_at', { ascending: false })
        ]);

        if (uRes.data) setUser(uRes.data);
        if (pRes.data) setProfile(pRes.data);

        const memberships = mRes.data || [];

        // Fetch scores for all periods
        const [selfRes, evalRes, apprRes, finalRes] = await Promise.all([
          supabase.from('self_assessments').select('*').eq('user_id', userId),
          supabase.from('evaluations').select('*, evaluator:users!evaluations_evaluator_id_fkey(full_name)').eq('target_user_id', userId),
          supabase.from('approver_evaluations').select('*, approver:users!approver_id(full_name)').eq('target_user_id', userId),
          supabase.from('final_scores').select('*').eq('user_id', userId)
        ]);

        const historyItems = memberships.map(m => {
          const pId = m.period_id;
          const periodObj = m.assessment_periods;
          const s10Data = selfRes.data?.find(s => s.period_id === pId);
          const evals = evalRes.data?.filter(e => e.period_id === pId) || [];
          const apprData = apprRes.data?.find(a => a.period_id === pId);
          const f100Data = finalRes.data?.find(f => f.period_id === pId);

          const avgEvalScore = evals.length > 0 
            ? evals.reduce((acc, curr) => acc + Number(curr.score_20), 0) / evals.length 
            : 0;

          const s10 = s10Data?.score_10 || 0;
          const s20 = Number(avgEvalScore.toFixed(1));
          const s70 = apprData?.score_70 || 0;
          const total = f100Data?.final_score_100 || Number((s10 + s20 + s70).toFixed(1));

          return {
            periodId: pId,
            periodName: periodObj?.name || 'የምዘና ጊዜ',
            status: periodObj?.status || 'active',
            role: m.role,
            s10,
            s20,
            s70,
            total,
            details: {
              self: s10Data,
              evals: evals,
              appr: apprData,
              user: uRes.data,
              period: periodObj
            }
          };
        });

        setHistory(historyItems);
      } catch (err) {
        console.error('Error loading previous assessments:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleDownloadAllPDF = async () => {
    if (history.length === 0) return;
    setDownloadingAll(true);
    try {
      const fileName = `${user?.full_name ? user.full_name.replace(/\s+/g, '_') : 'User'}_All_Assessments.pdf`;
      const docElement = (
        <AllAssessmentsReportPDF
          user={user}
          profile={profile}
          history={history}
        />
      );
      await downloadPDFDocument(docElement, fileName);
    } catch (err) {
      console.error('Error downloading all assessments PDF:', err);
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDownloadSinglePDF = async (item: any) => {
    const pId = item.periodId;
    setDownloadingSingle(prev => ({ ...prev, [pId]: true }));
    try {
      const { self, evals, appr, period } = item.details;
      const evaluators = evals || [];

      let peerTotalWeight = 0;
      let peerTotalScore = 0;
      let evaluatorTotals = new Array(evaluators.length).fill(0);

      const peerRows = LEADERSHIP_EVALUATION_QUESTIONS_20.flatMap(category => 
        category.questions.map(q => {
          const w = q.weight;
          peerTotalWeight += w;
          
          let validScores = 0;
          let sumScores = 0;
          const scores = evaluators.map((ev: any, idx: number) => {
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

          return {
            id: q.question_id,
            criteria: q.criteria,
            weight: w,
            scores,
            avgRaw: avgRaw.toFixed(2),
            score: score.toFixed(2)
          };
        })
      );

      const peer20 = peerTotalScore / 5;

      let selfTotalWeight = 0;
      let selfTotalScore = 0;

      const selfRows = SELF_ASSESSMENT_QUESTIONS.flatMap(category => 
        category.questions.map(q => {
          const w = q.weight;
          selfTotalWeight += w;
          
          const sRaw = self?.responses?.[q.question_id];
          const score = sRaw ? sRaw * w : 0;
          selfTotalScore += score;

          return {
            id: q.question_id,
            criteria: q.criteria,
            weight: w,
            raw: sRaw || '-',
            score: score.toFixed(2)
          };
        })
      );

      const self10 = selfTotalScore / 10;
      const appr70 = Number(appr?.score_70 || 0);
      const sum30 = peer20 + self10;
      const final100 = sum30 + appr70;

      const getGrade = (s: number) => {
        if (s >= 90) return 'በጣም ከፍተኛ';
        if (s >= 80) return 'ከፍተኛ';
        if (s >= 70) return 'መካከለኛ';
        return 'ዝቅተኛ';
      };

      const grade = getGrade(final100);
      const fileName = `${user?.full_name ? user.full_name.replace(/\s+/g, '_') : 'Assessment'}_${item.periodName.replace(/\s+/g, '_')}.pdf`;

      const docElement = (
        <AssessmentReportPDF
          user={user}
          profile={profile}
          period={period}
          evaluators={evaluators}
          peerRows={peerRows}
          peerTotalWeight={peerTotalWeight}
          evaluatorTotals={evaluatorTotals}
          peerTotalScore={peerTotalScore}
          peer20={peer20}
          selfRows={selfRows}
          selfTotalWeight={selfTotalWeight}
          self10={self10}
          sum30={sum30}
          appr70={appr70}
          final100={final100}
          grade={grade}
          data={{ details: item.details }}
        />
      );

      await downloadPDFDocument(docElement, fileName);
    } catch (err) {
      console.error('Error downloading single assessment PDF:', err);
    } finally {
      setDownloadingSingle(prev => ({ ...prev, [pId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-text-secondary mt-4 text-sm">የቀደሙ ምዘናዎችን በመጫን ላይ... (Loading previous assessments...)</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Header & Global Download Button */}
      <div className="premium-card p-6 border border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-primary rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 text-brand-blue shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">የቀደሙ የተጠናቀቁ ምዘናዎች (Completed Assessments)</h2>
            <p className="text-xs text-text-secondary">ያለፉት የምዘና ክፍለ-ጊዜዎች ውጤቶች እና ዝርዝር ሪፖርቶች</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleDownloadAllPDF}
            disabled={downloadingAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {downloadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{downloadingAll ? 'ፒዲኤፍ በማዘጋጀት ላይ...' : 'ሁሉንም ምዘናዎች በ PDF አውርድ (Download All PDF)'}</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="premium-card p-12 text-center text-text-muted bg-surface-primary rounded-3xl border border-border">
          <FileText className="w-12 h-12 mx-auto mb-3 text-text-muted/50" />
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">ምንም የቀደመ የምዘና ታሪክ አልተገኘም</h3>
          <p className="text-sm text-text-secondary">እስካሁን ምንም የተጠናቀቀ የቀደመ የምዘና ጊዜ አልተመዘገበም።</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const isOpen = openPeriodId === item.periodId;
            const isSingleDownloading = downloadingSingle[item.periodId];

            return (
              <div 
                key={item.periodId || index} 
                onClick={() => setOpenPeriodId(isOpen ? null : item.periodId)}
                className="premium-card overflow-hidden bg-surface-primary border border-border/80 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-lg">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-heading font-bold text-text-primary group-hover:text-brand-blue transition-colors">
                        {item.periodName}
                      </h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.status === 'finalized' ? 'bg-success/15 text-success border border-success/30' : 'bg-warning/15 text-warning border border-warning/30'
                      }`}>
                        {item.status === 'finalized' ? 'የተጠናቀቀ (Finalized)' : 'በሂደት ላይ (In Progress)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-surface-secondary/60 rounded-xl p-2.5 border border-border/50 text-center">
                        <span className="block text-[10px] text-text-muted font-semibold uppercase">የራስ (Self 10%)</span>
                        <span className="font-mono text-sm font-bold text-brand-blue">{Number(item.s10).toFixed(1)}</span>
                      </div>
                      <div className="bg-surface-secondary/60 rounded-xl p-2.5 border border-border/50 text-center">
                        <span className="block text-[10px] text-text-muted font-semibold uppercase">መዛኝ (Eval 20%)</span>
                        <span className="font-mono text-sm font-bold text-brand-blue">{Number(item.s20).toFixed(1)}</span>
                      </div>
                      <div className="bg-surface-secondary/60 rounded-xl p-2.5 border border-border/50 text-center">
                        <span className="block text-[10px] text-text-muted font-semibold uppercase">አጽዳቂ (Appr 70%)</span>
                        <span className="font-mono text-sm font-bold text-brand-yellow">{Number(item.s70).toFixed(1)}</span>
                      </div>
                      <div className="bg-brand-blue/10 rounded-xl p-2.5 border border-brand-blue/20 text-center">
                        <span className="block text-[10px] text-text-muted font-semibold uppercase">ድምር (Total 100%)</span>
                        <span className="font-mono text-sm font-bold text-text-primary">{Number(item.total).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadSinglePDF(item)}
                      disabled={isSingleDownloading}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface-secondary hover:bg-border text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isSingleDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-brand-blue" />}
                      <span>{isSingleDownloading ? 'በማውረድ ላይ...' : 'PDF አውርድ'}</span>
                    </button>

                    <button
                      onClick={() => setOpenPeriodId(isOpen ? null : item.periodId)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-blue/30 bg-brand-blue/5 hover:bg-brand-blue/10 text-brand-blue text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <span>{isOpen ? 'ዝርዝር ደብቅ' : 'ዝርዝር ሪፖርት ተመልከት'}</span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Report for this period */}
                {isOpen && (
                  <div className="p-6 border-t border-border bg-background/50 animate-in slide-in-from-top-2 duration-300">
                    <FinalRevealView data={{ details: item.details }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
