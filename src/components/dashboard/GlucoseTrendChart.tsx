'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList
} from 'recharts';
import { GlucoseRecord, GlucoseTarget } from '@/types';
import {
  TrendingUp,
  CalendarDays,
  Calendar,
  ArrowDown,
  ArrowUp,
  Minus,
  Sparkles,
  CheckCircle2,
  LineChart as LineChartIcon,
  BarChart3
} from 'lucide-react';

interface GlucoseTrendChartProps {
  records: GlucoseRecord[];
  target?: GlucoseTarget;
}

type RangeOption = 7 | 30 | 90 | 180 | 0; // 0 = all time

interface MonthlySummary {
  monthKey: string;
  monthLabel: string;
  fastingAvg?: number;
  postMealAvg?: number;
  overallAvg: number;
  readingsCount: number;
  deltaVsPrev: number | null;
}

export function GlucoseTrendChart({ records, target }: GlucoseTrendChartProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  // Mode: 'trend' (Timeline line) or 'monthly' (Month-by-month comparison)
  const [viewMode, setViewMode] = useState<'monthly' | 'trend'>('monthly');
  const [daysRange, setDaysRange] = useState<RangeOption>(90);

  // --------------------------------------------------------------------------
  // 1. Daily Trend Data (for Timeline mode)
  // --------------------------------------------------------------------------
  const trendData = useMemo(() => {
    let filtered = [...records];
    if (daysRange > 0) {
      const cutoffMs = Date.now() - daysRange * 86400000;
      const cutoff = new Date(cutoffMs).toISOString();
      filtered = filtered.filter((r) => r.measuredAt >= cutoff);
    }

    filtered.sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());

    const groupedData: Record<string, { date: string; fasting?: number; postMeal?: number }> = {};

    filtered.forEach((r) => {
      const d = new Date(r.measuredAt);
      const dateStr = d.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        day: 'numeric'
      });

      if (!groupedData[dateStr]) {
        groupedData[dateStr] = { date: dateStr };
      }

      if (r.measurementType === 'fasting' || r.measurementType === 'before_meal') {
        groupedData[dateStr].fasting = r.valueMgDl;
      } else if (r.measurementType === '1h_after_meal' || r.measurementType === '2h_after_meal') {
        groupedData[dateStr].postMeal = r.valueMgDl;
      }
    });

    return Object.values(groupedData);
  }, [records, daysRange, locale]);

  // --------------------------------------------------------------------------
  // 2. Monthly Aggregated Data (for Month-by-Month comparison)
  // --------------------------------------------------------------------------
  const monthlySummaries = useMemo<MonthlySummary[]>(() => {
    if (!records || records.length === 0) return [];

    const monthMap: Record<
      string,
      {
        monthKey: string;
        monthLabel: string;
        fastingValues: number[];
        postMealValues: number[];
        allValues: number[];
      }
    > = {};

    const sorted = [...records].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    sorted.forEach((r) => {
      const d = new Date(r.measuredAt);
      const yearStr = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        year: 'numeric'
      });
      const monthNumStr = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: '2-digit'
      });
      const monthKey = `${yearStr}-${monthNumStr}`;

      const monthLabel = d.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        year: 'numeric'
      });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          monthKey,
          monthLabel,
          fastingValues: [],
          postMealValues: [],
          allValues: []
        };
      }

      monthMap[monthKey].allValues.push(r.valueMgDl);

      if (r.measurementType === 'fasting' || r.measurementType === 'before_meal') {
        monthMap[monthKey].fastingValues.push(r.valueMgDl);
      } else if (r.measurementType === '1h_after_meal' || r.measurementType === '2h_after_meal') {
        monthMap[monthKey].postMealValues.push(r.valueMgDl);
      }
    });

    const entries = Object.values(monthMap);

    return entries.map((m, idx) => {
      const fastingAvg =
        m.fastingValues.length > 0
          ? Math.round(m.fastingValues.reduce((a, b) => a + b, 0) / m.fastingValues.length)
          : undefined;

      const postMealAvg =
        m.postMealValues.length > 0
          ? Math.round(m.postMealValues.reduce((a, b) => a + b, 0) / m.postMealValues.length)
          : undefined;

      const overallAvg = Math.round(
        m.allValues.reduce((a, b) => a + b, 0) / m.allValues.length
      );

      let deltaVsPrev: number | null = null;
      if (idx > 0) {
        const prevAvg =
          entries[idx - 1].allValues.reduce((a, b) => a + b, 0) /
          entries[idx - 1].allValues.length;
        deltaVsPrev = Math.round(overallAvg - prevAvg);
      }

      return {
        monthKey: m.monthKey,
        monthLabel: m.monthLabel,
        fastingAvg,
        postMealAvg,
        overallAvg,
        readingsCount: m.allValues.length,
        deltaVsPrev
      };
    });
  }, [records, locale]);

  // Chart data for monthly bar chart
  const monthlyChartData = useMemo(() => {
    return monthlySummaries.map((m) => ({
      month: m.monthLabel,
      fasting: m.fastingAvg,
      postMeal: m.postMealAvg,
      overall: m.overallAvg,
      delta: m.deltaVsPrev
    }));
  }, [monthlySummaries]);

  // Overall improvement metrics across entire recording history
  const overallImprovement = useMemo(() => {
    if (monthlySummaries.length < 2) return null;
    const first = monthlySummaries[0];
    const latest = monthlySummaries[monthlySummaries.length - 1];
    const firstVal = first.fastingAvg ?? first.overallAvg;
    const latestVal = latest.fastingAvg ?? latest.overallAvg;
    const delta = latestVal - firstVal;

    return {
      firstMonth: first.monthLabel,
      latestMonth: latest.monthLabel,
      firstVal,
      latestVal,
      delta, // negative means improved (e.g. -11)
      isImproved: delta < 0,
      monthCount: monthlySummaries.length
    };
  }, [monthlySummaries]);

  const targetMax = target?.targetMax ?? 130;
  const targetMin = target?.targetMin ?? 80;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/80 border border-teal-200/60 flex items-center justify-center text-teal-700 shadow-2xs">
              <TrendingUp className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-khmer">
                {t('chartTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {viewMode === 'monthly'
                  ? locale === 'km'
                    ? 'ប្រៀបធៀបទិន្នន័យជាតិស្ករខែនីមួយៗ សម្រាប់អ្នកជំងឺដែលវាស់ប្រចាំខែ'
                    : 'Month-by-month glycemic comparison for periodic and monthly tracking'
                  : locale === 'km'
                  ? 'និន្នាការជាតិស្ករមុន និងក្រោយអាហារតាមពេលវេលា (Asia/Phnom_Penh)'
                  : 'Fasting & post-meal readings tracked as separate clinical trajectories'}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle + Timeline Range Filter */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Main View Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 touch-target ${
                viewMode === 'monthly'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="font-khmer">{t('viewMonthlyComparison')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('trend')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 touch-target ${
                viewMode === 'trend'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="font-khmer">{t('viewDailyTrend')}</span>
            </button>
          </div>

          {/* Timeline Range Options (Active when in 'trend' mode) */}
          {viewMode === 'trend' && (
            <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDaysRange(7)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  daysRange === 7
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => setDaysRange(30)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  daysRange === 30
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30D
              </button>
              <button
                type="button"
                onClick={() => setDaysRange(90)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  daysRange === 90
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('chartDays90')}
              >
                3M
              </button>
              <button
                type="button"
                onClick={() => setDaysRange(180)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  daysRange === 180
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('chartDays180')}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setDaysRange(0)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  daysRange === 0
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('chartAllTime')}
              >
                {t('chartAllTime')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* VIEW 1: MONTH-BY-MONTH COMPARISON MODE */}
      {/* -------------------------------------------------------------------- */}
      {viewMode === 'monthly' ? (
        <div className="space-y-6">
          {/* Monthly Comparison Bar Chart */}
          <div className="h-80 w-full">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 25, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[60, 220]}
                    unit=" "
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      padding: '10px 14px'
                    }}
                    formatter={(val: any) => [`${val} mg/dL`, 'Blood Glucose']}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-slate-700 ml-1">{value}</span>
                    )}
                  />

                  {/* Target reference line */}
                  <ReferenceLine
                    y={targetMax}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target Max (${targetMax})`,
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideBottomRight'
                    }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Low Alert (70)',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />

                  {/* Fasting Monthly Bar */}
                  <Bar
                    dataKey="fasting"
                    name={t('fastingLine')}
                    fill="#d97706"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  >
                    <LabelList
                      dataKey="fasting"
                      position="top"
                      style={{ fontSize: 11, fontWeight: 'bold', fill: '#b45309' }}
                      formatter={(v: any) => (v ? `${v}` : '')}
                    />
                  </Bar>

                  {/* Post-Meal Monthly Bar */}
                  <Bar
                    dataKey="postMeal"
                    name={t('postMealLine')}
                    fill="#0d9488"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  >
                    <LabelList
                      dataKey="postMeal"
                      position="top"
                      style={{ fontSize: 11, fontWeight: 'bold', fill: '#0f766e' }}
                      formatter={(v: any) => (v ? `${v}` : '')}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                {t('noReadings')}
              </div>
            )}
          </div>

          {/* Month-by-Month Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {monthlySummaries.map((m, index) => {
              const displayVal = m.fastingAvg ?? m.overallAvg;
              const isOverTarget = displayVal > targetMax;
              const isImproved = m.deltaVsPrev !== null && m.deltaVsPrev < 0;
              const isIncreased = m.deltaVsPrev !== null && m.deltaVsPrev > 0;

              return (
                <div
                  key={m.monthKey}
                  className={`p-5 rounded-2xl border transition-all ${
                    index === monthlySummaries.length - 1
                      ? 'bg-linear-to-br from-teal-50/70 to-white border-teal-300/80 shadow-xs ring-2 ring-teal-600/10'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-teal-700" />
                      <span className="text-sm font-black text-slate-900 font-khmer">
                        {m.monthLabel}
                      </span>
                    </div>

                    {index === monthlySummaries.length - 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                        {locale === 'km' ? 'ខែចុងក្រោយ' : 'Latest Month'}
                      </span>
                    )}
                  </div>

                  {/* Large Value Display */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {displayVal}
                    </span>
                    <span className="text-xs font-bold text-slate-500">mg/dL</span>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 ml-auto">
                      {m.fastingAvg ? t('fastingLine') : 'Average'}
                    </span>
                  </div>

                  {/* Month-over-Month Delta Badge */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {locale === 'km' ? 'ធៀបនឹងខែមុន:' : 'vs previous month:'}
                    </span>

                    {m.deltaVsPrev === null ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        <Minus className="w-3 h-3" />
                        <span>{t('baseline')}</span>
                      </span>
                    ) : isImproved ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ArrowDown className="w-3 h-3 text-emerald-700" />
                        <span>
                          {m.deltaVsPrev} mg/dL ({t('improved')})
                        </span>
                      </span>
                    ) : isIncreased ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <ArrowUp className="w-3 h-3 text-rose-700" />
                        <span>
                          +{m.deltaVsPrev} mg/dL ({t('increased')})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        <Minus className="w-3 h-3" />
                        <span>0 mg/dL (Steady)</span>
                      </span>
                    )}
                  </div>

                  {/* Target Status Bar */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>
                      {isOverTarget
                        ? `Above target (+${displayVal - targetMax})`
                        : `Within target (80–${targetMax})`}
                    </span>
                    <span>
                      {m.readingsCount} {locale === 'km' ? 'ការវាស់' : 'reading(s)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Clinical Progression Highlight Banner */}
          {overallImprovement && (
            <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 flex items-start space-x-3.5 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950 font-khmer">
                  {t('monthlyProgression')}
                </h4>
                <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                  {overallImprovement.isImproved ? (
                    locale === 'km' ? (
                      <>
                        លទ្ធផលគួរឱ្យកត់សម្គាល់៖ ជាតិស្ករមុនអាហាររបស់ម៉ាក់បានធ្លាក់ចុះជាលំដាប់{' '}
                        <strong>{Math.abs(overallImprovement.delta)} mg/dL</strong> ក្នុងអំឡុង{' '}
                        {overallImprovement.monthCount} ខែកន្លងមកនេះ (ពី{' '}
                        {overallImprovement.firstVal} mg/dL ក្នុងខែ {overallImprovement.firstMonth} មកត្រឹម{' '}
                        {overallImprovement.latestVal} mg/dL ក្នុងខែ {overallImprovement.latestMonth})។
                      </>
                    ) : (
                      <>
                        Encouraging Progress: Mom&apos;s fasting blood sugar has improved by{' '}
                        <strong>{Math.abs(overallImprovement.delta)} mg/dL</strong> across{' '}
                        {overallImprovement.monthCount} months (from {overallImprovement.firstVal}{' '}
                        mg/dL in {overallImprovement.firstMonth} down to {overallImprovement.latestVal}{' '}
                        mg/dL in {overallImprovement.latestMonth}).
                      </>
                    )
                  ) : (
                    locale === 'km' ? (
                      <>
                        ការតាមដានប្រចាំខែ៖ ជាតិស្ករមុនអាហារស្ថិតក្នុងចន្លោះពី{' '}
                        {overallImprovement.firstVal} mg/dL (ខែ {overallImprovement.firstMonth}) ដល់{' '}
                        {overallImprovement.latestVal} mg/dL (ខែ {overallImprovement.latestMonth})។
                      </>
                    ) : (
                      <>
                        Monthly Tracking: Mom&apos;s blood sugar was recorded from{' '}
                        {overallImprovement.firstVal} mg/dL ({overallImprovement.firstMonth}) to{' '}
                        {overallImprovement.latestVal} mg/dL ({overallImprovement.latestMonth}).
                      </>
                    )
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* VIEW 2: CONTINUOUS TIMELINE TREND (Line Chart)                     */
        /* ------------------------------------------------------------------ */
        <div className="space-y-4">
          <div className="h-80 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[60, 220]}
                    unit=" "
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      padding: '10px 14px'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={40}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-slate-700 ml-1">{value}</span>
                    )}
                  />

                  {/* Configured Target Max */}
                  <ReferenceLine
                    y={targetMax}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target Max (${targetMax})`,
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideBottomRight'
                    }}
                  />
                  {/* Configured Target Min */}
                  <ReferenceLine
                    y={targetMin}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target Min (${targetMin})`,
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideBottomLeft'
                    }}
                  />
                  {/* Low alert threshold */}
                  <ReferenceLine
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Low Alert (70)',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />

                  {/* Fasting Series */}
                  <Line
                    type="monotone"
                    dataKey="fasting"
                    name={t('fastingLine')}
                    stroke="#d97706"
                    strokeWidth={3.5}
                    dot={{ r: 6, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />

                  {/* Post-Meal Series */}
                  <Line
                    type="monotone"
                    dataKey="postMeal"
                    name={t('postMealLine')}
                    stroke="#0d9488"
                    strokeWidth={3.5}
                    dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                {t('noReadings')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Reference Legend */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-medium text-slate-500 gap-2">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Fasting Reference: 80–130 mg/dL</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Post-meal Reference: &lt; 180 mg/dL</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Hypoglycemia Threshold: &lt; 70 mg/dL</span>
        </span>
      </div>
    </div>
  );
}
