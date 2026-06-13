'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { IconDashboard, IconNews, IconFileText, IconUsers, IconMessage2, IconSettings, IconLanguage, IconSun, IconMoon, IconClipboardCheck, IconQrcode, IconChartBar } from '@tabler/icons-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Persist theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString(language === 'en' ? 'en-US' : 'am-ET', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit' 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [language]);

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

  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { label: t('dashboard'), icon: IconDashboard, href: '/dashboard' },
    { label: t('news'), icon: IconNews, href: '/dashboard/news' },
    { label: t('documents'), icon: IconFileText, href: '/dashboard/documents' },
    { label: 'QR Access', icon: IconQrcode, href: '/dashboard/qr-access' },
    { label: t('personnel'), icon: IconUsers, href: '/dashboard/personnel' },
    { label: t('complaints'), icon: IconMessage2, href: '/dashboard/complaints' },
    { label: 'Statistics', icon: IconChartBar, href: '/dashboard/statistics' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-brand-blue/20">
      {/* Sidebar */}
      <aside 
        className={`border-r border-border/50 bg-surface-primary/50 backdrop-blur-md flex flex-col relative z-30 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      >
        {/* Floating Sidebar Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-14 bg-surface-primary border border-border/50 shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-brand-blue hover:border-brand-blue/30 transition-all z-40 group cursor-pointer"
        >
          <div className={`transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCollapsed ? 'rotate-180' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-current">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        </button>

        <div className={`p-4 flex items-center h-[88px] shrink-0 ${isCollapsed ? 'justify-center' : 'px-8'}`}>
          <div className="font-heading text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-brand-blue to-brand-yellow/80 flex items-center justify-center text-white text-sm shadow-md">
              <IconDashboard size={22} stroke={2} />
            </span>
            {!isCollapsed && <span>CIDMS</span>}
          </div>
        </div>

        <nav className={`flex-1 py-4 space-y-1.5 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-brand-blue/10 text-brand-blue shadow-[inset_3px_0_0_0_#014BAA]'
                    : 'text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
              >
                <item.icon 
                  size={22} 
                  stroke={isActive ? 2 : 1.5} 
                  className={isActive ? 'text-brand-blue' : 'text-text-muted group-hover:text-text-primary transition-colors'}
                />
                {!isCollapsed && <span className={`font-medium ${isActive ? 'text-brand-blue' : ''}`}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className={`p-4 border-t border-border/50 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-0 mt-2' : 'px-3 mt-2'}`}>
            <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center border border-border/50 shrink-0 shadow-sm">
              <span className="text-xs font-bold text-text-primary">AD</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-sm font-semibold text-text-primary">Administrator</span>
                <span className="text-[11px] text-text-muted mt-0.5">CIDMS Office</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[url('/noise.png')] bg-repeat opacity-100 relative">
        {/* Top Navigation Bar */}
        <header className="h-[88px] shrink-0 flex items-center justify-between px-10 relative z-20">
          <div></div>
          <div className="flex items-center gap-1 bg-surface-primary/60 backdrop-blur-md p-1.5 rounded-full border border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <Link 
              href="/dashboard/settings"
              className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title="Settings"
            >
              <IconSettings size={18} stroke={2} />
            </Link>
            <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')} 
              className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all text-xs font-bold tracking-wider"
              title="Toggle Language"
            >
              {language === 'en' ? 'AM' : 'EN'}
            </button>
            <div className="w-[1px] h-4 bg-border/50"></div>
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title="Toggle Theme"
            >
              {isDark ? <IconSun size={18} stroke={2} /> : <IconMoon size={18} stroke={2} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10" id="main-content">
          <div className="min-h-full pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
