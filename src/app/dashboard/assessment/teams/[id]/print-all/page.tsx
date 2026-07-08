'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { PrintableReport } from '@/components/assessment/PrintableReport';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';
import Link from 'next/link';

export default function PrintAllPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const periodId = params.id as string;
  const singleUserId = searchParams.get('user');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const { data: period } = await supabase.from('assessment_periods').select('*').eq('id', periodId).single();
        let query = supabase.from('period_members').select('*, users(*, user_profiles(*))').eq('period_id', periodId);
        
        if (singleUserId) {
          query = query.eq('user_id', singleUserId);
        }
        
        const { data: members } = await query;
        
        const [selfRes, evalRes, apprRes, finalRes] = await Promise.all([
          supabase.from('self_assessments').select('*').eq('period_id', periodId),
          supabase.from('evaluations').select('*, evaluator:users!evaluations_evaluator_id_fkey(full_name)').eq('period_id', periodId),
          supabase.from('approver_evaluations').select('*').eq('period_id', periodId),
          supabase.from('final_scores').select('*').eq('period_id', periodId)
        ]);

        const builtReports = members?.map(member => {
          const user = member.users;
          const profile = user?.user_profiles?.[0] || {};
          
          const selfData = selfRes.data?.find(s => s.user_id === member.user_id);
          const evals = evalRes.data?.filter(e => e.target_user_id === member.user_id) || [];
          
          // CALCULATIONS
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
            if (s >= 90) return 'በጣም ከፍተኛ';
            if (s >= 80) return 'ከፍተኛ';
            if (s >= 70) return 'መካከለኛ';
            return 'ዝቅተኛ';
          };

          return {
            user, profile, period,
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
  }, [periodId]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50">
        <Link href={`/dashboard/assessment/teams/${periodId}`} className="flex items-center text-text-secondary hover:text-brand-blue transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> ተመለስ (Back)
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-text-primary">
            ጠቅላላ ሪፖርቶች: {reportsData.length}
          </span>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-blue/90 shadow-sm"
          >
            <Printer className="w-5 h-5" /> ፒዲኤፍ አውርድ / Download PDF
          </button>
        </div>
      </div>
      
      <div className="print:m-0 print:p-0 pt-24 pb-12">
        {reportsData.map((reportData, idx) => (
          <div key={reportData.user.id} className={idx < reportsData.length - 1 ? "mb-16 print:mb-0 print:break-after-page" : ""}>
            <PrintableReport data={reportData} {...reportData} />
          </div>
        ))}
      </div>
    </div>
  );
}
