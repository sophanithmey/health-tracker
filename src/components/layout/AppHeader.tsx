'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, Menu } from 'lucide-react';
import { useHeaderNavigation } from '@/hooks/use-header-navigation';
import { HeaderDesktopNav } from './HeaderDesktopNav';
import { HeaderUserControls } from './HeaderUserControls';
import { HeaderMobileDrawer } from './HeaderMobileDrawer';

const EmergencyHypoBanner = dynamic(
  () => import('./EmergencyHypoBanner').then((m) => m.EmergencyHypoBanner),
  { ssr: false }
);

export function AppHeader() {
  const t = useTranslations('common');
  const {
    navItems,
    pathname,
    locale,
    role,
    switchRole,
    patient,
    patientDisplayName,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLanguageChange
  } = useHeaderNavigation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-150">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap leading-tight font-khmer">
            {t('appName') || 'Family Diabetes Care'}
          </span>
        </Link>

        {/* Center: Desktop/Tablet Nav */}
        <HeaderDesktopNav navItems={navItems} pathname={pathname} />

        {/* Right: Actions & User Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <HeaderUserControls
            role={role}
            switchRole={switchRole}
            locale={locale}
            onLanguageChange={handleLanguageChange}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />

          {/* Mobile Hamburger Menu Button (Mobile only: < md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 flex items-center justify-center transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <HeaderMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        patient={patient}
        patientDisplayName={patientDisplayName}
        role={role}
        switchRole={switchRole}
        navItems={navItems}
        pathname={pathname}
        locale={locale}
        onLanguageChange={handleLanguageChange}
        onOpenEmergency={() => {
          setIsMobileMenuOpen(false);
          setIsEmergencyModalOpen(true);
        }}
      />

      {/* Emergency Hypoglycemia Rule 15-15 Modal */}
      {isEmergencyModalOpen ? (
        <EmergencyHypoBanner
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      ) : null}
    </header>
  );
}
