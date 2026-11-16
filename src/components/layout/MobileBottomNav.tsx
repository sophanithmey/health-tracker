'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  Activity,
  Droplet,
  Pill,
  HeartPulse,
  Menu
} from 'lucide-react';

export function MobileBottomNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const isMoreActive =
    pathname.includes('/targets') ||
    pathname.includes('/knowledge') ||
    pathname.includes('/reports') ||
    pathname.includes('/settings');

  const mainItems = [
    { href: '/', label: t('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: t('bloodSugar'), icon: Droplet },
    { href: '/medications', label: t('medications'), icon: Pill },
    { href: '/lifestyle', label: t('lifestyle'), icon: HeartPulse }
  ];

  const handleOpenMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-mobile-menu'));
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-full px-2 py-1 flex items-center justify-around safe-bottom"
      aria-label="Mobile Bottom Navigation"
    >
      {mainItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[42px] rounded-full transition-all relative ${
              isActive
                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 truncate max-w-[64px] leading-tight font-khmer">
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Menu / More Button */}
      <button
        type="button"
        onClick={handleOpenMenu}
        className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[42px] rounded-full transition-all relative ${
          isMoreActive
            ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60 shadow-2xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title={locale === 'km' ? 'ម៉ឺនុយ & ផ្សេងទៀត' : 'Menu & More'}
        aria-label="Open navigation menu drawer"
      >
        <div className="relative">
          <Menu className={`w-4 h-4 ${isMoreActive ? 'text-teal-700' : 'text-slate-400'}`} />
          {isMoreActive ? (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-teal-600 ring-2 ring-white" />
          ) : null}
        </div>
        <span className="text-[10px] mt-0.5 truncate max-w-[64px] leading-tight font-khmer">
          {locale === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
        </span>
      </button>
    </nav>
  );
}
