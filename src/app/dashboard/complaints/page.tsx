'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconMessagePlus, IconSearch, IconAdjustmentsHorizontal, IconBulb, IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";

type TicketType = 'tiqoma' | 'abetuta';
type TicketStatus = 'New' | 'Under Review' | 'Resolved' | 'Rejected';

interface Ticket {
  id: string;
  category: TicketType;
  title: string;
  desc: string;
  status: TicketStatus;
  time: string;
  name: string;
}

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<TicketType>('tiqoma');

  const tickets: Ticket[] = [
    { id: '#501', category: 'tiqoma', title: 'Online Portal Suggestion', desc: 'It would be great if users could track their application status in real-time.', status: 'New', time: '30 mins ago', name: 'Dawit S.' },
    { id: '#500', category: 'tiqoma', title: 'Multilingual Form Support', desc: 'Add Afaan Oromo option to all citizen-facing forms.', status: 'Under Review', time: '2 days ago', name: 'Fatuma A.' },
    { id: '#498', category: 'tiqoma', title: 'Extended Office Hours', desc: 'Consider opening until 6PM on weekdays to serve working citizens.', status: 'Resolved', time: '5 days ago', name: 'Meseret K.' },
    { id: '#496', category: 'tiqoma', title: 'Spam Entry', desc: 'Test message, please ignore.', status: 'Rejected', time: '1 week ago', name: 'Unknown' },
    { id: '#492', category: 'abetuta', title: 'Building Maintenance Issue', desc: 'Water leak on the 2nd floor restroom facilities needs urgent attention.', status: 'New', time: '2 hours ago', name: 'Anonymous' },
    { id: '#491', category: 'abetuta', title: 'Document Request Delay', desc: 'Requested archives from 2024 are still pending approval after 3 months.', status: 'Under Review', time: '1 day ago', name: 'Sara M.' },
    { id: '#489', category: 'abetuta', title: 'Staff Misconduct Report', desc: 'Rude behavior experienced at the South branch reception desk.', status: 'Resolved', time: '3 days ago', name: 'Tesfaye G.' },
    { id: '#488', category: 'abetuta', title: 'Duplicate Complaint', desc: 'This is a duplicate of #487.', status: 'Rejected', time: '1 week ago', name: 'System' },
  ];

  const filteredTickets = tickets.filter(t => t.category === activeTab);
  const statuses: TicketStatus[] = ['New', 'Under Review', 'Resolved', 'Rejected'];

  const statusColors: Record<TicketStatus, string> = {
    'New': 'bg-brand-blue',
    'Under Review': 'bg-brand-yellow',
    'Resolved': 'bg-success',
    'Rejected': 'bg-danger',
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ጥቆማ እና አቤቱታ</h1>
            <p className="text-sm text-text-muted mt-1">Manage citizen suggestions and formal complaints.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search submissions..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors" />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              <IconAdjustmentsHorizontal size={18} />
            </button>
            <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconMessagePlus size={18} />
              Export Data
            </button>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 bg-surface-primary/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/20 w-fit">
          <button
            onClick={() => setActiveTab('tiqoma')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'tiqoma'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
            }`}
          >
            <IconBulb size={18} stroke={activeTab === 'tiqoma' ? 2 : 1.5} />
            ጥቆማ (Suggestions)
            <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === 'tiqoma' ? 'bg-white/20 text-white' : 'bg-surface-secondary text-text-primary'}`}>
              {tickets.filter(t => t.category === 'tiqoma').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('abetuta')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'abetuta'
                ? 'bg-brand-yellow text-[#3D352E] shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
            }`}
          >
            <IconAlertTriangle size={18} stroke={activeTab === 'abetuta' ? 2 : 1.5} />
            አቤቱታ (Complaints)
            <span className={`ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === 'abetuta' ? 'bg-[#3D352E]/15 text-[#3D352E]' : 'bg-surface-secondary text-text-primary'}`}>
              {tickets.filter(t => t.category === 'abetuta').length}
            </span>
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10">
          {statuses.map(statusColumn => {
            const columnTickets = filteredTickets.filter(t => t.status === statusColumn);
            return (
              <div key={statusColumn} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[statusColumn]}`}></span>
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">{statusColumn}</h3>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-surface-secondary flex items-center justify-center text-[10px] font-bold text-text-primary">
                    {columnTickets.length}
                  </span>
                </div>
                {columnTickets.length === 0 && (
                  <div className="border-2 border-dashed border-border/20 rounded-3xl p-6 flex items-center justify-center">
                    <span className="text-xs text-text-muted">No items</span>
                  </div>
                )}
                {columnTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} activeTab={activeTab} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TicketCard({ ticket, activeTab }: { ticket: Ticket; activeTab: TicketType }) {
  const accentColor = activeTab === 'tiqoma' ? 'brand-blue' : 'brand-yellow';
  const accentTextHover = activeTab === 'tiqoma' ? 'group-hover:text-brand-blue' : 'group-hover:text-brand-yellow';

  return (
    <div className="bg-surface-primary/30 border border-border/20 rounded-3xl p-5 backdrop-blur-sm hover:bg-surface-primary/50 transition-all duration-200 cursor-pointer flex flex-col gap-3 group hover:border-border/40">
      <div className="flex justify-between items-start">
        <span className={`text-xs font-medium text-${accentColor}`}>{ticket.id}</span>
        <span className="text-[10px] text-text-muted">{ticket.time}</span>
      </div>
      <div>
        <h4 className={`text-sm font-medium text-text-primary mb-1 ${accentTextHover} transition-colors leading-tight`}>{ticket.title}</h4>
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{ticket.desc}</p>
      </div>
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/10">
        <span className="text-[11px] font-medium text-text-secondary">{ticket.name}</span>
      </div>
    </div>
  );
}
