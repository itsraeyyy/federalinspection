'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SelfAssessmentView } from '@/components/assessment/SelfAssessmentView';
import { LeadershipEvaluationView } from '@/components/assessment/LeadershipEvaluationView';
import { ApproverDashboardView } from '@/components/assessment/ApproverDashboardView';
import { FinalRevealView } from '@/components/assessment/FinalRevealView';
import { UserProfileViewer } from '@/components/assessment/UserProfileViewer';
import { PreviousAssessmentsView } from '@/components/assessment/PreviousAssessmentsView';
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, History } from 'lucide-react';

export default function AssessmentModulePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [period, setPeriod] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [selfAssessment, setSelfAssessment] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<any>(null);
  
  // Evaluator / Approver state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchState() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        router.push('/assessment/login');
        return;
      }

      const needsPasswordChange = currentSession.user.user_metadata?.force_password_change || currentSession.user.user_metadata?.requires_password_change;
      if (needsPasswordChange) {
        router.push('/assessment/change-password');
        return;
      }
      
      setSession(currentSession);

      // 1. Get user's membership (latest active period)
      const { data: memberships, error: memErr } = await supabase
        .from('period_members')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log("Memberships query:", memberships, memErr);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const mem = memberships[0];

      // Fetch the period separately to avoid PostgREST RLS join issues
      const { data: periodData, error: periodErr } = await supabase
        .from('assessment_periods')
        .select('*')
        .eq('id', mem.period_id)
        .single();
        
      console.log("Period query:", periodData, periodErr);

      setMembership(mem);
      setPeriod(periodData);
      
      const activePeriod = periodData;

      // State 4: The Reveal (If finalized)
      if (activePeriod.status === 'finalized') {
        const { data: fScore } = await supabase
          .from('final_scores')
          .select('*')
          .eq('period_id', activePeriod.id)
          .eq('user_id', currentSession.user.id)
          .single();
        
        // Fetch detailed breakdowns for modern UI report
        const [selfRes, evalRes, apprRes, userRes] = await Promise.all([
          supabase.from('self_assessments').select('*').eq('user_id', currentSession.user.id).eq('period_id', activePeriod.id).single(),
          supabase.from('evaluations').select('*, evaluator:users!evaluator_id(full_name)').eq('target_user_id', currentSession.user.id).eq('period_id', activePeriod.id),
          supabase.from('approver_evaluations').select('*, approver:users!approver_id(full_name)').eq('target_user_id', currentSession.user.id).eq('period_id', activePeriod.id).single(),
          supabase.from('users').select('*, user_profiles(*)').eq('id', currentSession.user.id).single()
        ]);

        if (fScore) {
          setFinalScore({
            ...fScore,
            details: {
              self: selfRes.data,
              evals: evalRes.data || [],
              appr: apprRes.data,
              user: userRes.data,
              period: activePeriod
            }
          });
        }
        setLoading(false);
        return;
      }

      // State 1: Self-Assessment (10 pts)
      const { data: sAssessment } = await supabase
        .from('self_assessments')
        .select('*')
        .eq('period_id', activePeriod.id)
        .eq('user_id', currentSession.user.id)
        .single();
      
      setSelfAssessment(sAssessment);

      // If locked, load evaluator/approver data
      if (sAssessment?.is_locked) {
        if (mem.role === 'evaluator' || mem.role === 'approver' || mem.role === 'leader' || mem.role === 'admin') {
          // Fetch all members to evaluate
          const { data: membersList } = await supabase
            .from('period_members')
            .select('*, users(full_name)')
            .eq('period_id', activePeriod.id)
            .neq('user_id', currentSession.user.id);

          setAllMembers(membersList || []);

          // Fetch current 20-point evaluations
          const { data: evals } = await supabase
            .from('evaluations')
            .select('*')
            .eq('period_id', activePeriod.id)
            .eq('evaluator_id', currentSession.user.id);

          setEvaluations(evals || []);
        }
      }

      setLoading(false);
    }

    fetchState();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-text-secondary mt-4">የግምገማ ሞጁል በመጫን ላይ... (Loading assessment module...)</p>
      </div>
    );
  }

  if (!membership || !period) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="premium-card max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-heading text-text-primary mb-2">ምንም ንቁ የምዘና ጊዜ የለም (No Active Period)</h2>
          <p className="text-text-secondary text-sm">
            አሁን ላይ ምንም ዓይነት የምዘና ጊዜ ውስጥ አልተመደቡም። እባክዎን ከአስተዳዳሪዎ የ QR መጋበዣ ይጠይቁ።
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (period.status === 'finalized') {
      return <FinalRevealView data={finalScore} />;
    }

    // Everyone must complete their self assessment first
    if (!selfAssessment?.is_locked) {
      return <SelfAssessmentView periodId={period.id} existingData={selfAssessment} />;
    }

    // After self-assessment is locked, give them the tabbed layout
    return <AssessmentDashboardLayout 
      session={session}
      membership={membership} 
      period={period} 
      selfAssessment={selfAssessment} 
      allMembers={allMembers} 
      evaluations={evaluations} 
    />;
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <UserProfileViewer userId={session.user.id} />
      {renderContent()}
    </div>
  );
}

function AssessmentDashboardLayout({ session, membership, period, selfAssessment, allMembers, evaluations }: any) {
  const canEvaluate = membership.role === 'evaluator' || membership.role === 'approver' || membership.role === 'leader' || membership.role === 'admin';
  const isApprover = membership.role === 'approver' || membership.role === 'admin';

  const defaultTab = isApprover ? 'approve' : canEvaluate ? 'eval' : 'self';
  const [activeTab, setActiveTab] = useState<'self' | 'history' | 'eval' | 'approve'>(defaultTab);
  const [showSelfDetails, setShowSelfDetails] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="bg-surface-primary border-b border-border/50 sticky top-0 z-30 shadow-sm rounded-2xl mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('self')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'self'
                  ? 'border-brand-blue text-brand-blue font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              የኔ ግምገማ (My Assessment)
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-brand-blue text-brand-blue font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              የቀደሙ ምዘናዎች (Previous Assessments)
            </button>

            {canEvaluate && (
              <button
                onClick={() => setActiveTab('eval')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'eval'
                    ? 'border-brand-blue text-brand-blue font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                ቡድንን ገምግም (Evaluate Team)
              </button>
            )}

            {isApprover && (
              <button
                onClick={() => setActiveTab('approve')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'approve'
                    ? 'border-brand-yellow text-brand-yellow font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                ውጤቶችን አጽድቅ (Approve Scores)
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {activeTab === 'self' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/30 border border-emerald-500/30 dark:border-emerald-700/40 rounded-3xl shadow-lg backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-emerald-950 dark:text-emerald-100">
                    የግል ምዘናዎን በተሳካ ሁኔታ አጠናቀዋል!
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed max-w-2xl">
                    የቡድን አመራሩ ግምገማውን አጠናቀው ውጤት ሲያፀድቁ የመጨረሻው ውጤት እዚህ ይገለፃል።
                  </p>
                  {selfAssessment?.score_10 !== undefined && (
                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                        <span>የተመዘገበ የግል ውጤት (Self Score):</span>
                        <strong className="text-emerald-950 dark:text-emerald-100 font-bold text-base">{Number(selfAssessment.score_10).toFixed(2)} / 10</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-500/20 flex justify-center sm:justify-end">
                <button
                  onClick={() => setShowSelfDetails(!showSelfDetails)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm bg-surface-primary hover:bg-surface-secondary border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white"
                >
                  {showSelfDetails ? (
                    <>
                      <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>ምዘናውን ደብቅ (Hide Assessment)</span>
                      <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>የተሞላውን ምዘና ተመልከት (Show Assessment)</span>
                      <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {showSelfDetails && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <SelfAssessmentView periodId={period.id} existingData={selfAssessment} readOnly={true} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <PreviousAssessmentsView userId={session.user.id} />
        )}

        {activeTab === 'eval' && canEvaluate && (
          <LeadershipEvaluationView periodId={period.id} members={allMembers} evaluations={evaluations} />
        )}

        {activeTab === 'approve' && isApprover && (
          <ApproverDashboardView periodId={period.id} />
        )}
      </div>
    </div>
  );
}
