'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Activity,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { EmergencyHypoBanner } from './EmergencyHypoBanner';

export function AppFooter() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <>
      <footer className="mt-12 bg-white border-t border-slate-200/80 text-slate-600 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Brand & Mission Tag */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 text-sm tracking-tight font-khmer">
                    {t('aboutTitle')}
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:inline text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    {t('guidelines')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('copyright')}
                </p>
              </div>
            </div>

            {/* Emergency & Quick Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition shadow-2xs touch-target"
                title="15-15 Rule for Low Blood Sugar"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{tCommon('emergency1515')}</span>
              </button>

              <a
                href="tel:119"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-950 border border-red-200/80 text-xs font-bold transition shadow-2xs touch-target"
                title="National Ambulance (119)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{tCommon('nationalAmbulance')}</span>
              </a>
            </div>
          </div>

          {/* Micro Disclaimer & Timestamp Row */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <p className="leading-relaxed sm:max-w-2xl">
              {t('disclaimer')}
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 shrink-0">
              <span>&copy; {new Date().getFullYear()}</span>
              <span>•</span>
              <span>Asia/Phnom_Penh (UTC+7)</span>
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
