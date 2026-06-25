'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SelfAssessmentView } from '@/components/assessment/SelfAssessmentView';
import { LeadershipEvaluationView } from '@/components/assessment/LeadershipEvaluationView';
import { ApproverDashboardView } from '@/components/assessment/ApproverDashboardView';
import { FinalRevealView } from '@/components/assessment/FinalRevealView';
import { UserProfileViewer } from '@/components/assessment/UserProfileViewer';
import { Loader2 } from 'lucide-react';

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
        
        if (fScore) setFinalScore(fScore);
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
        if (mem.role === 'evaluator' || mem.role === 'approver') {
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
      return <FinalRevealView score={finalScore?.final_score_100 || 0} />;
    }

    // Everyone must complete their self assessment first
    if (!selfAssessment?.is_locked) {
      return <SelfAssessmentView periodId={period.id} existingData={selfAssessment} />;
    }

    // After self-assessment is locked, give them the tabbed layout
    return <AssessmentDashboardLayout 
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

function AssessmentDashboardLayout({ membership, period, selfAssessment, allMembers, evaluations }: any) {
  const [activeTab, setActiveTab] = useState<'self' | 'eval' | 'approve'>(
    membership.role === 'approver' ? 'approve' : 'eval'
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="bg-surface-primary border-b border-border/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('self')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'self'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              የኔ ግምገማ (My Assessment)
            </button>
            <button
              onClick={() => setActiveTab('eval')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'eval'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              ቡድንን ገምግም (Evaluate Team)
            </button>
            {membership.role === 'approver' && (
              <button
                onClick={() => setActiveTab('approve')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'approve'
                    ? 'border-brand-yellow text-brand-yellow'
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
          <SelfAssessmentView periodId={period.id} existingData={selfAssessment} readOnly={true} />
        )}
        {activeTab === 'eval' && (
          <LeadershipEvaluationView periodId={period.id} members={allMembers} evaluations={evaluations} />
        )}
        {activeTab === 'approve' && membership.role === 'approver' && (
          <ApproverDashboardView periodId={period.id} />
        )}
      </div>
    </div>
  );
}
