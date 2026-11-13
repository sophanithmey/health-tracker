'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { HealthReportSummary } from '@/types';
import { Activity, Sunrise, Utensils, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

interface SummaryMetricsCardsProps {
  summary: HealthReportSummary;
  todayCount?: number;
}

export function SummaryMetricsCards({ summary, todayCount = 1 }: SummaryMetricsCardsProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
      {/* 1. Today's Readings */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t('todayCount')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-4xl font-black text-slate-900">{todayCount}</span>
          <span className="text-xs font-bold text-slate-400">times</span>
        </div>
        <span className="text-[11px] font-bold text-teal-700 flex items-center mt-1">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Active monitoring
        </span>
      </div>

      {/* 2. Fasting Average (STRICTLY SEPARATE) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600">
            {t('fastingAvg')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sunrise className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-4xl font-black text-slate-900">
            {summary.fastingAverage ?? '--'}
          </span>
          <span className="text-xs font-bold text-slate-400">mg/dL</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Target: 80–130 mg/dL
        </span>
      </div>

      {/* 3. Post-Meal Average (STRICTLY SEPARATE) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700">
            {t('postMealAvg')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-4xl font-black text-slate-900">
            {summary.postMealAverage ?? '--'}
          </span>
          <span className="text-xs font-bold text-slate-400">mg/dL</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Target: &lt; 180 mg/dL (2h)
        </span>
      </div>

      {/* 4. Low Events */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-red-600">
            {t('lowEvents')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span
            className={`text-4xl font-black ${
              summary.belowTargetCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {summary.belowTargetCount}
          </span>
          <span className="text-xs font-bold text-slate-400">events</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          &lt; 70 mg/dL events
        </span>
      </div>

      {/* 5. High Events */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600">
            {t('highEvents')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span
            className={`text-4xl font-black ${
              summary.aboveTargetCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {summary.aboveTargetCount}
          </span>
          <span className="text-xs font-bold text-slate-400">events</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Above target range
        </span>
      </div>
    </div>
  );
}
