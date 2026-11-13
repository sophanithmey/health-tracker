'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthReportSummary } from '@/types';
import { Activity, Sunrise, Utensils, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface SummaryMetricsCardsProps {
  summary: HealthReportSummary;
  todayCount?: number;
}

export function SummaryMetricsCards({ summary, todayCount = 1 }: SummaryMetricsCardsProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Today's Readings */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase">{t('todayCount')}</span>
          <Activity className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-3xl font-black text-slate-900">{todayCount}</span>
          <span className="text-xs font-semibold text-slate-400">records</span>
        </div>
        <span className="text-[11px] text-teal-700 font-medium">Daily routine active</span>
      </div>

      {/* 2. Fasting Average (SEPARATE) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase">{t('fastingAvg')}</span>
          <Sunrise className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-3xl font-black text-slate-900">
            {summary.fastingAverage ?? '--'}
          </span>
          <span className="text-xs font-semibold text-slate-400">mg/dL</span>
        </div>
        <span className="text-[11px] text-slate-500">Target: 80–130 mg/dL</span>
      </div>

      {/* 3. Post-Meal Average (SEPARATE) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase">{t('postMealAvg')}</span>
          <Utensils className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-3xl font-black text-slate-900">
            {summary.postMealAverage ?? '--'}
          </span>
          <span className="text-xs font-semibold text-slate-400">mg/dL</span>
        </div>
        <span className="text-[11px] text-slate-500">Target: &lt; 180 mg/dL</span>
      </div>

      {/* 4. Low Events */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase">{t('lowEvents')}</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span
            className={`text-3xl font-black ${
              summary.belowTargetCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {summary.belowTargetCount}
          </span>
          <span className="text-xs font-semibold text-slate-400">times</span>
        </div>
        <span className="text-[11px] text-slate-500">&lt; 70 mg/dL events</span>
      </div>

      {/* 5. High Events */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase">{t('highEvents')}</span>
          <ArrowUpRight className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span
            className={`text-3xl font-black ${
              summary.aboveTargetCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {summary.aboveTargetCount}
          </span>
          <span className="text-xs font-semibold text-slate-400">times</span>
        </div>
        <span className="text-[11px] text-slate-500">Above target events</span>
      </div>
    </div>
  );
}

