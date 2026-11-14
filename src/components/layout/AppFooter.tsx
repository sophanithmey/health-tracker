'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Activity,
  PhoneCall,
  ShieldAlert,
  Droplet,
  Pill,
  Utensils,
  Target,
  BookOpen,
  FileText,
  Settings,
  Heart,
  ExternalLink,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { EmergencyHypoBanner } from './EmergencyHypoBanner';

export function AppFooter() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const quickLinks = [
    { href: '/', label: tNav('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: tNav('bloodSugar'), icon: Droplet },
    { href: '/medications', label: tNav('medications'), icon: Pill },
    { href: '/lifestyle', label: tNav('lifestyle'), icon: Utensils },
    { href: '/targets', label: tNav('targets'), icon: Target },
    { href: '/knowledge', label: tNav('knowledge'), icon: BookOpen },
    { href: '/reports', label: tNav('reports'), icon: FileText },
    { href: '/settings', label: tNav('settings'), icon: Settings }
  ];

  return (
    <>
      <footer className="mt-12 bg-white border-t border-slate-200/90 text-slate-700 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Caring Mission */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-sm shadow-teal-700/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-khmer">
                    {t('aboutTitle')}
                  </h3>
                  <p className="text-[11px] text-teal-700 font-bold">
                    {locale === 'km' ? 'ប្រព័ន្ធថែទាំសុខភាពម៉ាក់' : 'Family Health Monitoring'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {t('aboutDesc')}
              </p>

              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200/70">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="text-[11px]">{t('guidelines')}</span>
              </div>
            </div>

            {/* Column 2: Emergency Helplines (Direct Tap-to-Call) */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-khmer">
                {t('emergencyTitle')}
              </h4>

              <div className="space-y-2.5">
                {/* 119 Direct Tap Call */}
                <a
                  href="tel:119"
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100/80 border border-red-200 transition text-red-950 group touch-target"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">{t('ambulance119')}</div>
                      <div className="text-[10px] text-red-700 font-semibold">24/7 National Emergency</div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-2xs">
                    119
                  </span>
                </a>

                {/* 117 Police Call */}
                <a
                  href="tel:117"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-slate-800 touch-target"
                >
                  <div className="flex items-center space-x-2">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold">{t('police117')}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    117
                  </span>
                </a>

                {/* Hypo 15-15 Rule Quick Action Button */}
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-2xs touch-target"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>
                    {locale === 'km' ? 'ការណែនាំសង្គ្រោះបន្ទាន់ 15-15' : 'Emergency 15-15 Rule'}
                  </span>
                </button>
              </div>
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-khmer">
                {t('quickLinks')}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-1.5 p-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-800 hover:bg-teal-50/60 transition"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 4: Medical Safety & Non-Diagnostic Notice */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-khmer">
                {locale === 'km' ? 'សុវត្ថិភាពវេជ្ជសាស្ត្រ' : 'Clinical Safety'}
              </h4>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>Non-Diagnostic Reference</span>
                </div>
                <p>{t('disclaimer')}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium pt-1">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>{t('copyright')}</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Standards */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} Family Diabetes Care. {locale === 'km' ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង' : 'All rights reserved'}.
            </div>
            <div className="flex items-center space-x-4">
              <span>Timezone: Asia/Phnom_Penh (UTC+7)</span>
              <span>•</span>
              <span>ADA 2026 Guidelines</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Emergency Guidance Modal */}
      <EmergencyHypoBanner
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}

