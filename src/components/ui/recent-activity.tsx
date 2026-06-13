import React from 'react';

const activities = [
  { 
    id: '#8942', 
    date: '12/04/2026 16:22', 
    user: 'Abebe B.',
    type: 'PUBLISH', 
    module: 'News', 
    target: 'Press Release',
    message: 'New press release regarding the annual commission meeting has been successfully published to the main portal.' 
  },
  { 
    id: '#8941', 
    date: '11/04/2026 14:05', 
    user: 'System',
    type: 'UPLOAD', 
    module: 'Documents', 
    target: 'Q3_Report.pdf',
    message: 'Document Q3_Report.pdf was automatically synced from the central repository. File size is 4.2MB.' 
  },
  { 
    id: '#8940', 
    date: '11/04/2026 10:15', 
    user: 'Chala D.',
    type: 'APPROVE', 
    module: 'QR Requests', 
    target: 'Access ID: 4912',
    message: 'Visitor access request for Chala D. has been approved for Building A, Floor 3.' 
  },
  { 
    id: '#8939', 
    date: '10/04/2026 09:30', 
    user: 'Unknown',
    type: 'SUBMIT', 
    module: 'Complaints', 
    target: 'Ticket #492',
    message: 'Anonymous complaint received regarding building maintenance on the 2nd floor restroom facilities.' 
  },
];

export const RecentActivity = () => {
  return (
    <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md mb-8">
      <div className="p-8 pb-6 flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-xl font-light text-text-primary tracking-tight">Recent Operations</h2>
        </div>
        <button className="text-xs font-semibold text-text-primary bg-surface-secondary/50 hover:bg-surface-secondary px-5 py-2.5 rounded-full transition-colors border border-border/30">View All</button>
      </div>
      
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
              <th className="font-semibold py-4 px-4 pl-6">ID & User</th>
              <th className="font-semibold py-4 px-4">Action</th>
              <th className="font-semibold py-4 px-4">Target</th>
              <th className="font-semibold py-4 px-4 pr-6">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                <td className="py-5 px-4 pl-6 align-top w-40">
                  <div className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{activity.id}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.user}</div>
                </td>
                <td className="py-5 px-4 align-top w-40">
                  <div className="text-[11px] font-bold text-text-primary tracking-wider uppercase">{activity.type}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.module}</div>
                </td>
                <td className="py-5 px-4 align-top w-48">
                  <div className="text-sm font-medium text-text-secondary">{activity.target}</div>
                </td>
                <td className="py-5 px-4 pr-6 align-top">
                  <div className="text-sm text-text-muted group-hover:text-text-secondary transition-colors leading-relaxed">
                    {activity.message}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
