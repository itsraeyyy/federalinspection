'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { IconDashboard, IconNews, IconFileText, IconUsers, IconMessage2, IconSettings, IconSun, IconMoon, IconClipboardCheck, IconQrcode, IconChartBar, IconMessageStar, IconLogout, IconShieldCheck, IconChartDots, IconFileDescription, IconMenu2, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/lib/hooks/useAdmin';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();
  const { profile } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

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

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'ዳሽቦርድ', icon: IconDashboard, href: '/dashboard' },
    { label: 'ዜና', icon: IconNews, href: '/dashboard/news', id: 'news' },
    { label: 'ሰነዶች', icon: IconFileText, href: '/dashboard/documents', id: 'documents' },
    { label: 'የህዝብ ፋይሎች', icon: IconFileText, href: '/dashboard/files', id: 'public-files' },
    { label: 'QR መዳረሻ', icon: IconQrcode, href: '/dashboard/qr-access', id: 'qr-access' },
    { label: 'የአመራር አካላት', icon: IconUsers, href: '/dashboard/personnel', id: 'personnel' },
    { label: 'ጥቆማ እና አቤቱታ', icon: IconMessage2, href: '/dashboard/complaints', id: 'complaints' },
    { label: 'ምዘና', icon: IconClipboardCheck, href: '/dashboard/assessment', id: 'assessment' },
    { label: 'አስተያየት', icon: IconMessageStar, href: '/dashboard/feedback', id: 'feedback' },
    { label: 'መረጃ', icon: IconChartBar, href: '/dashboard/statistics', id: 'statistics' },
    { label: 'ቅጾች', icon: IconFileDescription, href: '/dashboard/forms', id: 'forms' },
    { label: 'አስተዳዳሪዎች', icon: IconShieldCheck, href: '/dashboard/admins', id: 'admins' },
  ];

  const allowedNavItems = navItems.filter(item => {
    // If they have full access, allow everything
    if (profile?.access_level === 'all' || profile?.role === 'super_admin') return true;

    // Otherwise, check if the item's id is in their modules array
    if (profile?.access_level === 'specific' && item.id) {
      return profile.modules?.includes(item.id);
    }

    return false;
  });

  useEffect(() => {
    if (pathname === '/dashboard' && profile) {
      if (profile.access_level !== 'all' && profile.role !== 'super_admin') {
        const firstAllowed = allowedNavItems.find(i => i.href !== '/dashboard');
        if (firstAllowed) {
          router.replace(firstAllowed.href);
        }
      }
    }
  }, [pathname, profile, allowedNavItems, router]);

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-brand-blue/20 overflow-hidden">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full border-r border-border/50 bg-surface-primary md:bg-surface-primary/50 backdrop-blur-md flex flex-col z-50 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:transition-all ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-[72px]' : 'md:w-[280px] w-[280px]'}`}
      >
        <button className="md:hidden absolute top-6 right-4 p-2 text-text-muted hover:text-text-primary" onClick={() => setMobileMenuOpen(false)}>
          <IconX size={20} />
        </button>

        {/* Floating Sidebar Toggle (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-14 bg-surface-primary border border-border/50 shadow-sm rounded-full items-center justify-center text-text-muted hover:text-brand-blue hover:border-brand-blue/30 transition-all z-40 group cursor-pointer"
        >
          <div className={`transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCollapsed ? 'rotate-180' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-current">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        </button>

        <div className={`p-4 flex items-center h-[88px] shrink-0 ${isCollapsed ? 'justify-center' : 'px-8'}`}>
          <div className="font-heading font-bold text-text-primary tracking-tight flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="relative w-10 h-10 min-w-[40px] rounded-full overflow-hidden border border-border/50">
              <Image src="/logo.jpg" alt="Commission Logo" fill className="object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm leading-tight">መቆጣጠርያ</span>
                <span className="text-xs text-text-muted leading-tight">ፖርታል</span>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto py-6 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {!isCollapsed && (
            <div className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              {t('quickAccess')}
            </div>
          )}
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-surface-secondary/80 text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:bg-surface-secondary/50 hover:text-text-primary border border-transparent'
                  } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
              >
                <item.icon
                  size={20}
                  stroke={isActive ? 2 : 1.5}
                  className={isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary transition-colors'}
                />
                {!isCollapsed && <span className={`text-[13px] font-medium ${isActive ? 'text-text-primary' : ''}`}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className={`p-4 mt-auto border-t border-border/50 shrink-0`}>
          <button className={`w-full flex items-center gap-3 rounded-xl hover:bg-surface-secondary/80 transition-all border border-transparent hover:border-border/50 ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}`}>
            <div className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center border border-border/50 shrink-0 shadow-sm">
              <span className="text-xs font-bold text-text-primary">AD</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex flex-col items-start overflow-hidden whitespace-nowrap flex-1">
                  <span className="text-[13px] font-semibold text-text-primary">{profile?.first_name || t('administrator')}</span>
                  <span className="text-[11px] text-text-muted mt-0.5">{profile?.email || 'cidms@office.gov'}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0">
                  <path d="M8 9l4-4 4 4" />
                  <path d="M16 15l-4 4-4-4" />
                </svg>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden opacity-100 relative">
        {/* Top Navigation Bar */}
        <header className="h-[72px] md:h-[88px] shrink-0 flex items-center justify-between px-4 md:px-10 relative z-20">
          <div>
            <div className="md:hidden flex items-center gap-2">
              <div className="relative w-8 h-8 min-w-[32px] rounded-full overflow-hidden border border-border/50">
                <Image src="/logo.jpg" alt="Commission Logo" fill className="object-cover" />
              </div>
              <span className="text-sm font-bold text-text-primary">ፖርታል</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-primary/60 backdrop-blur-md p-1.5 rounded-full border border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <Link
              href="/dashboard/settings"
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title={t('settings')}
            >
              <IconSettings size={18} stroke={2} />
            </Link>
            <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
            <Link
              href="/dashboard/analytics"
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title={t('analytics')}
            >
              <IconChartDots size={18} stroke={2} />
            </Link>
            <div className="w-[1px] h-4 bg-border/50"></div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-surface-secondary/80 hover:text-text-primary text-text-secondary transition-all"
              title={t('toggleTheme')}
            >
              {isDark ? <IconSun size={18} stroke={2} /> : <IconMoon size={18} stroke={2} />}
            </button>
            <div className="w-[1px] h-4 bg-border/50"></div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center rounded-full hover:bg-red-50 hover:text-red-600 text-text-secondary transition-all"
              title="Sign Out"
            >
              <IconLogout size={18} stroke={2} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-10 pb-20 md:pb-0" id="main-content">
          <div className="max-w-7xl mx-auto min-h-full pb-6 md:pb-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-primary/95 backdrop-blur-md border-t border-border/50 z-40 px-2 py-2 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe w-full">
        {allowedNavItems.find(i => i.id === 'news') && (
          <Link href="/dashboard/news" className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 ${pathname.includes('/news') ? 'text-brand-blue' : 'text-text-muted hover:text-text-primary'}`}>
            <IconNews size={22} stroke={pathname.includes('/news') ? 2 : 1.5} />
            <span className="text-[10px] font-medium">ዜና</span>
          </Link>
        )}
        {allowedNavItems.find(i => i.id === 'documents') && (
          <Link href="/dashboard/documents" className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 ${pathname.includes('/documents') ? 'text-brand-blue' : 'text-text-muted hover:text-text-primary'}`}>
            <IconFileText size={22} stroke={pathname.includes('/documents') ? 2 : 1.5} />
            <span className="text-[10px] font-medium">ሰነዶች</span>
          </Link>
        )}
        {allowedNavItems.find(i => i.id === 'assessment') && (
          <Link href="/dashboard/assessment" className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 ${pathname.includes('/assessment') ? 'text-brand-blue' : 'text-text-muted hover:text-text-primary'}`}>
            <IconClipboardCheck size={22} stroke={pathname.includes('/assessment') ? 2 : 1.5} />
            <span className="text-[10px] font-medium">ምዘና</span>
          </Link>
        )}
        <button onClick={() => setMobileMenuOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-1 p-2 text-text-muted hover:text-text-primary">
          <IconMenu2 size={22} stroke={1.5} />
          <span className="text-[10px] font-medium">ተጨማሪ</span>
        </button>
      </div>

    </div>
  );
};
