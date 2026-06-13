'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconQrcode, IconCheck, IconX, IconDeviceMobile, IconHistory, IconRefresh, IconClock, IconFileText } from "@tabler/icons-react";
import { useState } from "react";

export default function QRAccessPage() {
  const [qrExpiry, setQrExpiry] = useState('24h');

  const pendingRequests = [
    { id: 'REQ-4912', requester: 'Unknown Device (iPhone 13)', file: 'Annual_Budget_2026.pdf', time: '10 mins ago', ip: '197.156.12.4' },
    { id: 'REQ-4911', requester: 'Desktop (Chrome/Windows)', file: 'Commission_Bylaws.pdf', time: '1 hour ago', ip: '196.189.102.11' },
    { id: 'REQ-4910', requester: 'Android (Samsung S24)', file: 'Q3_Performance_Report.docx', time: '3 hours ago', ip: '197.156.44.8' },
  ];

  const auditLog = [
    { id: 'REQ-4909', file: 'Q3_Report.pdf', status: 'Approved', approver: 'Dr. Abebe', duration: '24 Hours', time: 'Today 10:30 AM' },
    { id: 'REQ-4908', file: 'HR_Policies_Draft.docx', status: 'Denied', approver: 'System Admin', duration: '-', time: 'Yesterday 04:15 PM' },
    { id: 'REQ-4907', file: 'Meeting_Minutes_Sept.pdf', status: 'Approved', approver: 'Helen T.', duration: '7 Days', time: 'Oct 11, 2026' },
    { id: 'REQ-4906', file: 'Budget_Allocation_v3.xlsx', status: 'Approved', approver: 'Dr. Abebe', duration: '48 Hours', time: 'Oct 10, 2026' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">QR Access Management</h1>
            <p className="text-sm text-text-muted mt-1">Generate QR codes for document access and manage scan requests.</p>
          </div>
        </div>

        {/* QR Code Generator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active QR Display */}
          <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col items-center gap-6">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Active QR Code</div>
            {/* QR Code Visual */}
            <div className="w-48 h-48 rounded-2xl bg-white border border-border/30 flex items-center justify-center p-4 shadow-sm">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-[2px]">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={`rounded-[2px] ${
                    [0,1,2,5,6,7,8,15,16,23,24,31,32,39,40,47,48,55,56,57,58,61,62,63,
                     14,9,10,17,22,25,30,33,38,41,46,49,54,53,
                     3,4,11,12,13,19,20,21,26,27,28,29,34,35,36,37,42,43,44,45,50,51,52,59,60].includes(i)
                      ? 'bg-[#1a1a2e]' : 'bg-transparent'
                  }`}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <IconClock size={14} />
              <span>Expires in <span className="text-text-primary font-semibold">{qrExpiry === '24h' ? '23h 42m' : qrExpiry === '7d' ? '6d 23h' : '29d'}</span></span>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <select
                value={qrExpiry}
                onChange={e => setQrExpiry(e.target.value)}
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer text-center font-medium"
              >
                <option value="24h">Valid for 24 Hours</option>
                <option value="7d">Valid for 7 Days</option>
                <option value="30d">Valid for 30 Days</option>
              </select>
              <button className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-sm">
                <IconRefresh size={16} stroke={2} />
                Regenerate QR Code
              </button>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                Pending Scan Requests ({pendingRequests.length})
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:bg-surface-primary/50 transition-colors">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-warning/50"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-text-muted">
                        <IconDeviceMobile size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">{req.requester}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <IconFileText size={12} className="text-text-muted" />
                          <span className="text-xs text-brand-blue font-medium">{req.file}</span>
                          <span className="text-[10px] text-text-muted">• IP: {req.ip}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-muted mr-2">{req.time}</span>
                      <button className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        <IconCheck size={14} stroke={3} />
                        Approve
                      </button>
                      <button className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        <IconX size={14} stroke={3} />
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
            <IconHistory size={16} className="text-text-muted" />
            Approval Audit Log
          </h2>
          <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
                  <th className="font-semibold py-4 px-6">Request ID</th>
                  <th className="font-semibold py-4 px-4">File</th>
                  <th className="font-semibold py-4 px-4">Status & Duration</th>
                  <th className="font-semibold py-4 px-6 text-right">Approver / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {auditLog.map((log, i) => (
                  <tr key={i} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                    <td className="py-4 px-6 text-sm font-medium text-text-primary">{log.id}</td>
                    <td className="py-4 px-4 text-sm text-text-secondary">{log.file}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Approved' ? 'bg-success' : 'bg-danger'}`}></span>
                        <span className="text-xs font-medium text-text-primary">{log.status}</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">{log.duration !== '-' ? `Valid for ${log.duration}` : 'Access blocked'}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-xs font-medium text-text-primary">{log.approver}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{log.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
