'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBooks, IconChevronDown, IconFileAnalytics, IconForms } from '@tabler/icons-react';

interface SletenaNavGroupProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

export const SletenaNavGroup: React.FC<SletenaNavGroupProps> = ({ isCollapsed = false, onItemClick }) => {
  const pathname = usePathname();
  const isSletenaActive = pathname.startsWith('/dashboard/sletena');
  const [isOpen, setIsOpen] = useState(isSletenaActive);

  useEffect(() => {
    if (isSletenaActive) {
      setIsOpen(true);
    }
  }, [pathname, isSletenaActive]);

  const subItems = [
    {
      label: 'የስልጠና ፍላጎት',
      href: '/dashboard/sletena/yesltena-flagot',
      icon: IconForms,
    },
    {
      label: 'የስልጠና ዕርካታ',
      href: '/dashboard/sletena/yesltena-erkata',
      icon: IconFileAnalytics,
    },
  ];

  if (isCollapsed) {
    return (
      <div className="relative group">
        <Link
          href="/dashboard/sletena/yesltena-flagot"
          title="📚 ስልጠና"
          onClick={onItemClick}
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
            isSletenaActive
              ? 'bg-surface-secondary/80 text-text-primary shadow-sm border border-border/50'
              : 'text-text-secondary hover:bg-surface-secondary/50 hover:text-text-primary'
          }`}
        >
          <IconBooks size={20} className={isSletenaActive ? 'text-brand-blue' : 'text-text-muted'} />
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
          isSletenaActive
            ? 'bg-surface-secondary/60 text-text-primary border border-border/40 font-semibold'
            : 'text-text-secondary hover:bg-surface-secondary/40 hover:text-text-primary border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <IconBooks
            size={20}
            className={isSletenaActive ? 'text-brand-blue' : 'text-text-muted group-hover:text-text-primary transition-colors'}
          />
          <span className="text-[13px] font-medium">📚 ስልጠና</span>
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
            const isActive = pathname === sub.href;
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
