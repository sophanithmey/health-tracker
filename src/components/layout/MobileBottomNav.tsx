'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  Activity,
  Droplet,
  Pill,
  BookOpen,
  HeartPulse,
  FileText,
  Settings
} from 'lucide-react';

export function MobileBottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: t('bloodSugar'), icon: Droplet },
    { href: '/medications', label: t('medications'), icon: Pill },
    { href: '/knowledge', label: t('knowledge'), icon: BookOpen },
    { href: '/lifestyle', label: t('lifestyle'), icon: HeartPulse },
    { href: '/reports', label: t('reports'), icon: FileText }
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-2xl px-2 py-1.5 flex items-center justify-around safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 touch-target rounded-2xl transition-all ${
              isActive
                ? 'text-teal-700 font-extrabold bg-teal-50/80 scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 truncate max-w-[50px] leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
