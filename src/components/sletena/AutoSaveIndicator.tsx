'use client';

import React from 'react';
import { AutoSaveStatus } from '@/lib/sletena/autoSave';
import { IconCheck, IconCloudDownload, IconLoader2, IconAlertCircle } from '@tabler/icons-react';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedTime?: string | null;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status, lastSavedTime }) => {
  if (status === 'idle' && !lastSavedTime) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary/50 border border-border/40 rounded-xl text-xs text-text-muted">
        <IconCloudDownload size={15} />
        <span>1 ሰከንድ ራስ-ሰር ማስቀመጫ ንቁ ነው</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-semibold text-blue-600 animate-pulse">
        <IconLoader2 size={15} className="animate-spin" />
        <span>በማስቀመጥ ላይ...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-600">
        <IconCheck size={15} />
        <span>ተቀምጧል {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-600">
      <IconAlertCircle size={15} />
      <span>በጊዚያዊ ድራፍት ተቀምጧል</span>
    </div>
  );
};
