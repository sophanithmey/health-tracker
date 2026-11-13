'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  Droplet,
  Pill,
  HeartPulse,
  Target,
  FileText,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';

export function DesktopSidebar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tPatient = useTranslations('patient');
  const pathname = usePathname();
  const { role } = useRole();

  const navItems = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/blood-sugar', label: t('bloodSugar'), icon: Droplet },
    { href: '/medications', label: t('medications'), icon: Pill },
    { href: '/lifestyle', label: t('lifestyle'), icon: HeartPulse },
    { href: '/targets', label: t('targets'), icon: Target },
    { href: '/reports', label: t('reports'), icon: FileText },
    { href: '/settings', label: t('settings'), icon: Settings }
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex-shrink-0">
      {/* Patient Profile Card Snippet in Sidebar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-bold flex items-center justify-center text-sm">
            SM
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {tPatient('name')}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {tPatient('age')}
            </p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-semibold text-teal-700">
            {tPatient('oralMedication')}
          </span>
          <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
            {role === 'family_admin' ? tCommon('roleCaregiver') : tCommon('rolePatient')}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-teal-700' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Non-diagnostic safety disclaimer card */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
          <div className="flex items-center space-x-1.5 font-bold mb-1 text-teal-800">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{tCommon('appName')}</span>
          </div>
          {tCommon('disclaimer')}
        </div>
      </div>
    </aside>
  );
}

