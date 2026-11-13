'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Activity, UserCheck, ShieldAlert, Globe } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

export function AppHeader() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role, switchRole } = useRole();

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Right: Role Switcher & Language Selector */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Role switcher pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => switchRole('family_admin')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                role === 'family_admin'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Family Caregiver"
            >
              {t('roleCaregiver')}
            </button>
            <button
              onClick={() => switchRole('patient')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                role === 'patient'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Patient View"
            >
              {t('rolePatient')}
            </button>
          </div>

          {/* Language selector toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleLanguageChange('km')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                locale === 'km'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ខ្មែរ
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                locale === 'en'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

