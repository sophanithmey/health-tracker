'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { GlucoseRecord, GlucoseTarget } from '@/types';
import { TrendingUp } from 'lucide-react';
import { useGlucoseTrendData, RangeOption } from '@/hooks/use-glucose-trend-data';
import { GlucoseChartControls } from './GlucoseChartControls';
import { GlucoseTimelineView } from './GlucoseTimelineView';
import { GlucoseMonthlyView } from './GlucoseMonthlyView';

interface GlucoseTrendChartProps {
  records: GlucoseRecord[];
  target?: GlucoseTarget;
}

export function GlucoseTrendChart({ records, target }: GlucoseTrendChartProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const [viewMode, setViewMode] = useState<'monthly' | 'trend'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [daysRange, setDaysRange] = useState<RangeOption>(0);

  const { allMeasurements, monthGroups } = useGlucoseTrendData(records, locale, daysRange);

  const activeMeasurements = useMemo(() => {
    if (selectedMonth === 'all') return allMeasurements;
    return allMeasurements.filter((m) => m.monthKey === selectedMonth);
  }, [allMeasurements, selectedMonth]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
      {/* Header with Title and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-khmer">
                {t('bloodSugarTrend')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {viewMode === 'monthly'
                  ? locale === 'km'
                    ? 'បង្ហាញទិន្នន័យវាស់ជាក់ស្តែងតាមថ្ងៃក្នុងខែនីមួយៗ (គ្មានមធ្យមភាគ)'
                    : 'Actual blood sugar measurements by day of each month (no monthly averaging)'
                  : locale === 'km'
                    ? 'ខ្សែបន្ទាត់វិវត្តន៍ជាតិស្ករតាមថ្ងៃនីមួយៗ (Asia/Phnom_Penh)'
                    : 'Continuous timeline trajectory of all readings by date'}
              </p>
            </div>
          </div>
        </div>

        <GlucoseChartControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          daysRange={daysRange}
          setDaysRange={setDaysRange}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          monthGroups={monthGroups}
        />
      </div>

      {/* Main Content: Monthly Day-by-Day View vs Continuous Timeline View */}
      {viewMode === 'monthly' ? (
        <GlucoseMonthlyView
          monthGroups={monthGroups}
          activeMeasurements={activeMeasurements}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          locale={locale}
          target={target}
        />
      ) : (
        <GlucoseTimelineView data={activeMeasurements} target={target} />
      )}
    </div>
  );
}
