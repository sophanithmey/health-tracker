'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import {
  Activity,
  Droplet,
  Pill,
  HeartPulse,
  Target,
  FileText,
  Settings,
  ShieldAlert,
  Menu,
  X,
  User,
  HeartHandshake
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';

interface AppHeaderProps {
  onOpenEmergency?: () => void;
}

export function AppHeader({ onOpenEmergency }: AppHeaderProps) {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role, switchRole } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  const navItems = [
    { href: '/', label: tNav('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: tNav('bloodSugar'), icon: Droplet },
    { href: '/medications', label: tNav('medications'), icon: Pill },
    { href: '/lifestyle', label: tNav('lifestyle'), icon: HeartPulse },
    { href: '/targets', label: tNav('targets'), icon: Target },
    { href: '/reports', label: tNav('reports'), icon: FileText },
    { href: '/settings', label: tNav('settings'), icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Left: Brand & Live Patient Health Pulse */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition">
                <Activity className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                  {t('appName')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 hidden sm:block">
                {t('appTagline')}
              </p>
            </div>
          </Link>

          {/* 2. Center: Desktop Top Navigation Menu (No Sidebar!) */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-sm shadow-slate-200 ring-1 ring-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Quick Actions, Role Switcher & Language */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Emergency 15-15 Action Button */}
            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-xs"
                title="Emergency Guidance & 15-15 Rule"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>15-15 Rule</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                onClick={() => switchRole('family_admin')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  role === 'family_admin'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Family Caregiver Mode"
              >
                {t('roleCaregiver')}
              </button>
              <button
                onClick={() => switchRole('patient')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  role === 'patient'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Patient (Mom) Mode"
              >
                {t('rolePatient')}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                onClick={() => handleLanguageChange('km')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  locale === 'km'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ខ្មែរ
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  locale === 'en'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile menu hamburger toggle (for screens below xl) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Medium Screen (tablet) Nav Bar: visible between md and xl */}
        <div className="hidden md:flex xl:hidden items-center justify-center space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer (visible on mobile when hamburger toggled) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {onOpenEmergency && (
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEmergency();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-xs"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Emergency 15-15 Rule Guide</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
