'use client';

import {
  IconSearch,
  IconCheck,
  IconBan,
  IconClock,
  IconUser,
  IconFileText,
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconPaperclip,
  IconExternalLink,
  IconRefresh,
  IconLogout,
  IconShieldCheck,
  IconFilter,
  IconChevronRight,
  IconLoader2,
  IconX,
  IconEdit,
  IconArrowLeft,
  IconBulb,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";
import { complaintService } from "@/services/complaints";
import { Complaint } from "@/types";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

type StatusTab = 'All' | 'Accepted' | 'PendingApproval' | 'Processing' | 'Resolved';

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  New: { label: 'አዲስ የተመዘገበ', bg: 'bg-blue-500/10 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300 font-semibold', border: 'border-blue-500/20' },
  Accepted: { label: 'የተቀበሉት', bg: 'bg-blue-500/10 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300 font-semibold', border: 'border-blue-500/20' },
  Processing: { label: 'በኮሚቴ በማጣራት ላይ', bg: 'bg-amber-500/10 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300 font-semibold', border: 'border-amber-500/20' },
  PendingApproval: { label: 'ለማጽደቅ የቀረበ (ለጽድቅ ዝግጁ)', bg: 'bg-sky-500/15 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300 font-bold', border: 'border-sky-500/40' },
  Resolved: { label: 'ውሳኔ የጸደቀለት', bg: 'bg-emerald-500/10 dark:emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300 font-semibold', border: 'border-emerald-500/20' },
  Rejected: { label: 'ውድቅ የተደረገ', bg: 'bg-red-500/10 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300 font-semibold', border: 'border-red-500/20' },
  RevisionRequested: { label: 'ማስተካከያ የተጠየቀበት', bg: 'bg-amber-500/15 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-500/30' },
};

function getStatusBadge(status: string) {
  if (status === 'PendingApproval') {
    return { label: 'ለማጽደቅ የቀረበ', bg: 'bg-sky-500/15 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300 font-bold', border: 'border-sky-500/40' };
  }
  if (status === 'Rejected') {
    return { label: 'ውድቅ የተደረገ', bg: 'bg-red-500/10 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300 font-semibold', border: 'border-red-500/20' };
  }
  return STATUS_BADGES[status] || { label: status, bg: 'bg-surface-secondary', text: 'text-text-secondary font-medium', border: 'border-border/20' };
}

export default function CommitteeLeaderDashboard() {
  const { profile, loading: profileLoading } = useAdmin();
  const [isDark, setIsDark] = useState(false);
  const [tickets, setTickets] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize and persist theme (Light / Dark mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directMessage, setDirectMessage] = useState('');
  const [directFiles, setDirectFiles] = useState<File[]>([]);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<string[]>(['']);

  const leaderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'የኮሚቴ ሰብሳቢ (Leader)' : 'የኮሚቴ ሰብሳቢ';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const data = await complaintService.getComplaints();
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCommitteeAssign = async () => {
    const validMembers = committeeMembers.filter(m => m.trim());
    if (!selectedTicket || validMembers.length === 0) return;
    setActionLoading(true);
    
    const assignedStr = validMembers.join('፣ ');
    const assigned = await complaintService.startProcessingByLeader(selectedTicket.id, leaderName, assignedStr);
    if (assigned) {
      await fetchTickets();
      const updated = await complaintService.getComplaintById(selectedTicket.id);
      setSelectedTicket(updated);
      setShowCommitteeModal(false);
      setCommitteeMembers(['']);
      setFeedbackMsg({ type: 'success', text: 'ኮሚቴው በተሳካ ሁኔታ ተመድቧል፣ እና የ15 ቀናት ጊዜ ገደብ ጀምሯል።' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'ኮሚቴውን መመደብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
    setActionLoading(false);
  };

  const getTimelineStatus = (createdAt: string, status: string) => {
    if (status === 'Resolved' || status === 'Rejected') {
      return { label: 'ውሳኔ የተሰጠበት እና የተጠናቀቀ', isOverdue: false, isWarning: false, daysLeft: 0 };
    }
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsedDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const remainingDays = 15 - elapsedDays;

    if (remainingDays <= 0) {
      return { label: 'የ15 ቀናት የጊዜ ገደብ ተጠናቋል! (አስቸኳይ ትኩረት የሚሻ)', isOverdue: true, isWarning: false, daysLeft: remainingDays };
    }
    if (remainingDays <= 3) {
      return { label: `የጊዜ ገደብ ለማለቅ፡ ${remainingDays} ቀናት ብቻ ይቀራሉ`, isOverdue: false, isWarning: true, daysLeft: remainingDays };
    }
    return { label: `ቀሪ የጊዜ ገደብ፡ ${remainingDays} ቀናት`, isOverdue: false, isWarning: false, daysLeft: remainingDays };
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchQuery || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'Accepted') return t.status === 'Accepted';
    if (activeTab === 'PendingApproval') return t.status === 'PendingApproval';
    if (activeTab === 'Processing') return t.status === 'Processing' || t.status === 'RevisionRequested';
    if (activeTab === 'Resolved') return t.status === 'Resolved' || t.status === 'Rejected';
    return t.status !== 'New'; // Default All tab shouldn't show 'New' tickets to Leaders
  });

  const stats = {
    total: tickets.filter(t => t.status !== 'New').length,
    accepted: tickets.filter(t => t.status === 'Accepted').length,
    pendingApproval: tickets.filter(t => t.status === 'PendingApproval').length,
    processing: tickets.filter(t => t.status === 'Processing' || t.status === 'RevisionRequested').length,
    resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Rejected').length,
    resolutionRate: tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'Resolved').length / tickets.length) * 100) : 0,
  };

  const handleRatify = async (ticket: Complaint) => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const resolutionMsg = ticket.resolution?.message || ticket.decisionIdeaSummary || 'የውሳኔ ሀሳቡ በኮሚቴ ሰብሳቢ ተረጋግቶና ጸድቆ ተጠናቋል።';
      const success = await complaintService.updateComplaintStatus(
        ticket.id,
        'Resolved',
        leaderName,
        { message: resolutionMsg }
      );
      if (success) {
        setFeedbackMsg({ type: 'success', text: `የመከታተያ ኮድ ${ticket.trackingCode} ውሳኔ በተሳካ ሁኔታ ጸድቋል! ለአመልካቹ መልእክት ተልኳል።` });
        await fetchTickets();
        setSelectedTicket(null);
      } else {
        setFeedbackMsg({ type: 'error', text: 'ውሳኔ በማጽደቅ ላይ ስህተት አጋጥሟል። እባክዎ ዳግም ይሞክሩ።' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'ስህተት አጋጥሟል።' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedTicket || !revisionNotes.trim()) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const success = await complaintService.updateComplaintStatus(
        selectedTicket.id,
        'RevisionRequested' as any,
        leaderName,
        { message: `የሰብሳቢው የማስተካከያ ትዕዛዝ፡ ${revisionNotes}` }
      );
      if (success) {
        setFeedbackMsg({ type: 'success', text: 'የማስተካከያ ትዕዛዝ ለአጣሪ ኮሚቴው በተሳካ ሁኔታ ተላልፏል።' });
        await fetchTickets();
        setShowRevisionModal(false);
        setRevisionNotes('');
        setSelectedTicket(null);
      } else {
        setFeedbackMsg({ type: 'error', text: 'ትዕዛዙን ማሳለፍ አልተቻለም።' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'ስህተት አጋጥሟል።' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectResolve = async (action: 'Resolved' | 'Rejected') => {
    if (!selectedTicket || !directMessage.trim()) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const success = await complaintService.updateComplaintStatus(
        selectedTicket.id,
        action,
        `${leaderName} (የኮሚቴ ሰብሳቢ የቀጥታ ውሳኔ)`,
        { message: directMessage, files: directFiles }
      );
      if (success) {
        const actionLabel = action === 'Resolved' ? 'ምላሽና ውሳኔ ጸድቋል' : 'ውድቅ ተደርጓል';
        setFeedbackMsg({ type: 'success', text: `የመከታተያ ኮድ ${selectedTicket.trackingCode} ${actionLabel}! ለአመልካቹ መልእክት ተልኳል።` });
        await fetchTickets();
        setShowDirectModal(false);
        setDirectMessage('');
        setDirectFiles([]);
        setSelectedTicket(null);
      } else {
        setFeedbackMsg({ type: 'error', text: 'የቀጥታ ውሳኔ አሰጣጥ ላይ ስህተት አጋጥሟል።' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'ስህተት አጋጥሟል።' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/complaint/login';
  };

  if (profileLoading || (loading && tickets.length === 0)) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 size={36} className="animate-spin text-brand-blue" />
          <p className="text-sm text-text-secondary font-medium">የኮሚቴ ሰብሳቢ ፖርታል በመጫን ላይ ነው...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans pb-16 selection:bg-brand-blue/20">
      {/* Executive Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-primary/80 backdrop-blur-md border-b border-border/50 px-4 md:px-10 h-[72px] md:h-[88px] flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 min-w-[40px] rounded-full overflow-hidden border border-border/50 shadow-xs">
            <Image src="/logo.jpg" alt="Commission Logo" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-extrabold tracking-tight text-text-primary">
                የኮሚቴ ሰብሳቢ — የውሳኔ ማጽደቂያ ፖርታል
              </span>
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                Executive Portal
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block font-medium mt-0.5">
              የዜጎች ጥቆማና አቤቱታ የመጨረሻ ግምገማና ውሳኔ ማጽደቂያ ስርዓት
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/complaints"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary/80 hover:bg-surface-secondary text-xs font-bold text-text-secondary hover:text-text-primary transition-all border border-border/50 shadow-2xs"
          >
            <IconArrowLeft size={16} stroke={1.75} />
            ወደ አጣሪ ኮሚቴ ገጽ
          </Link>

          <div className="flex items-center gap-1 bg-surface-primary/60 backdrop-blur-md p-1 rounded-full border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <button
              onClick={fetchTickets}
              disabled={loading}
              title="መረጃዎችን ያድሱ (Refresh)"
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all disabled:opacity-50"
            >
              <IconRefresh size={18} stroke={1.75} className={loading ? 'animate-spin text-brand-blue' : ''} />
            </button>

            <div className="w-[1px] h-4 bg-border/50"></div>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title="ገጽታ ቀይር (Toggle Theme)"
            >
              {isDark ? <IconSun size={18} stroke={2} className="text-[#D4A017] dark:text-brand-yellow" /> : <IconMoon size={18} stroke={2} className="text-text-secondary" />}
            </button>

            <div className="w-[1px] h-4 bg-border/50"></div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 text-text-secondary transition-all"
              title="ውጣ (Logout)"
            >
              <IconLogout size={18} stroke={2} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 mt-8">
        {feedbackMsg && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm font-medium shadow-sm transition-all ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              <span>{feedbackMsg.type === 'success' ? '✓' : '⚠'}</span>
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-75">
              <IconX size={18} />
            </button>
          </div>
        )}

        {/* Executive Overview Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-primary p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-extrabold rounded-md mb-2.5 border border-brand-blue/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
              ከፍተኛ አመራር እና የኮሚቴ ሰብሳቢ (Committee Leader)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              ሰላም፣ {leaderName}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1 font-medium">
              በአጣሪ ኮሚቴው ተጣርተው ለጽድቅ የቀረቡ የውሳኔ ሀሳቦችን ይመልከቱ፣ ይገምግሙ እንዲሁም የመጨረሻ ውሳኔ ይስጡ።
            </p>
          </div>
          <div className="flex items-center gap-6 bg-surface-secondary p-4 rounded-xl border border-border/50 shadow-2xs">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">የውሳኔ አፈጻጸም</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.resolutionRate}%</span>
            </div>
            <div className="h-10 w-[1px] bg-border/60"></div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">ለማጽደቅ የሚጠብቁ</span>
              <span className={`text-xl sm:text-2xl font-extrabold tabular-nums ${stats.pendingApproval > 0 ? 'text-[#C68A00] dark:text-brand-yellow animate-pulse' : 'text-text-primary'}`}>
                {stats.pendingApproval}
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div 
            onClick={() => setActiveTab('All')}
            className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'All' 
                ? 'bg-surface-primary border-brand-blue shadow-md ring-1 ring-brand-blue/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-border/80 shadow-xs hover:shadow-sm'
            }`}
          >
            {activeTab === 'All' && <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-blue"></div>}
            <div>
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">አጠቃላይ የቀረቡ ጉዳዮች</span>
                <IconFileText size={18} stroke={1.75} className="text-brand-blue" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">
                {stats.total}
              </div>
            </div>
            <span className="text-xs text-text-muted block mt-2 font-medium">
              የገቡ ቅሬታዎች እና ጥቆማዎች
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('Accepted')}
            className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Accepted' 
                ? 'bg-surface-primary border-brand-blue shadow-md ring-1 ring-brand-blue/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-brand-blue/40 shadow-xs hover:shadow-sm'
            }`}
          >
            {activeTab === 'Accepted' && <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-blue"></div>}
            <div>
              <div className="flex items-center justify-between text-brand-blue dark:text-blue-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {stats.accepted > 0 && <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>}
                  ለኮሚቴ ምደባ
                </span>
                <IconUser size={18} stroke={1.75} className="text-brand-blue dark:text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-blue dark:text-blue-400 tabular-nums tracking-tight">
                {stats.accepted}
              </div>
            </div>
            <span className="text-xs text-text-muted block mt-2 font-medium">
              በአስተዳዳሪ ተቀባይነት ያገኙ
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('PendingApproval')}
            className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'PendingApproval' 
                ? 'bg-surface-primary border-sky-500 shadow-md ring-1 ring-sky-500/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-sky-500/40 shadow-xs hover:shadow-sm'
            }`}
          >
            {activeTab === 'PendingApproval' && <div className="absolute top-0 left-0 right-0 h-[3px] bg-sky-500"></div>}
            <div>
              <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  {stats.pendingApproval > 0 && <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>}
                  ለማጽደቅ የቀረቡ
                </span>
                <IconCheck size={18} stroke={1.75} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums tracking-tight">
                {stats.pendingApproval}
              </div>
            </div>
            <span className="text-xs text-sky-600/80 dark:text-sky-400/90 block mt-2 font-semibold">
              የእርስዎን የመጨረሻ ውሳኔ የሚጠብቁ
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('Processing')}
            className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Processing' 
                ? 'bg-surface-primary border-[#C68A00] dark:border-brand-yellow shadow-md ring-1 ring-[#C68A00]/20 dark:ring-brand-yellow/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-[#C68A00]/50 dark:hover:border-brand-yellow/40 shadow-xs hover:shadow-sm'
            }`}
          >
            {activeTab === 'Processing' && <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C68A00] dark:bg-brand-yellow"></div>}
            <div>
              <div className="flex items-center justify-between text-[#C68A00] dark:text-brand-yellow mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C68A00] dark:text-brand-yellow">በኮሚቴ ማጣራት ላይ</span>
                <IconClock size={18} stroke={1.75} className="text-[#C68A00] dark:text-brand-yellow" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#C68A00] dark:text-brand-yellow tabular-nums tracking-tight">
                {stats.processing}
              </div>
            </div>
            <span className="text-xs text-text-muted block mt-2 font-medium">
              በማጣራት እና በሂደት ላይ የሚገኙ
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('Resolved')}
            className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Resolved' 
                ? 'bg-surface-primary border-emerald-600 shadow-md ring-1 ring-emerald-600/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-emerald-500/50 shadow-xs hover:shadow-sm'
            }`}
          >
            {activeTab === 'Resolved' && <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-600"></div>}
            <div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">ውሳኔ የጸደቀላቸው</span>
                <IconShieldCheck size={18} stroke={1.75} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                {stats.resolved}
              </div>
            </div>
            <span className="text-xs text-text-muted block mt-2 font-medium">
              ተጣርተው የመጨረሻ ውሳኔ የተሰጣቸው
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-surface-primary p-3.5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {(['All', 'Accepted', 'PendingApproval', 'Processing', 'Resolved'] as StatusTab[]).map(tab => {
              const labels: Record<StatusTab, string> = {
                All: 'ሁሉም (All)',
                Accepted: 'ለኮሚቴ ምደባ',
                PendingApproval: 'ለማጽደቅ የቀረቡ',
                Processing: 'በማጣራት ላይ',
                Resolved: 'የተጠናቀቁ',
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-surface-secondary/80 text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-border/30'
                  }`}
                >
                  {labels[tab]}
                  {tab === 'PendingApproval' && stats.pendingApproval > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-brand-blue' : 'bg-[#C68A00] dark:bg-brand-yellow text-white dark:text-zinc-900'}`}>
                      {stats.pendingApproval}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <IconSearch size={16} stroke={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="በመከታተያ ኮድ፣ በስም ወይም በጉዳይ ይፈልጉ..."
              className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="bg-surface-primary p-16 rounded-3xl border border-border/20 text-center shadow-xs">
            <IconFileText size={48} className="mx-auto text-text-muted/40 mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-text-primary">ምንም የቀረበ ጉዳይ አልተገኘም</h3>
            <p className="text-xs text-text-muted mt-1.5 max-w-md mx-auto">
              በአሁኑ ወቅት በመረጡት ምድብ ወይም ፍለጋ ውስጥ ምንም የተመዘገበ ወይም ለማጽደቅ የቀረበ ቅሬታና ጥቆማ የለም።
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map(ticket => {
              const badge = getStatusBadge(ticket.status);
              const timeline = getTimelineStatus(ticket.createdAt, ticket.status);

              return (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-5 rounded-3xl bg-surface-primary border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    ticket.status === 'PendingApproval'
                      ? 'border-sky-500/50 shadow-sm ring-1 ring-sky-500/20 bg-gradient-to-br from-sky-500/5 via-surface-primary to-surface-primary'
                      : 'border-border/20 hover:border-border/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          ticket.type === 'Suggestion'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                        }`}>
                          {ticket.type === 'Suggestion' ? 'ጥቆማ (Suggestion)' : 'አቤቱታ (Complaint)'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-bold text-text-secondary bg-surface-secondary px-2.5 py-1 rounded-lg border border-border/20">
                        #{ticket.trackingCode}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text-primary mb-1.5 line-clamp-1 flex items-center gap-1.5">
                      <IconBuilding size={16} className="text-text-muted flex-shrink-0" />
                      {ticket.subject || 'አልተገለጸም'}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mb-4 font-normal leading-relaxed">
                      {ticket.message}
                    </p>
                  </div>

                  <div>
                    <div className="p-3.5 bg-surface-secondary/60 rounded-2xl text-xs space-y-2.5 mb-4 border border-border/20">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="flex items-center gap-1 font-medium text-text-muted">
                          <IconUser size={14} /> አጣሪ ኮሚቴ፡
                        </span>
                        <span className="font-semibold text-text-primary truncate max-w-[200px]">
                          {ticket.assignedCommittee || 'እስከ አሁን አልተመደበም'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/20 pt-2.5">
                        <span className="flex items-center gap-1 font-medium text-text-muted">
                          <IconClock size={14} /> የ15 ቀናት የጊዜ ገደብ፡
                        </span>
                        <span className={`font-bold text-[11px] ${
                          timeline.isOverdue ? 'text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse' :
                          timeline.isWarning ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-text-primary'
                        }`}>
                          {timeline.isOverdue && <IconAlertTriangle size={13} />}
                          {timeline.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-text-muted flex items-center gap-1 font-medium">
                        <IconCalendar size={13} /> {ticket.date}
                      </span>

                      {ticket.status === 'PendingApproval' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRatify(ticket); }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <IconCheck size={16} /> ውሳኔውን ያጽድቁ (Ratify)
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-brand-blue flex items-center gap-1 group-hover:underline">
                          ዝርዝር መረጃ ይመልከቱ <IconChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal / Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onClick={() => setSelectedTicket(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-primary w-full sm:max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            
            <div className="px-6 py-5 border-b border-border/20 flex items-center justify-between bg-surface-secondary/40">
              <div>
                <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
                  መከታተያ ኮድ፡ #{selectedTicket.trackingCode}
                </span>
                <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2 mt-0.5">
                  {selectedTicket.type === 'Suggestion' ? 'የጥቆማ ማጣሪያ ሪፖርትና ውሳኔ' : 'የቅሬታና አቤቱታ ማጣሪያ ሪፖርትና ውሳኔ'}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-secondary/80 text-text-muted hover:text-text-primary transition-colors border border-border/20"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-text-primary">
              
              {selectedTicket.status === 'PendingApproval' && (
                <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-base">
                    <IconShieldCheck size={22} className="text-sky-600 dark:text-sky-400" />
                    ለእርስዎ ጽድቅ የቀረበ የኮሚቴ ውሳኔ ሀሳብ፡
                  </div>
                  <p className="text-sm bg-surface-primary p-4 rounded-xl border border-border/30 leading-relaxed font-normal text-text-primary">
                    {selectedTicket.resolution?.message || selectedTicket.decisionIdeaSummary || 'የውሳኔ ሀሳብ አልተጻፈም። (አጣሪ ኮሚቴው ያለምንም ተጨማሪ ማብራሪያ ለጽድቅ አስገብቷል)'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => handleRatify(selectedTicket)}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading ? <IconLoader2 className="animate-spin" size={18} /> : <IconCheck size={18} />}
                      ውሳኔውን ያጽድቁና ያሳውቁ (Ratify & Notify)
                    </button>
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <IconEdit size={18} />
                      ማስተካከያ ይዘዙ (Request Revision)
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface-secondary/50 border border-border/20 text-xs">
                <div>
                  <span className="font-semibold text-text-muted block mb-1">አመልካች / ዜጋ</span>
                  <span className="font-bold text-text-primary text-sm">{selectedTicket.name || 'አልተገለጸም (Anonymous)'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-muted block mb-1">ስልክ ቁጥር</span>
                  <span className="font-mono font-bold text-text-primary text-sm">{selectedTicket.phone || 'የለም'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-muted block mb-1">ጉዳዩ የተመለከተው ተቋም</span>
                  <span className="font-bold text-text-primary text-sm">{selectedTicket.subject || selectedTicket.institution || 'አልተገለጸም'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-muted block mb-1">የተመዘገበበት ቀን</span>
                  <span className="text-text-primary font-medium">{selectedTicket.date}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">የአቤቱታው ወይም ጥቆማው ዝርዝር ይዘት</h4>
                <div className="p-5 rounded-2xl bg-surface-secondary/30 border border-border/20 leading-relaxed text-text-primary font-normal text-sm">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5 flex items-center gap-1.5">
                    <IconPaperclip size={15} /> የቀረቡ ማስረጃ ሰነዶች ({selectedTicket.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedTicket.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary border border-border/20 flex items-center justify-between transition-colors text-xs font-semibold text-brand-blue"
                      >
                        <span className="truncate max-w-[200px]">{att.filename}</span>
                        <IconExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Rejected') && selectedTicket.resolution && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">የተሰጠ የመጨረሻ ውሳኔ ምላሽ፡</span>
                  <p className="text-text-primary font-medium text-sm leading-relaxed">{selectedTicket.resolution.message}</p>
                </div>
              )}

            </div>

            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Rejected' && selectedTicket.status !== 'PendingApproval' && (
              <div className="px-6 py-4 bg-surface-secondary/50 border-t border-border/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <span className="text-xs text-text-muted font-semibold sm:mr-auto">የኮሚቴ ሰብሳቢ የመጨረሻ ውሳኔና ትዕዛዝ መስጫ፡</span>
                <button
                  onClick={() => setShowDirectModal(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 text-center"
                >
                  በቀጥታ ውሳኔ ይስጡ (Direct Resolve)
                </button>
                <button
                  onClick={() => handleDirectResolve('Rejected')}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 text-center"
                >
                  ውድቅ ያድርጉ (Reject Case)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Revision Order Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-primary w-full max-w-md p-6 rounded-3xl border border-border/30 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <IconEdit className="text-amber-500" size={20} />
              ለአጣሪ ኮሚቴው የማስተካከያ ትዕዛዝ መስጫ
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ውሳኔውን ከማጽደቅዎ በፊት አጣሪ ኮሚቴው ምን ተጨማሪ ምርመራ፣ ማጣራት ወይም ማስተካከያ እንዲያደርግ እንደሚፈልጉ ያስገቡ።
            </p>
            <textarea
              rows={4}
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              placeholder="ለምሳሌ፡ የተቋሙ አስተያየትና ምላሽ በግልጽ አልተካተተም፤ ማስረጃው በደንብ ተጣርቶ ዳግም ይቅረብ..."
              className="w-full p-3.5 bg-surface-secondary border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-text-primary placeholder-text-muted"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary text-xs font-bold rounded-xl border border-border/20"
              >
                ተዉት (Cancel)
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={actionLoading || !revisionNotes.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                ትዕዛዝ ያስተላልፉ (Send Revision Order)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Resolve Modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-primary w-full max-w-lg p-6 rounded-3xl border border-border/30 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <IconShieldCheck className="text-brand-blue" size={22} />
              የመጨረሻ ውሳኔና ምላሽ መስጫ
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ይህን ውሳኔ ሲሰጡ ጉዳዩ የመጨረሻ ውሳኔ እንዳገኘ ተቆጥሮ ለአመልካቹ መልእክት ይተላለፋል።
            </p>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1.5">የውሳኔው ማብራሪያና ምላሽ፡ *</label>
              <textarea
                rows={5}
                value={directMessage}
                onChange={e => setDirectMessage(e.target.value)}
                placeholder="ለአመልካቹ የሚሰጥ ዝርዝር የመጨረሻ ውሳኔና ምላሽ እዚህ ይጻፉ..."
                className="w-full p-3.5 bg-surface-secondary border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder-text-muted"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-primary block mb-1.5">የውሳኔ ደብዳቤ ወይም ሰነድ አያይዙ (የተቻለ ከሆነ)፡</label>
              <input
                type="file"
                multiple
                onChange={e => setDirectFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="w-full text-xs text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDirectModal(false)}
                className="px-4 py-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary text-xs font-bold rounded-xl border border-border/20"
              >
                ተዉት (Cancel)
              </button>
              <button
                onClick={() => handleDirectResolve('Resolved')}
                disabled={actionLoading || !directMessage.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <IconLoader2 className="animate-spin" size={16} />}
                ውሳኔውን አጽድቀው ያጠናቅቁ (Submit Resolution)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
