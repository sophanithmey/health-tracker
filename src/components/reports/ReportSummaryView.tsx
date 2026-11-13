'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HealthReportSummary, PatientProfile, GlucoseRecord, GlucoseTarget } from '@/types';
import { Sunrise, Utensils, HeartPulse, ShieldCheck, Pill, Calendar, Activity } from 'lucide-react';
import { DoctorVisitPdfExport } from './DoctorVisitPdfExport';

interface ReportSummaryViewProps {
  summary: HealthReportSummary;
  patient: PatientProfile;
  records: GlucoseRecord[];
  targets: GlucoseTarget[];
  onPeriodChange: (days: 7 | 30) => void;
}

export function ReportSummaryView({
  summary,
  patient,
  records,
  targets,
  onPeriodChange
}: ReportSummaryViewProps) {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const [period, setPeriod] = useState<7 | 30>(summary.periodDays === 30 ? 30 : 7);

  const handlePeriodToggle = (days: 7 | 30) => {
    setPeriod(days);
    onPeriodChange(days);
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Toggles & Print/Export */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">{t('title')}</h3>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 7 Days vs 30 Days Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handlePeriodToggle(7)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                period === 7
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('weeklyReport')}
            </button>
            <button
              onClick={() => handlePeriodToggle(30)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                period === 30
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('monthlyReport')}
            </button>
          </div>

          {/* Export PDF Button */}
          <DoctorVisitPdfExport
            summary={summary}
            patient={patient}
            records={records}
            targets={targets}
          />
        </div>
      </div>

      {/* Main Glucose Metrics Cards (Strictly Separate Fasting and Post-meal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fasting Average */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <Sunrise className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('fastingAverage')}
            </h4>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {summary.fastingAverage ?? '--'} <span className="text-xs font-medium text-slate-400">mg/dL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: 80–130 mg/dL (Unconfirmed educational reference)
          </p>
        </div>

        {/* Post-Meal Average */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-teal-600 mb-2">
            <Utensils className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('postMealAverage')}
            </h4>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {summary.postMealAverage ?? '--'} <span className="text-xs font-medium text-slate-400">mg/dL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: &lt; 180 mg/dL (1-2 hours post-meal)
          </p>
        </div>

        {/* Lowest / Highest */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-600 mb-2">
            <Activity className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reading Range
            </h4>
          </div>
          <div className="text-xl font-black text-slate-900">
            {summary.overallLowest ?? '--'} – {summary.overallHighest ?? '--'}{' '}
            <span className="text-xs font-medium text-slate-400">mg/dL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total measurements: {summary.totalMeasurements}
          </p>
        </div>

        {/* Medication Adherence */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Pill className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('adherenceSummary')}
            </h4>
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {summary.medicationAdherenceRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.dosesTaken} of {summary.dosesScheduled} scheduled doses taken
          </p>
        </div>
      </div>

      {/* Target Distribution Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h4 className="text-base font-bold text-slate-900 mb-4">Target Range Distribution</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="text-2xl font-black text-emerald-800">{summary.inTargetCount}</div>
            <div className="text-xs font-bold text-emerald-900 mt-1">Within Target</div>
            <div className="text-[11px] text-emerald-700">{summary.inTargetPercentage}%</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="text-2xl font-black text-amber-800">{summary.aboveTargetCount}</div>
            <div className="text-xs font-bold text-amber-900 mt-1">Above Target</div>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
            <div className="text-2xl font-black text-red-800">{summary.belowTargetCount}</div>
            <div className="text-xs font-bold text-red-900 mt-1">Low (&lt; 70 mg/dL)</div>
          </div>
        </div>
      </div>

      {/* Non-diagnostic Medical Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Non-Diagnostic Disclaimer:</strong> This report is compiled for personal health tracking and to facilitate discussions with Mom&apos;s healthcare provider. It does not constitute a formal diagnosis or medical treatment plan. Never alter medication doses without consulting Dr. Chanthy Keo or your clinician.
        </p>
      </div>
    </div>
  );
}

