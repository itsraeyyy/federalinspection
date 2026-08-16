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
import {
  Loader2, User, PlusCircle, History, Users, ShieldCheck, CheckCircle2,
  PlayCircle, ArrowRight, Menu, X, ChevronUp, Calendar
} from 'lucide-react';

export default function AssessmentModulePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [allMemberships, setAllMemberships] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const [period, setPeriod] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [selfAssessment, setSelfAssessment] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<any>(null);

  // Evaluator / Approver state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);

  const loadPeriodContext = async (targetPeriodId: string, currentSession: any, membershipsList: any[]) => {
    setPeriodLoading(true);
    setFinalScore(null);
    setSelfAssessment(null);
    setAllMembers([]);
    setEvaluations([]);

    const mem = membershipsList.find(m => m.period_id === targetPeriodId) || membershipsList[0];
    if (!mem) {
      setPeriodLoading(false);
      return;
    }

    const activePeriod = mem.assessment_periods;
    setMembership(mem);
    setPeriod(activePeriod);

    if (activePeriod && activePeriod.status === 'finalized') {
      const { data: fScore } = await supabase
        .from('final_scores')
        .select('*')
        .eq('period_id', activePeriod.id)
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      const [selfRes, evalRes, apprRes, userRes] = await Promise.all([
        supabase.from('self_assessments').select('*').eq('user_id', currentSession.user.id).eq('period_id', activePeriod.id).maybeSingle(),
        supabase.from('evaluations').select('*, evaluator:users!evaluator_id(full_name)').eq('target_user_id', currentSession.user.id).eq('period_id', activePeriod.id),
        supabase.from('approver_evaluations').select('*, approver:users!approver_id(full_name)').eq('target_user_id', currentSession.user.id).eq('period_id', activePeriod.id).maybeSingle(),
        supabase.from('users').select('*, user_profiles(*)').eq('id', currentSession.user.id).maybeSingle()
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
      setPeriodLoading(false);
      return;
    }

    if (activePeriod) {
      // Self-Assessment (10 pts)
      const { data: sAssessment } = await supabase
        .from('self_assessments')
        .select('*')
        .eq('period_id', activePeriod.id)
        .eq('user_id', currentSession.user.id)
        .single();

      setSelfAssessment(sAssessment);

      // Load evaluator/approver data for team members
      if (mem.role === 'evaluator' || mem.role === 'approver' || mem.role === 'leader' || mem.role === 'admin') {
        const { data: membersList } = await supabase
          .from('period_members')
          .select('*, users(full_name)')
          .eq('period_id', activePeriod.id)
          .neq('user_id', currentSession.user.id);

        setAllMembers(membersList || []);

        const { data: evals } = await supabase
          .from('evaluations')
          .select('*')
          .eq('period_id', activePeriod.id)
          .eq('evaluator_id', currentSession.user.id);

        setEvaluations(evals || []);
      }
    }

    setPeriodLoading(false);
  };

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

      // 1. Get all memberships for the user with period details
      const { data: memberships } = await supabase
        .from('period_members')
        .select('*, assessment_periods(*)')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false });

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      setAllMemberships(memberships);
      const initialPeriodId = memberships[0].period_id;
      setSelectedPeriodId(initialPeriodId);

      await loadPeriodContext(initialPeriodId, currentSession, memberships);
      setLoading(false);
    }

    fetchState();
  }, [router]);

  const handleSwitchPeriod = async (newPeriodId: string) => {
    setSelectedPeriodId(newPeriodId);
    if (session) {
      await loadPeriodContext(newPeriodId, session, allMemberships);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-text-secondary mt-4">የግምገማ ሞጁል በመጫን ላይ... (Loading assessment module...)</p>
      </div>
    );
  }

  return (
    <AssessmentDashboardLayout
      session={session}
      membership={membership}
      period={period}
      selfAssessment={selfAssessment}
      allMembers={allMembers}
      evaluations={evaluations}
      finalScore={finalScore}
      allMemberships={allMemberships}
      selectedPeriodId={selectedPeriodId}
      onSwitchPeriod={handleSwitchPeriod}
      periodLoading={periodLoading}
    />
  );
}

type TabType = 'profile' | 'addis' | 'history' | 'eval' | 'approve';

function AssessmentDashboardLayout({
  session,
  membership,
  period,
  selfAssessment: initialSelfAssessment,
  allMembers,
  evaluations,
  finalScore,
  allMemberships,
  selectedPeriodId,
  onSwitchPeriod,
  periodLoading
}: any) {
  const [selfAssessment, setSelfAssessment] = useState<any>(initialSelfAssessment);

  useEffect(() => {
    setSelfAssessment(initialSelfAssessment);
  }, [initialSelfAssessment]);

  const canEvaluate = membership?.role === 'evaluator' || membership?.role === 'approver' || membership?.role === 'leader' || membership?.role === 'admin';
  const isApprover = membership?.role === 'approver' || membership?.role === 'admin';

  const hasNewAssessment = period && period.status !== 'finalized';
  const isSelfComplete = selfAssessment?.is_locked;

  // Default tab: If user has an uncompleted new assessment, default to 'addis'; otherwise 'profile'
  const defaultTab: TabType = (hasNewAssessment && !isSelfComplete) ? 'addis' : 'profile';
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isStartingSelf, setIsStartingSelf] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const menuItems = [
    {
      id: 'profile' as TabType,
      label: 'የግል መረጃ',
      subLabel: 'My Profile',
      shortLabel: 'የግል መረጃ',
      icon: User,
      badge: null
    },
    {
      id: 'addis' as TabType,
      label: 'አዲስ ምዘና',
      subLabel: 'Addis Mzena',
      shortLabel: 'አዲስ ምዘና',
      icon: PlusCircle,
      badge: hasNewAssessment ? (isSelfComplete ? 'የተጠናቀቀ' : 'አዲስ') : null,
      badgeColor: isSelfComplete ? 'bg-success/15 text-success' : 'bg-brand-blue/15 text-brand-blue'
    },
    {
      id: 'history' as TabType,
      label: 'የቀደሙ ምዘናዎች',
      subLabel: 'Yalefu Mzenawoch',
      shortLabel: 'የቀደሙ',
      icon: History,
      badge: null
    },
    ...(canEvaluate ? [{
      id: 'eval' as TabType,
      label: 'ቡድንን መዘን',
      subLabel: 'Assess Team',
      shortLabel: 'መዘን',
      icon: Users,
      badge: null
    }] : []),
    ...(isApprover ? [{
      id: 'approve' as TabType,
      label: 'ውጤቶችን አጽድቅ',
      subLabel: 'Approve Scores',
      shortLabel: 'አጽድቅ',
      icon: ShieldCheck,
      badge: null
    }] : [])
  ];

  // Mobile layout calculations: If total items > 4, render first 3 in bottom bar + Hamburger menu for rest
  const maxDirectMobileItems = 3;
  const showMobileHamburger = menuItems.length > 4;
  const directMobileItems = showMobileHamburger ? menuItems.slice(0, maxDirectMobileItems) : menuItems;

  return (
    <div className={`flex-1 flex flex-col w-full ${activeTab === 'approve' ? 'max-w-[100%]' : 'max-w-7xl'} mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 transition-all`}>

      {/* Active Mzena Switcher Dropdown (If user is registered in multiple periods) */}
      {allMemberships && allMemberships.length > 1 && (
        <div className="mb-6 p-4 bg-surface-primary border border-border/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">የምዘና ጊዜ ይምረጡ (Select Assessment Period)</h3>
              <p className="text-xs text-text-muted">እርስዎ በብዙ የምዘና ጊዜያት ውስጥ ተመዝግበዋል።</p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            {periodLoading && <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />}
            <select
              value={selectedPeriodId}
              onChange={(e) => onSwitchPeriod(e.target.value)}
              disabled={periodLoading}
              className="w-full sm:w-auto px-4 py-2.5 bg-surface-secondary border border-border/80 rounded-xl text-xs sm:text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-blue/30 cursor-pointer outline-none hover:border-brand-blue/50 transition-colors shadow-inner disabled:opacity-50"
            >
              {allMemberships.map((m: any) => (
                <option key={m.period_id} value={m.period_id}>
                  {m.assessment_periods?.name || 'ምዘና'} ({m.assessment_periods?.status === 'active' ? 'በሂደት ላይ' : 'የተጠናቀቀ'}) — [{m.role === 'approver' ? 'አጽዳቂ' : m.role === 'evaluator' ? 'መዛኝ' : 'ተመዛኝ'}]
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Top Menubar navigation pill bar when viewing Approver Dashboard */}
      {activeTab === 'approve' && (
        <div className="hidden lg:flex items-center justify-between bg-surface-primary border border-border/80 rounded-2xl p-2.5 mb-6 shadow-sm sticky top-[84px] z-30 backdrop-blur-md bg-surface-primary/95">
          <div className="flex items-center gap-2 overflow-x-auto">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsStartingSelf(false);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary border border-transparent'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1 bg-surface-secondary/80 rounded-xl text-[11px] font-semibold text-text-muted border border-border/50">
            የአጽዳቂ ዳሽቦርድ (Full-Width Approver View)
          </div>
        </div>
      )}

      {/* Responsive Grid: Desktop Sidebar (when not in approve tab) + Main Content */}
      <div className={`grid grid-cols-1 ${activeTab === 'approve' ? 'grid-cols-1' : 'lg:grid-cols-[280px_1fr]'} gap-6 lg:gap-8 items-start`}>

        {/* Desktop Sidebar (Only when NOT on Approver tab) */}
        {activeTab !== 'approve' && (
          <div className="hidden lg:block bg-surface-primary border border-border/80 rounded-3xl p-5 shadow-sm sticky top-[84px] z-30 max-h-[calc(100vh-100px)] overflow-y-auto space-y-4 shrink-0">
            <div className="px-3 py-2 border-b border-border/50 pb-3">
              <h2 className="text-lg font-heading font-bold text-text-primary">የግምገማ ማዕከል</h2>
              <p className="text-xs text-text-muted">Assessment Navigation</p>
            </div>

            <nav className="flex flex-col gap-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsStartingSelf(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${isActive
                        ? 'bg-brand-blue text-white shadow-md font-semibold'
                        : 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-surface-secondary text-brand-blue border border-border/60'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold block leading-snug truncate">{item.label}</span>
                        <span className={`text-[11px] block truncate ${isActive ? 'text-white/80' : 'text-text-muted'}`}>{item.subLabel}</span>
                      </div>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${isActive ? 'bg-white text-brand-blue font-extrabold' : item.badgeColor
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {periodLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-text-muted text-sm gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
              <span>የተመረጠውን የምዘና መረጃ በማውረድ ላይ...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: My Profile */}
              {session?.user?.id && (
                <div className={activeTab === 'profile' ? 'animate-in fade-in duration-200' : 'hidden'}>
                  <UserProfileViewer userId={session.user.id} />
                </div>
              )}

              {/* Tab 2: Addis Mzena */}
              <div className={activeTab === 'addis' ? 'space-y-6 animate-in fade-in duration-200' : 'hidden'}>
                {!period ? (
                  <div className="premium-card p-10 text-center bg-surface-primary rounded-3xl border border-border">
                    <PlusCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="text-lg font-heading font-bold text-text-primary mb-1">ምንም አዲስ ምዘና የለም (No Active Period)</h3>
                    <p className="text-sm text-text-secondary">በአሁኑ ጊዜ የተመደበ አዲስ የምዘና ክፍለ-ጊዜ የለም።</p>
                  </div>
                ) : period.status === 'finalized' ? (
                  <FinalRevealView data={finalScore} />
                ) : !isSelfComplete && !isStartingSelf ? (
                  /* Card displaying period title and simple button to start evaluating */
                  <div className="premium-card overflow-hidden bg-gradient-to-br from-brand-blue/10 via-surface-primary to-surface-primary border border-brand-blue/30 rounded-3xl p-8 shadow-md">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-3 text-center md:text-left">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-blue/15 text-brand-blue text-xs font-extrabold tracking-wide uppercase">
                          <PlusCircle className="w-3.5 h-3.5" /> አዲስ ምዘና (Active Assessment)
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
                          {period.name}
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                          እባክዎን ከታች ያለውን አዝራር በመጫን የራስዎን ምዘና (10%) መስፈርቶች መሙላት ይጀምሩ።
                        </p>
                      </div>

                      <button
                        onClick={() => setIsStartingSelf(true)}
                        className="w-full md:w-auto px-8 py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 shrink-0"
                      >
                        <PlayCircle className="w-6 h-6" />
                        <span>ምዘናውን ጀምር (Start Assessment)</span>
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Self Assessment Form View */
                  <div>
                    {isSelfComplete && (
                      <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">የግል ምዘናዎን በተሳካ ሁኔታ አጠናቀዋል!</h3>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300">የተመዘገበ የግል ውጤት (Self Score): <strong>{Number(selfAssessment?.score_10 || 0).toFixed(1)} / 10</strong></p>
                        </div>
                      </div>
                    )}
                    <SelfAssessmentView
                      periodId={period?.id || ''}
                      existingData={selfAssessment}
                      readOnly={isSelfComplete}
                      onLocked={(savedData) => setSelfAssessment(savedData)}
                    />
                  </div>
                )}
              </div>

              {/* Tab 3: Yalefu Mzenawoch */}
              {session?.user?.id && (
                <div className={activeTab === 'history' ? 'animate-in fade-in duration-200' : 'hidden'}>
                  <PreviousAssessmentsView userId={session.user.id} />
                </div>
              )}

              {/* Tab 4: Evaluate Team */}
              {canEvaluate && period && (
                <div className={activeTab === 'eval' ? 'animate-in fade-in duration-200' : 'hidden'}>
                  <LeadershipEvaluationView
                    periodId={period.id}
                    members={allMembers}
                    evaluations={evaluations}
                  />
                </div>
              )}

              {/* Tab 5: Approver Dashboard */}
              {isApprover && period && (
                <div className={activeTab === 'approve' ? 'animate-in fade-in duration-200' : 'hidden'}>
                  <ApproverDashboardView
                    periodId={period.id}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-primary/95 backdrop-blur-lg border-t border-border/80 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {directMobileItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsStartingSelf(false);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${isActive ? 'text-brand-blue font-bold' : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] mt-1 font-medium leading-none">{item.shortLabel}</span>
                {item.badge && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isSelfComplete ? 'bg-success' : 'bg-brand-blue'
                    }`} />
                )}
              </button>
            );
          })}

          {/* More button if items > 4 */}
          {showMobileHamburger && (
            <div className="relative">
              <button
                onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${isMobileMoreOpen || menuItems.slice(maxDirectMobileItems).some(i => i.id === activeTab)
                    ? 'text-brand-blue font-bold'
                    : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                {isMobileMoreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="text-[10px] mt-1 font-medium leading-none">ተጨማሪ</span>
              </button>

              {/* Mobile Popover Menu */}
              {isMobileMoreOpen && (
                <div className="absolute bottom-14 right-0 w-48 bg-surface-primary border border-border/80 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-150 z-50">
                  {menuItems.slice(maxDirectMobileItems).map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsStartingSelf(false);
                          setIsMobileMoreOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs font-bold transition-all ${isActive
                            ? 'bg-brand-blue text-white'
                            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
