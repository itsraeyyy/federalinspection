'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconFileDescription, IconChevronDown, IconPencil, IconHistory } from '@tabler/icons-react';

interface ReportNavGroupProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
  allowedModuleIds?: string[];
}

export const ReportNavGroup: React.FC<ReportNavGroupProps> = ({
  isCollapsed = false,
  onItemClick,
  allowedModuleIds,
}) => {
  const pathname = usePathname();
  const isReportActive =
    pathname === '/dashboard/forms' ||
    pathname.startsWith('/dashboard/admin/forms') ||
    pathname.startsWith('/dashboard/reports-history');

  const [isOpen, setIsOpen] = useState(isReportActive);

  useEffect(() => {
    if (isReportActive) {
      setIsOpen(true);
    }
  }, [pathname, isReportActive]);

  const allSubItems = [
    {
      id: 'forms',
      label: 'ሪፖርት',
      href: '/dashboard/forms',
      icon: IconFileDescription,
    },
    {
      id: 'admin_forms',
      label: 'የቅጽ ማስተካከያ',
      href: '/dashboard/admin/forms',
      icon: IconPencil,
    },
    {
      id: 'forms', // or reports-history
      label: 'የሪፖርት ታሪክ',
      href: '/dashboard/reports-history',
      icon: IconHistory,
    },
  ];

  // Filter sub-items if allowedModuleIds is provided
  const subItems = allowedModuleIds
    ? allSubItems.filter(
        (sub) => allowedModuleIds.includes(sub.id) || allowedModuleIds.includes('all')
      )
    : allSubItems;

  if (subItems.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="relative group">
        <Link
          href="/dashboard/forms"
          title="📋 ሪፖርት"
          onClick={onItemClick}
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
            isReportActive
              ? 'bg-surface-secondary/80 text-text-primary shadow-sm border border-border/50'
              : 'text-text-secondary hover:bg-surface-secondary/50 hover:text-text-primary'
          }`}
        >
          <IconFileDescription size={20} className={isReportActive ? 'text-brand-blue' : 'text-text-muted'} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Primary Menu Item */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isReportActive
            ? 'bg-surface-secondary/60 text-text-primary border border-border/40 font-semibold'
            : 'text-text-secondary hover:bg-surface-secondary/40 hover:text-text-primary border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <IconFileDescription
            size={20}
            className={isReportActive ? 'text-brand-blue' : 'text-text-muted group-hover:text-text-primary transition-colors'}
          />
          <span className="text-[13px] font-medium">📋 ሪፖርት</span>
        </div>
        <IconChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Sub-items list */}
      {isOpen && (
        <div className="pl-4 space-y-1 border-l-2 border-border/40 ml-4 py-1">
          {subItems.map((sub) => {
            const isActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onItemClick}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue font-semibold border border-brand-blue/20'
                    : 'text-text-secondary hover:bg-surface-secondary/50 hover:text-text-primary'
                }`}
              >
                <sub.icon size={16} className={isActive ? 'text-brand-blue' : 'text-text-muted'} />
                <span>{sub.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
