'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Pill, CheckCircle2 } from 'lucide-react';

interface TodayAdherenceBannerProps {
  takenCount: number;
  totalCount: number;
  adherencePercent: number;
  allTaken: boolean;
  isKhmer?: boolean;
}

export function TodayAdherenceBanner({
  takenCount,
  totalCount,
  adherencePercent,
  allTaken
}: TodayAdherenceBannerProps) {
  const t = useTranslations('medications');
  if (totalCount === 0) return null;

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        allTaken
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-teal-50/60 border-teal-200/80 text-teal-950'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
            allTaken ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
          }`}
        >
          {allTaken ? <CheckCircle2 className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-bold text-sm">
            {allTaken
              ? t('allTakenTitle')
              : t('todayAdherenceTitle', { taken: takenCount, total: totalCount })}
          </h4>
          <p className="text-xs text-slate-600">
            {allTaken
              ? t('allTakenDetail')
              : t('pendingDoses', { count: totalCount - takenCount })}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-44 space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span>{adherencePercent}% {t('complete')}</span>
          <span>{takenCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              allTaken ? 'bg-emerald-600' : 'bg-teal-600'
            }`}
            style={{ width: `${adherencePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
