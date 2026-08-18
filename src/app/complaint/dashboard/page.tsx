'use client';

import {
  IconSearch,
  IconCheck,
  IconBan,
  IconClock,
  IconUser,
  IconUsers,
  IconEye,
  IconFileText,
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconPaperclip,
  IconExternalLink,
  IconDownload,
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

type StatusTab = 'All' | 'NeedsAttention' | 'Accepted' | 'PendingApproval' | 'Processing' | 'Resolved';

function getDaysLeft(ticket: Complaint): number {
  if (ticket.status === 'Resolved' || ticket.status === 'Rejected') return 999;

  const rawDeadline = ticket.slaDeadlineRaw || (ticket.resolution as any)?.slaDeadline;
  if (rawDeadline) {
    const deadlineTime = new Date(rawDeadline).getTime();
    if (!isNaN(deadlineTime)) {
      const diffMs = deadlineTime - Date.now();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  const rawCreated = ticket.createdAtRaw;
  if (rawCreated) {
    const createdTime = new Date(rawCreated).getTime();
    if (!isNaN(createdTime)) {
      const deadlineMs = createdTime + 15 * 24 * 60 * 60 * 1000;
      const diffMs = deadlineMs - Date.now();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  return 15;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  New: { label: 'አዲስ የተመዘገበ', bg: 'bg-blue-500/10 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300 font-semibold', border: 'border-blue-500/20' },
  Accepted: { label: 'የተቀበሉት', bg: 'bg-blue-500/10 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300 font-semibold', border: 'border-blue-500/20' },
  Processing: { label: 'በኮሚቴ በማጣራት ላይ', bg: 'bg-amber-500/10 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300 font-semibold', border: 'border-amber-500/20' },
  PendingApproval: { label: 'ለማጽደቅ የቀረበ (ለመጽደቅ ዝግጁ)', bg: 'bg-sky-500/15 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300 font-bold', border: 'border-sky-500/40' },
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
  const [committeeMembers, setCommitteeMembers] = useState<{ name: string; role?: string; phone: string; email?: string }[]>([{ name: '', role: '', phone: '', email: '' }]);

  // Editable Decision State
  const [editableDecision, setEditableDecision] = useState('');

  const leaderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'የኮሚሽን ጽ/ቤት ሃላፊ (Leader)' : 'የኮሚሽን ጽ/ቤት ሃላፊ';

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
      setEditableDecision(ticket.resolution?.message || ticket.decisionIdeaSummary || 'የውሳኔ ሀሳቡ በኮሚሽን ጽ/ቤት ሃላፊ ተረጋግቶና ጸድቆ ተጠናቋል።');
    }
  };

  const handleCommitteeAssign = async () => {
    const validMembers = committeeMembers.filter(m => m.name.trim());
    if (!selectedTicket || validMembers.length === 0) return;
    setActionLoading(true);

    const assignedStr = validMembers.map(m => {
      const roleStr = m.role?.trim() ? ` [${m.role.trim()}]` : '';
      const info = [m.phone?.trim(), m.email?.trim()].filter(Boolean).join(', ');
      return `${m.name.trim()}${roleStr}${info ? ` (${info})` : ''}`;
    }).join('፣ ');
    const assigned = await complaintService.startProcessingByLeader(selectedTicket.id, leaderName, assignedStr, validMembers);
    if (assigned) {
      await fetchTickets();
      const updated = await complaintService.getComplaintById(selectedTicket.id);
      setSelectedTicket(updated);
      setShowCommitteeModal(false);
      setCommitteeMembers([{ name: '', role: '', phone: '', email: '' }]);
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
    const remainingDays = getDaysLeft(ticket);

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

    if (activeTab === 'NeedsAttention') return t.status !== 'Resolved' && t.status !== 'Rejected' && getDaysLeft(t) <= 5;
    if (activeTab === 'Accepted') return t.status === 'Accepted';
    if (activeTab === 'PendingApproval') return t.status === 'PendingApproval';
    if (activeTab === 'Processing') return t.status === 'Processing' || t.status === 'RevisionRequested';
    if (activeTab === 'Resolved') return t.status === 'Resolved' || t.status === 'Rejected';
    return t.status !== 'New';
  });

  const stats = {
    total: tickets.filter(t => t.status !== 'New').length,
    needsAttention: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Rejected' && getDaysLeft(t) <= 5).length,
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
      const resolutionMsg = editableDecision.trim() || ticket.resolution?.message || ticket.decisionIdeaSummary || 'የውሳኔ ሀሳቡ በኮሚሽን ጽ/ቤት ሃላፊ ተረጋግቶና ጸድቆ ተጠናቋል።';
      const success = await complaintService.approveDecisionByLeader(
        ticket.id,
        leaderName,
        resolutionMsg
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
        `${leaderName} (የኮሚሽን ጽ/ቤት ሃላፊ የቀጥታ ውሳኔ)`,
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
          <p className="text-sm text-text-secondary font-medium">የኮሚሽን ጽ/ቤት ሃላፊ ፖርታል በመጫን ላይ ነው...</p>
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
                የኮሚሽን ጽ/ቤት ሃላፊ
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shrink-0">
                Executive Portal
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block font-medium mt-0.5 truncate">
              የአባላት ጥቆማና አቤቱታ የመጨረሻ ግምገማና ውሳኔ ማጽደቂያ ስርዓት
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
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-sm transition-all ${feedbackMsg.type === 'success'
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
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${activeTab === 'Accepted'
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
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${activeTab === 'Processing'
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
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${activeTab === 'PendingApproval'
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
            className={`flex-none w-[280px] sm:w-auto snap-center p-5 rounded-3xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group ${activeTab === 'Resolved'
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
            {(['All', 'NeedsAttention', 'Accepted', 'PendingApproval', 'Processing', 'Resolved'] as StatusTab[]).map(tab => {
              const labels: Record<StatusTab, string> = {
                All: 'ሁሉም',
                NeedsAttention: '🔴 ትኩረት የሚሹ',
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
                  className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${isActive
                      ? tab === 'NeedsAttention' ? 'bg-red-600 text-white shadow-sm' : 'bg-brand-blue text-white shadow-sm'
                      : tab === 'NeedsAttention' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-surface-secondary/80 text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-border/30'
                    }`}
                >
                  {labels[tab]}
                  {tab === 'NeedsAttention' && stats.needsAttention > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-red-700' : 'bg-red-600 text-white'}`}>
                      {stats.needsAttention}
                    </span>
                  )}
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
                  className={`p-5 rounded-3xl bg-surface-primary border transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between active:scale-[0.98] ${ticket.status === 'PendingApproval'
                      ? 'border-sky-500/50 shadow-md ring-1 ring-sky-500/20 bg-gradient-to-br from-sky-500/5 via-surface-primary to-surface-primary'
                      : 'border-border/40 hover:border-border/80 shadow-sm'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ticket.type === 'Suggestion'
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                          }`}>
                          {ticket.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {Boolean((ticket.resolution as any)?.acknowledgedBySubmitter || (ticket.resolution as any)?.acknowledgedAt) && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                            <IconCheck size={13} stroke={3} /> ውሳኔ ደርሶታል
                          </span>
                        )}
                        {(() => {
                          const daysLeft = getDaysLeft(ticket);
                          if (daysLeft > 5 || ticket.status === 'Resolved' || ticket.status === 'Rejected') return null;
                          if (daysLeft <= 0) return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white animate-pulse border border-red-700">🔥 ጊዜው ያለፈበት!</span>;
                          if (daysLeft === 1) return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700 border border-red-300">🚨 1 ቀን ብቻ ቀረው!</span>;
                          if (daysLeft <= 3) return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">⚠️ {daysLeft} ቀናት ቀሩ!</span>;
                          return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏰ {daysLeft} ቀናት ቀሩ!</span>;
                        })()}
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
                        <span className={`font-bold text-[11px] ${timeline.isOverdue ? 'text-danger flex items-center gap-1 animate-pulse' :
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${selectedTicket.type === 'Suggestion'
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

                      <div className="space-y-2 text-sm">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-text-primary font-bold flex items-center gap-2">
                            <IconUser size={18} className="text-amber-600 dark:text-amber-400" />
                            <span>የተመደቡ አጣሪ ኮሚቴዎች፡</span>
                            <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
                              {selectedTicket.assignedCommittee || 'አልተመደበም'}
                            </span>
                          </p>

                          {(() => {
                            const rawMembers = selectedTicket.committeeMembers || (selectedTicket.resolution as any)?.committeeMembers || selectedTicket.groupMembers || [];
                            const members = Array.isArray(rawMembers) ? rawMembers : [];
                            if (members.length === 0) return null;
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">አባላት ({members.length})፦</span>
                                {members.map((m: any, idx: number) => (
                                  <span key={idx} className="px-2.5 py-0.5 bg-amber-500/10 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-semibold border border-amber-500/20">
                                    {typeof m === 'string' ? m : `${m.name}${m.role ? ` [${m.role}]` : ''}`}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

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

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5 text-sky-700 dark:text-sky-300 font-extrabold text-base">
                      <IconShieldCheck size={24} className="text-sky-500" />
                      የውሳኔ ሀሳብ (Decision Proposal)
                    </div>

                    {/* Committee Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold text-text-primary bg-surface-primary/90 px-3 py-1.5 rounded-xl border border-sky-500/20 shadow-2xs">
                      <IconUsers size={16} className="text-sky-500 shrink-0" />
                      <span>አጣሪ ኮሚቴ፡</span>
                      <span className="font-extrabold text-sky-700 dark:text-sky-300">
                        {selectedTicket.assignedCommittee || (selectedTicket.resolution as any)?.assignedCommittee || 'አልተመደበም'}
                      </span>
                    </div>
                  </div>

                  {/* Committee Members Sub-Bar */}
                  {(() => {
                    const rawMembers = selectedTicket.committeeMembers || (selectedTicket.resolution as any)?.committeeMembers || selectedTicket.groupMembers || [];
                    const members = Array.isArray(rawMembers) ? rawMembers : [];
                    if (members.length === 0) return null;
                    return (
                      <div className="mb-4 p-3 rounded-2xl bg-surface-primary/80 border border-sky-500/20 flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-text-muted flex items-center gap-1">
                          <IconUser size={14} className="text-sky-500" /> የኮሚቴ አባላት ({members.length}):
                        </span>
                        {members.map((m: any, idx: number) => {
                          if (typeof m === 'string') {
                            return (
                              <span key={idx} className="font-extrabold px-2.5 py-1 bg-surface-secondary text-text-primary rounded-lg border border-border/30 text-[11px]">
                                {m}
                              </span>
                            );
                          }
                          return (
                            <span key={idx} className="inline-flex items-center gap-1.5 font-extrabold px-2.5 py-1 bg-surface-secondary text-text-primary rounded-lg border border-border/30 text-[11px]">
                              <span>{m.name}</span>
                              {m.role && <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-extrabold">{m.role}</span>}
                              {(m.phone || m.email) && (
                                <span className="text-text-muted text-[10px] font-normal">
                                  ({[m.phone, m.email].filter(Boolean).join(', ')})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <textarea
                    value={editableDecision}
                    onChange={(e) => setEditableDecision(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-primary p-4 sm:p-5 rounded-2xl border border-sky-500/30 leading-relaxed font-medium text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-sm resize-none transition-shadow"
                    placeholder="የውሳኔ ሀሳብ እዚህ ይጻፉ..."
                  />

                  {(() => {
                    const proposalFiles: any[] =
                      (selectedTicket.resolution as any)?.decisionIdeaFiles ||
                      (selectedTicket.resolution as any)?.attachments ||
                      (selectedTicket.resolution as any)?.files ||
                      selectedTicket.decisionIdeaFiles ||
                      [];

                    if (proposalFiles.length === 0) return null;

                    return (
                      <div className="mt-4 p-4 rounded-2xl bg-surface-primary/80 border border-sky-500/20 space-y-2 relative z-10">
                        <h5 className="text-xs font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                          <IconPaperclip size={14} className="text-sky-500" /> በአጣሪ ኮሚቴው የቀረበ የውሳኔ ሰነድ ({proposalFiles.length})
                        </h5>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {proposalFiles.map((file: any, idx: number) => {
                            const fileUrl = complaintService.resolveFileUrl(file);
                            return (
                              <div
                                key={file.id || idx}
                                className="flex items-center gap-2 p-2 pl-3 bg-surface-secondary/70 hover:bg-surface-secondary text-brand-blue rounded-xl border border-sky-500/20 text-xs font-bold shadow-2xs transition-all"
                              >
                                <IconFileText size={16} className="text-sky-500 shrink-0" />
                                <span className="truncate max-w-[160px]" title={file.filename || file.name}>
                                  {file.filename || file.name || `ፋይል ${idx + 1}`}
                                </span>
                                {file.fileSize && <span className="text-[10px] text-text-muted">({file.fileSize})</span>}

                                <div className="flex items-center gap-1 ml-1 border-l border-border/30 pl-1.5">
                                  {/* Open in Browser */}
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(fileUrl, '_blank');
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-surface-primary text-text-muted hover:text-brand-blue transition-colors"
                                    title="ክፈት (Open)"
                                  >
                                    <IconExternalLink size={14} />
                                  </a>

                                  {/* Download file */}
                                  <a
                                    href={fileUrl}
                                    download={file.filename || file.name || 'document'}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      try {
                                        const res = await fetch(fileUrl);
                                        const blob = await res.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = blobUrl;
                                        a.download = file.filename || file.name || 'document';
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        URL.revokeObjectURL(blobUrl);
                                      } catch {
                                        window.open(fileUrl, '_blank');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-surface-primary text-text-muted hover:text-green-600 transition-colors"
                                    title="አውርድ (Download)"
                                  >
                                    <IconDownload size={14} />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => {
                        setDirectMessage(editableDecision || selectedTicket.resolution?.message || selectedTicket.decisionIdeaSummary || '');
                        setShowDirectModal(true);
                      }}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 min-h-[48px] px-6 bg-success hover:bg-success/90 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      <IconShieldCheck size={20} />
                      የመጨረሻ ውሳኔ ስጥ
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

              {/* Group Members Section */}
              {selectedTicket.submissionMode === 'በቡድን' && selectedTicket.groupMembers && selectedTicket.groupMembers.length > 0 && (
                <div className="p-5 rounded-3xl bg-surface-secondary/40 border border-border/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <IconUser size={18} className="text-brand-blue" />
                    <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
                      የቡድን አባላት ({selectedTicket.groupMembers.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTicket.groupMembers.map((m, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 bg-surface-primary text-text-primary rounded-xl text-xs font-semibold border border-border/40 shadow-xs">
                        {idx + 1}. {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
              {(() => {
                const submitterFiles: any[] = selectedTicket.attachments && selectedTicket.attachments.length > 0
                  ? selectedTicket.attachments
                  : ((selectedTicket as any).files || []);
                if (submitterFiles.length === 0) return null;

                return (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <IconPaperclip size={16} />
                      </div>
                      <h4 className="text-sm font-extrabold text-text-primary">ማስረጃ ሰነዶች ({submitterFiles.length})</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {submitterFiles.map((att: any, idx: number) => {
                        const fileUrl = complaintService.resolveFileUrl(att, selectedTicket.trackingCode);
                        const fileName = att.filename || att.name || `ሰነድ ${idx + 1}`;
                        return (
                          <div
                            key={att.id || idx}
                            className="p-4 rounded-2xl bg-surface-secondary/40 hover:bg-surface-secondary border border-border/40 flex items-center justify-between transition-all hover:shadow-sm text-sm font-bold text-brand-blue min-h-[56px]"
                          >
                            <span className="truncate max-w-[180px]" title={fileName}>{fileName}</span>
                            <div className="flex items-center gap-1.5 bg-surface-primary p-1.5 rounded-xl border border-border/20 shadow-2xs">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(fileUrl, '_blank');
                                }}
                                className="p-1 rounded-lg text-text-muted hover:text-brand-blue transition-colors"
                                title="ክፈት (Open)"
                              >
                                <IconExternalLink size={16} />
                              </a>
                              <a
                                href={fileUrl}
                                download={fileName}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    const res = await fetch(fileUrl);
                                    const blob = await res.blob();
                                    const blobUrl = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = blobUrl;
                                    a.download = fileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(blobUrl);
                                  } catch {
                                    window.open(fileUrl, '_blank');
                                  }
                                }}
                                className="p-1 rounded-lg text-text-muted hover:text-green-600 transition-colors"
                                title="አውርድ (Download)"
                              >
                                <IconDownload size={16} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Revision / Correction Requested Box */}
              {(selectedTicket.status === 'RevisionRequested' || Boolean((selectedTicket.resolution as any)?.adminInstructions || selectedTicket.adminInstructions || (selectedTicket.resolution as any)?.revisionNotes)) && (
                <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/40 relative overflow-hidden shadow-sm flex flex-col gap-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <span className="text-sm font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
                      <IconAlertTriangle size={18} />
                    </div>
                    የተጠየቀ ማስተካከያ / መመሪያ (Correction Request / Revision Feedback)፡
                  </span>
                  <p className="text-text-primary font-medium text-sm leading-relaxed whitespace-pre-wrap relative z-10 pl-10 border-l-2 border-amber-500/40 ml-4 py-1">
                    {(selectedTicket.resolution as any)?.adminInstructions || selectedTicket.adminInstructions || (selectedTicket.resolution as any)?.revisionNotes || 'እባክዎን የቀረበውን የውሳኔ ሀሳብ እንደገና አርመው ያቅርቡ።'}
                  </p>
                </div>
              )}

              {/* Final Resolution Box */}
              {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Rejected') && selectedTicket.resolution && (
                <div className="p-5 sm:p-6 rounded-3xl bg-success/10 border border-success/30 relative overflow-hidden shadow-sm flex flex-col gap-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  {/* Submitter Acknowledgment Badge inside Modal */}
                  {Boolean((selectedTicket.resolution as any)?.acknowledgedBySubmitter || (selectedTicket.resolution as any)?.acknowledgedAt) && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-extrabold w-fit relative z-10">
                      <IconCheck size={16} className="text-emerald-600 shrink-0" stroke={3} />
                      ውሳኔ ደርሶታል (በአመልካቹ ተረጋግጧል)
                    </div>
                  )}

                  <span className="text-sm font-extrabold text-success flex items-center gap-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <IconCheck size={16} />
                    </div>
                    የመጨረሻ ውሳኔ ምላሽ፡
                  </span>
                  <p className="text-text-primary font-medium text-sm leading-loose whitespace-pre-wrap relative z-10 pl-10 border-l-2 border-success/30 ml-4 py-1">
                    {selectedTicket.resolution.message}
                  </p>
                  {(() => {
                    const finalFiles: any[] =
                      (selectedTicket.resolution as any)?.attachments ||
                      (selectedTicket.resolution as any)?.finalDecisionFiles ||
                      (selectedTicket.resolution as any)?.files ||
                      [];

                    if (finalFiles.length === 0) return null;

                    return (
                      <div className="mt-2 pl-10 ml-4 relative z-10 space-y-2">
                        <p className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
                          <IconPaperclip size={14} /> ውሳኔ ሰነዶች ({finalFiles.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {finalFiles.map((file: any, idx: number) => {
                            const fileUrl = complaintService.resolveFileUrl(file);
                            return (
                              <a
                                key={file.id || idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(fileUrl, '_blank');
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-surface-primary hover:bg-surface-secondary text-brand-blue rounded-xl border border-success/30 text-xs font-semibold shadow-2xs transition-colors group cursor-pointer"
                              >
                                <IconFileText size={14} className="text-success shrink-0" />
                                <span className="truncate max-w-[180px]">{file.filename || file.name || `ፋይል ${idx + 1}`}</span>
                                <IconExternalLink size={12} className="text-text-muted group-hover:text-brand-blue transition-colors shrink-0 ml-1" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>

          {/* Action Bar (Sticky Bottom) */}
          {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Rejected' && selectedTicket.status !== 'PendingApproval' && (
            <div className="p-4 sm:p-6 bg-surface-primary border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
              <div className="max-w-5xl mx-auto">
                {selectedTicket.status === 'Accepted' ? (
                  <div className="flex items-center gap-3 text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-5 py-3.5 rounded-2xl w-full shadow-xs">
                    <IconEye size={22} className="shrink-0 text-brand-blue" />
                    <span className="text-xs sm:text-sm font-extrabold">
                      ለእይታ ብቻ የቀረበ ቅሬታ (View Only) — ኮሚቴው ማጣራቱን አጠናቆ የውሳኔ ሀሳብ (Decision Proposal) ሲያቀርብ፣ እዚህ ገጽ ላይ ማጽደቂያው ይቀርባል።
                    </span>
                  </div>
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
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-success hover:bg-success/90 text-white text-sm font-extrabold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <IconLoader2 className="animate-spin" size={20} /> : <IconShieldCheck size={20} />}
                የመጨረሻ ውሳኔ ስጥ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
