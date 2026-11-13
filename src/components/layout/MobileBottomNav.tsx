'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  Droplet,
  Pill,
  HeartPulse,
  FileText,
  Settings
} from 'lucide-react';

export function MobileBottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/blood-sugar', label: t('bloodSugar'), icon: Droplet },
    { href: '/medications', label: t('medications'), icon: Pill },
    { href: '/lifestyle', label: t('lifestyle'), icon: HeartPulse },
    { href: '/reports', label: t('reports'), icon: FileText },
    { href: '/settings', label: t('settings'), icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg px-2 py-1 flex items-center justify-around safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 touch-target rounded-xl transition ${
              isActive
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 truncate max-w-[54px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

