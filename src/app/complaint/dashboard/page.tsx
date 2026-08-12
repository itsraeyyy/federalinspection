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
  IconPlayerPlay,
  IconPhone
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

  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directMessage, setDirectMessage] = useState('');
  const [directFiles, setDirectFiles] = useState<File[]>([]);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<{ name: string; phone: string }[]>([{ name: '', phone: '' }]);

  // Editable Decision State
  const [editableDecision, setEditableDecision] = useState('');

  const leaderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'የኮሚቴ ሰብሳቢ (Leader)' : 'የኮሚቴ ሰብሳቢ';

  useEffect(() => {
    if (!profileLoading && !profile) {
      window.location.href = '/complaint/login';
    }
  }, [profileLoading, profile]);

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

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const data = await complaintService.getComplaints();
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketSelect = (ticket: Complaint) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'PendingApproval') {
      setEditableDecision(ticket.resolution?.message || ticket.decisionIdeaSummary || 'የውሳኔ ሀሳቡ በኮሚቴ ሰብሳቢ ተረጋግቶና ጸድቆ ተጠናቋል።');
    }
  };

  const handleCommitteeAssign = async () => {
    const validMembers = committeeMembers.filter(m => m.name.trim());
    if (!selectedTicket || validMembers.length === 0) return;
    setActionLoading(true);
    
    const assignedStr = validMembers.map(m => m.phone.trim() ? `${m.name.trim()} (${m.phone.trim()})` : m.name.trim()).join('፣ ');
    const assigned = await complaintService.startProcessingByLeader(selectedTicket.id, leaderName, assignedStr);
    if (assigned) {
      await fetchTickets();
      const updated = await complaintService.getComplaintById(selectedTicket.id);
      setSelectedTicket(updated);
      setShowCommitteeModal(false);
      setCommitteeMembers([{ name: '', phone: '' }]);
      setFeedbackMsg({ type: 'success', text: 'ኮሚቴው በተሳካ ሁኔታ ተመድቧል፣ እና የ15 ቀናት ጊዜ ገደብ ጀምሯል።' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'ኮሚቴውን መመደብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
    setActionLoading(false);
  };

  const getTimelineStatus = (ticket: Complaint) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Rejected') {
      return { label: 'ውሳኔ የተሰጠበት እና የተጠናቀቀ', isOverdue: false, isWarning: false, daysLeft: 0 };
    }
    const dateStr = ticket.processedAt || ticket.createdAtRaw || ticket.createdAt;
    let startTime = dateStr ? new Date(dateStr).getTime() : Date.now();
    if (isNaN(startTime)) {
      startTime = Date.now();
    }
    const now = Date.now();
    const elapsedDays = Math.max(0, Math.floor((now - startTime) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, 15 - elapsedDays);

    if (remainingDays <= 0) {
      return { label: 'የ15 ቀናት የጊዜ ገደብ ተጠናቋል! (አስቸኳይ ትኩረት የሚሻ)', isOverdue: true, isWarning: false, daysLeft: 0 };
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
    return t.status !== 'New';
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
      const resolutionMsg = editableDecision.trim() || ticket.resolution?.message || ticket.decisionIdeaSummary || 'የውሳኔ ሀሳቡ በኮሚቴ ሰብሳቢ ተረጋግቶና ጸድቆ ተጠናቋል።';
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
      const success = await complaintService.requestRevisions(
        selectedTicket.id,
        revisionNotes,
        leaderName
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
      <header className="sticky top-0 z-40 bg-surface-primary/95 backdrop-blur-md border-b border-border/50 px-4 md:px-10 h-[72px] md:h-[88px] flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="relative w-10 h-10 min-w-[40px] rounded-full overflow-hidden border border-border/50 shadow-xs shrink-0">
            <Image src="/logo.jpg" alt="Commission Logo" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm md:text-base font-extrabold tracking-tight text-text-primary truncate">
                የኮሚቴ ሰብሳቢ
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shrink-0">
                Executive Portal
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block font-medium mt-0.5 truncate">
              የዜጎች ጥቆማና አቤቱታ የመጨረሻ ግምገማና ውሳኔ ማጽደቂያ ስርዓት
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">

          <div className="flex items-center gap-1 bg-surface-primary/60 backdrop-blur-md p-1 rounded-full border border-border/50 shadow-sm">
            <button
              onClick={fetchTickets}
              disabled={loading}
              title="መረጃዎችን ያድሱ (Refresh)"
              className="w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all disabled:opacity-50"
            >
              <IconRefresh size={18} stroke={1.75} className={loading ? 'animate-spin text-brand-blue' : ''} />
            </button>

            <div className="w-[1px] h-4 bg-border/50"></div>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title="ገጽታ ቀይር (Toggle Theme)"
            >
              {isDark ? <IconSun size={18} stroke={2} className="text-brand-yellow" /> : <IconMoon size={18} stroke={2} className="text-text-secondary" />}
            </button>

            <div className="w-[1px] h-4 bg-border/50"></div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-danger text-text-secondary transition-all"
              title="ውጣ (Logout)"
            >
              <IconLogout size={18} stroke={2} />
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-10 mt-6 sm:mt-8 space-y-6">
        {feedbackMsg && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-sm transition-all ${
            feedbackMsg.type === 'success' 
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-danger/10 border-danger/20 text-danger'
          }`}>
            <div className="flex items-center gap-3">
              <span>{feedbackMsg.type === 'success' ? '✓' : '⚠'}</span>
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="p-2 hover:opacity-75 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl">
              <IconX size={18} />
            </button>
          </div>
        )}

        {/* Executive KPI Cards Row - Horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          
          <div 
            onClick={() => setActiveTab('Accepted')}
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Accepted' 
                ? 'bg-surface-primary border-brand-blue shadow-md ring-1 ring-brand-blue/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-brand-blue/40 shadow-sm'
            }`}
          >
            {activeTab === 'Accepted' && <div className="absolute top-0 left-0 right-0 h-[4px] bg-brand-blue"></div>}
            <div>
              <div className="flex items-center justify-between text-brand-blue mb-4">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {stats.accepted > 0 && <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>}
                  ለኮሚቴ ምደባ (Accepted)
                </span>
                <IconUser size={20} stroke={2} className="text-brand-blue" />
              </div>
              <div className="text-3xl font-extrabold text-brand-blue tabular-nums tracking-tight">
                {stats.accepted}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('Processing')}
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Processing' 
                ? 'bg-surface-primary border-warning shadow-md ring-1 ring-warning/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-warning/40 shadow-sm'
            }`}
          >
            {activeTab === 'Processing' && <div className="absolute top-0 left-0 right-0 h-[4px] bg-warning"></div>}
            <div>
              <div className="flex items-center justify-between text-warning mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-warning">በማጣራት ላይ (Processing)</span>
                <IconClock size={20} stroke={2} className="text-warning" />
              </div>
              <div className="text-3xl font-extrabold text-warning tabular-nums tracking-tight">
                {stats.processing}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('PendingApproval')}
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'PendingApproval' 
                ? 'bg-surface-primary border-sky-500 shadow-md ring-1 ring-sky-500/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-sky-500/40 shadow-sm'
            }`}
          >
            {activeTab === 'PendingApproval' && <div className="absolute top-0 left-0 right-0 h-[4px] bg-sky-500"></div>}
            <div>
              <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  {stats.pendingApproval > 0 && <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>}
                  ለማጽደቅ የቀረቡ (Pending)
                </span>
                <IconShieldCheck size={20} stroke={2} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums tracking-tight">
                {stats.pendingApproval}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('Resolved')}
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${
              activeTab === 'Resolved' 
                ? 'bg-surface-primary border-success shadow-md ring-1 ring-success/20'
                : 'bg-surface-primary/90 border-border hover:bg-surface-primary hover:border-success/50 shadow-sm'
            }`}
          >
            {activeTab === 'Resolved' && <div className="absolute top-0 left-0 right-0 h-[4px] bg-success"></div>}
            <div>
              <div className="flex items-center justify-between text-success mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-success">የጸደቀ (Resolved)</span>
                <IconCheck size={20} stroke={2} className="text-success" />
              </div>
              <div className="text-3xl font-extrabold text-success tabular-nums tracking-tight">
                {stats.resolved}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-primary p-4 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
            {(['All', 'Accepted', 'PendingApproval', 'Processing', 'Resolved'] as StatusTab[]).map(tab => {
              const labels: Record<StatusTab, string> = {
                All: 'ሁሉም',
                Accepted: 'አዲስ (ምደባ)',
                PendingApproval: 'ለማጽደቅ',
                Processing: 'በማጣራት ላይ',
                Resolved: 'የተጠናቀቁ',
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive 
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-surface-secondary/80 text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-border/30'
                  }`}
                >
                  {labels[tab]}
                  {tab === 'PendingApproval' && stats.pendingApproval > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-brand-blue' : 'bg-brand-yellow text-zinc-900'}`}>
                      {stats.pendingApproval}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <IconSearch size={18} stroke={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ፈልግ (Search)..."
              className="w-full min-h-[44px] pl-11 pr-4 py-2 bg-surface-secondary border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="bg-surface-primary p-12 sm:p-16 rounded-3xl border border-border/20 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
              <IconFileText size={40} className="text-text-muted/40 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">ምንም ጉዳይ አልተገኘም</h3>
            <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
              በአሁኑ ወቅት በመረጡት ምድብ ወይም ፍለጋ ውስጥ ምንም የተመዘገበ ወይም ለማጽደቅ የቀረበ ቅሬታና ጥቆማ የለም።
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredTickets.map(ticket => {
              const badge = getStatusBadge(ticket.status);
              const timeline = getTimelineStatus(ticket);

              return (
                <div 
                  key={ticket.id}
                  onClick={() => handleTicketSelect(ticket)}
                  className={`p-5 rounded-3xl bg-surface-primary border transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                    ticket.status === 'PendingApproval'
                      ? 'border-sky-500/50 shadow-md ring-1 ring-sky-500/20 bg-gradient-to-br from-sky-500/5 via-surface-primary to-surface-primary'
                      : 'border-border/40 hover:border-border/80 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ticket.type === 'Suggestion'
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                        }`}>
                          {ticket.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-text-secondary bg-surface-secondary px-2.5 py-1 rounded-full border border-border/20">
                        #{ticket.trackingCode}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text-primary mb-2 line-clamp-1">
                      {ticket.subject || 'አልተገለጸም'}
                    </h3>
                    
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4 font-normal leading-relaxed">
                      {ticket.message}
                    </p>
                  </div>

                  <div>
                    <div className="p-3.5 bg-surface-secondary/50 rounded-2xl text-xs space-y-2.5 mb-4 border border-border/30">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="flex items-center gap-1 font-medium text-text-muted">
                          <IconUser size={14} /> አጣሪ ኮሚቴ፡
                        </span>
                        <span className="font-semibold text-text-primary truncate max-w-[150px]">
                          {ticket.assignedCommittee || 'አልተመደበም'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/30 pt-2.5">
                        <span className="flex items-center gap-1 font-medium text-text-muted">
                          <IconClock size={14} /> ቀሪ ጊዜ፡
                        </span>
                        <span className={`font-bold text-[11px] ${
                          timeline.isOverdue ? 'text-danger flex items-center gap-1 animate-pulse' :
                          timeline.isWarning ? 'text-warning font-bold' : 'text-text-primary'
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Ticket Detail Full Screen Modal View */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fadeIn overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-4 sm:px-10 sm:py-6 border-b border-border/40 flex items-center justify-between bg-surface-primary/95 backdrop-blur-md relative overflow-hidden shrink-0 shadow-sm">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-3 sm:gap-5 min-w-0">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2.5 rounded-2xl bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary hover:text-text-primary transition-all border border-border/40 shadow-xs flex items-center gap-2 text-xs sm:text-sm font-extrabold active:scale-95 shrink-0"
              >
                <IconArrowLeft size={18} />
                <span className="hidden sm:inline">ተመለስ (Back)</span>
              </button>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                    selectedTicket.type === 'Suggestion'
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                  }`}>
                    {selectedTicket.type === 'Suggestion' ? 'ጥቆማ (Suggestion)' : 'አቤቱታ (Complaint)'}
                  </span>
                  <span className="text-xs font-mono font-bold text-text-muted bg-surface-secondary px-2.5 py-0.5 rounded-md border border-border/30">
                    #{selectedTicket.trackingCode}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-text-primary leading-tight truncate">
                  {selectedTicket.subject || selectedTicket.institution || 'ዝርዝር መረጃ አልተገለጸም'}
                </h2>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTicket(null)}
              className="relative z-10 p-2.5 rounded-full bg-surface-secondary hover:bg-surface-secondary/80 text-text-muted hover:text-text-primary transition-all border border-border/40 shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0 ml-2"
              title="ዝጋ (Close)"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Full Screen Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 bg-surface-primary/40">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
              
              {/* Committee In-Progress Investigation Banner */}
              {(selectedTicket.status === 'Processing' || selectedTicket.status === 'RevisionRequested') && (
                <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-extrabold text-base sm:text-lg">
                        <IconClock size={24} className="text-amber-500 animate-spin" />
                        <span>በኮሚቴ በማጣራት ላይ ይገኛል (Under Investigation)</span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-text-primary font-bold flex items-center gap-2">
                          <IconUser size={18} className="text-amber-600 dark:text-amber-400" />
                          <span>የተመደቡ አጣሪ ኮሚቴዎች፡</span>
                          <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
                            {selectedTicket.assignedCommittee || 'አልተመደበም'}
                          </span>
                        </p>
                        
                        <p className="text-text-secondary text-xs flex items-center gap-2 pt-1 font-semibold">
                          <IconCalendar size={15} className="text-amber-500" />
                          <span>{getTimelineStatus(selectedTicket).label}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-primary/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-500/20 max-w-md shadow-xs">
                      <p className="text-xs text-text-secondary leading-relaxed font-medium flex items-start gap-2">
                        <span className="text-base">⏳</span>
                        <span>
                          <strong>የስራ ሂደት፡</strong> ኮሚቴው ማጣራቱን አጠናቆ የውሳኔ ሀሳብ (Proposal) ሲያቀርብ፣ የመጨረሻ ማጽደቂያው እዚህ ገጽ ላይ ለማጽደቅ ይዘጋጃል።
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.status === 'PendingApproval' && (
                <div className="p-5 sm:p-6 rounded-3xl bg-sky-500/5 border border-sky-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                  <div className="flex items-center gap-2.5 text-sky-700 dark:text-sky-300 font-extrabold text-base mb-4">
                    <IconShieldCheck size={24} className="text-sky-500" />
                    የውሳኔ ሀሳብ (Decision Proposal)
                  </div>
                  
                  <textarea
                    value={editableDecision}
                    onChange={(e) => setEditableDecision(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-primary p-4 sm:p-5 rounded-2xl border border-sky-500/30 leading-relaxed font-medium text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-sm resize-none transition-shadow"
                    placeholder="የውሳኔ ሀሳብ እዚህ ይጻፉ..."
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => handleRatify(selectedTicket)}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 min-h-[48px] px-6 bg-success hover:bg-success/90 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {actionLoading ? <IconLoader2 className="animate-spin" size={20} /> : <IconCheck size={20} />}
                      ያጽድቁ (Approve)
                    </button>
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto min-h-[48px] px-6 bg-warning hover:bg-warning/90 text-white font-bold rounded-2xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <IconEdit size={20} />
                      ማስተካከያ ይመልሱ
                    </button>
                  </div>
                </div>
              )}

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
                  <div className="p-2.5 bg-surface-primary rounded-xl shadow-sm border border-border/20 text-text-muted">
                    <IconUser size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">አመልካች</span>
                    <span className="font-extrabold text-text-primary text-sm">{selectedTicket.name || 'አልተገለጸም'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
                  <div className="p-2.5 bg-surface-primary rounded-xl shadow-sm border border-border/20 text-text-muted">
                    <IconPhone size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">ስልክ</span>
                    <span className="font-mono font-extrabold text-text-primary text-sm">{selectedTicket.phone || 'የለም'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
                  <div className="p-2.5 bg-surface-primary rounded-xl shadow-sm border border-border/20 text-text-muted">
                    <IconBuilding size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">ተቋም</span>
                    <span className="font-extrabold text-text-primary text-sm line-clamp-1">{selectedTicket.institution || 'አልተገለጸም'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
                  <div className="p-2.5 bg-surface-primary rounded-xl shadow-sm border border-border/20 text-text-muted">
                    <IconCalendar size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">ቀን</span>
                    <span className="font-extrabold text-text-primary text-sm">{selectedTicket.date}</span>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <IconFileText size={16} />
                  </div>
                  <h4 className="text-sm font-extrabold text-text-primary">ዝርዝር ይዘት (Message)</h4>
                </div>
                <div className="p-5 sm:p-8 rounded-3xl bg-surface-secondary/30 border border-border/40 text-text-primary font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-inner relative">
                  <div className="absolute top-6 left-0 w-1 h-12 bg-brand-blue/40 rounded-r-full"></div>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      <IconPaperclip size={16} />
                    </div>
                    <h4 className="text-sm font-extrabold text-text-primary">ማስረጃ ሰነዶች ({selectedTicket.attachments.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTicket.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-surface-secondary/40 hover:bg-surface-secondary border border-border/40 flex items-center justify-between transition-all hover:shadow-sm text-sm font-bold text-brand-blue group min-h-[56px]"
                      >
                        <span className="truncate max-w-[180px]">{att.filename}</span>
                        <div className="w-8 h-8 rounded-full bg-surface-primary flex items-center justify-center border border-border/20 shadow-sm group-hover:scale-110 transition-transform">
                          <IconExternalLink size={14} className="text-text-muted group-hover:text-brand-blue" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Resolution Box */}
              {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Rejected') && selectedTicket.resolution && (
                <div className="p-5 sm:p-6 rounded-3xl bg-success/10 border border-success/30 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <span className="text-sm font-extrabold text-success flex items-center gap-2 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <IconCheck size={16} />
                    </div>
                    የመጨረሻ ውሳኔ ምላሽ፡
                  </span>
                  <p className="text-text-primary font-medium text-sm leading-loose whitespace-pre-wrap relative z-10 pl-10 border-l-2 border-success/30 ml-4 py-1">
                    {selectedTicket.resolution.message}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Action Bar (Sticky Bottom) */}
          {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Rejected' && selectedTicket.status !== 'PendingApproval' && (
            <div className="p-4 sm:p-6 bg-surface-primary border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
              <div className="max-w-5xl mx-auto">
                {selectedTicket.status === 'Accepted' ? (
                  <button
                    onClick={() => setShowCommitteeModal(true)}
                    disabled={actionLoading}
                    className="w-full min-h-[50px] px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <IconUser size={20} />
                    ኮሚቴ መድብና አጣራ (Assign & Start)
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl w-full sm:w-auto shadow-xs">
                      <IconClock size={20} className="animate-spin text-amber-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-extrabold">
                        ኮሚቴው በማጣራት ላይ ነው — የውሳኔ ሀሳብ እስኪቀርብ ይጠበቃል
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setShowDirectModal(true)}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none min-h-[48px] px-5 py-2.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-bold text-xs sm:text-sm rounded-2xl border border-brand-blue/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <IconShieldCheck size={18} />
                        በቀጥታ ውሳኔ ይስጡ (Override)
                      </button>
                      <button
                        onClick={() => handleDirectResolve('Rejected')}
                        disabled={actionLoading}
                        className="min-h-[48px] px-5 py-2.5 bg-danger/10 hover:bg-danger/20 text-danger font-bold text-xs sm:text-sm rounded-2xl border border-danger/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <IconBan size={18} />
                        ውድቅ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Committee Assignment Modal with Phone Field */}
      {showCommitteeModal && selectedTicket && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-surface-primary w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl border border-border/30 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <IconUser size={20} />
                </div>
                ለኮሚቴ ይመድቡ
              </h3>
              <button onClick={() => setShowCommitteeModal(false)} className="p-2 bg-surface-secondary hover:bg-surface-secondary/80 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              ይህን አቤቱታ የሚያጣሩትን የኮሚቴ አባላት ስምና ስልክ ቁጥር ያስገቡ። "መደብና አጣራ" ሲሉ የ15 ቀናት ጊዜ ገደብ ይጀምራል።
            </p>

            <div className="space-y-5 overflow-y-auto flex-1 px-1 pb-4 hide-scrollbar">
              {committeeMembers.map((member, index) => (
                <div key={index} className="p-4 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">አባል {index + 1}</span>
                    {committeeMembers.length > 1 && (
                      <button
                        onClick={() => {
                          const newMembers = committeeMembers.filter((_, i) => i !== index);
                          setCommitteeMembers(newMembers);
                        }}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded-full transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        <IconX size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-text-primary mb-1.5 block">
                      የኮሚቴ አባል ስም *
                    </label>
                    <div className="relative">
                      <IconUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const newMembers = [...committeeMembers];
                          newMembers[index].name = e.target.value;
                          setCommitteeMembers(newMembers);
                        }}
                        className="block w-full min-h-[48px] rounded-2xl border border-border/50 bg-surface-primary pl-11 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="ሙሉ ስም ያስገቡ"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-text-primary mb-1.5 block">
                      ስልክ ቁጥር (አማራጭ)
                    </label>
                    <div className="relative">
                      <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => {
                          const newMembers = [...committeeMembers];
                          newMembers[index].phone = e.target.value;
                          setCommitteeMembers(newMembers);
                        }}
                        className="block w-full min-h-[48px] rounded-2xl border border-border/50 bg-surface-primary pl-11 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="09..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setCommitteeMembers([...committeeMembers, { name: '', phone: '' }])}
                className="w-full min-h-[48px] border-2 border-dashed border-brand-blue/30 text-brand-blue rounded-2xl text-sm font-bold hover:bg-brand-blue/5 transition-colors mt-4 flex items-center justify-center gap-2"
              >
                <span>+</span> ተጨማሪ አባል ያክሉ
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/30 mt-4">
              <button
                onClick={() => setShowCommitteeModal(false)}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary text-sm font-bold rounded-2xl border border-border/30 transition-colors"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                onClick={handleCommitteeAssign}
                disabled={actionLoading || !committeeMembers.some(m => m.name.trim())}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <IconLoader2 size={20} className="animate-spin" /> : <IconPlayerPlay size={20} />}
                {actionLoading ? 'በመመደብ ላይ...' : 'መደብና አጣራ (Start)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Order Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-surface-primary w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl border border-border/30 shadow-2xl space-y-5">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <IconEdit size={20} />
              </div>
              የማስተካከያ ትዕዛዝ መስጫ
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              ውሳኔውን ከማጽደቅዎ በፊት አጣሪ ኮሚቴው ምን ተጨማሪ ምርመራ፣ ማጣራት ወይም ማስተካከያ እንዲያደርግ እንደሚፈልጉ ያስገቡ።
            </p>
            <textarea
              rows={4}
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              placeholder="ለምሳሌ፡ የተቋሙ አስተያየትና ምላሽ በግልጽ አልተካተተም፤ ማስረጃው በደንብ ተጣርቶ ዳግም ይቅረብ..."
              className="w-full p-4 bg-surface-secondary border border-border/30 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warning/40 focus:border-warning text-text-primary placeholder:text-text-muted resize-none"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary text-sm font-bold rounded-2xl border border-border/30 transition-colors"
              >
                ተዉት (Cancel)
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={actionLoading || !revisionNotes.trim()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-warning hover:bg-warning/90 text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                ትዕዛዝ ያስተላልፉ (Send Revision Order)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Resolve Modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-surface-primary w-full max-w-lg p-6 rounded-t-3xl sm:rounded-3xl border border-border/30 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                <IconShieldCheck size={20} />
              </div>
              የመጨረሻ ውሳኔና ምላሽ መስጫ
            </h3>
            <p className="text-sm text-text-muted leading-relaxed shrink-0">
              ይህን ውሳኔ ሲሰጡ ጉዳዩ የመጨረሻ ውሳኔ እንዳገኘ ተቆጥሮ ለአመልካቹ መልእክት ይተላለፋል።
            </p>
            
            <div className="overflow-y-auto flex-1 space-y-5 px-1 py-1 hide-scrollbar">
              <div>
                <label className="text-sm font-bold text-text-primary block mb-2">የውሳኔው ማብራሪያና ምላሽ፡ *</label>
                <textarea
                  rows={5}
                  value={directMessage}
                  onChange={e => setDirectMessage(e.target.value)}
                  placeholder="ለአመልካቹ የሚሰጥ ዝርዝር የመጨረሻ ውሳኔና ምላሽ እዚህ ይጻፉ..."
                  className="w-full p-4 bg-surface-secondary border border-border/30 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder:text-text-muted resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-text-primary block mb-2">የውሳኔ ደብዳቤ ወይም ሰነድ አያይዙ (የተቻለ ከሆነ)፡</label>
                <input
                  type="file"
                  multiple
                  onChange={e => setDirectFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="w-full text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/30 shrink-0">
              <button
                onClick={() => setShowDirectModal(false)}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary text-sm font-bold rounded-2xl border border-border/30 transition-colors"
              >
                ተዉት (Cancel)
              </button>
              <button
                onClick={() => handleDirectResolve('Resolved')}
                disabled={actionLoading || !directMessage.trim()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-success hover:bg-success/90 text-white text-sm font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <IconLoader2 className="animate-spin" size={20} />}
                ውሳኔውን አጽድቀው ያጠናቅቁ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
