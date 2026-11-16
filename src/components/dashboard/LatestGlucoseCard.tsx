'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { GlucoseRecord, GlucoseTarget } from '@/types';
import { Droplet, AlertTriangle, CheckCircle2, Clock, User, ArrowUpRight, Plus, Target } from 'lucide-react';
import { GlucoseSpectrumGauge } from './GlucoseSpectrumGauge';

interface LatestGlucoseCardProps {
  record?: GlucoseRecord;
  target?: GlucoseTarget;
  onRecordClick: () => void;
}

export function LatestGlucoseCard({ record, target, onRecordClick }: LatestGlucoseCardProps) {
  const t = useTranslations('dashboard');

  if (!record) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <Droplet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{t('noReadings')}</h3>
        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
          Start Mom&apos;s daily monitoring by recording her fasting blood sugar reading.
        </p>
        <button
          onClick={onRecordClick}
          className="px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-md transition touch-target"
        >
          + {t('recordReading')}
        </button>
      </div>
    );
  }

  // Format date and time in Asia/Phnom_Penh
  const dateObj = new Date(record.measuredAt);
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    month: 'short',
    day: 'numeric'
  });

  const isTargetApproved = Boolean(
    target &&
      (target.approvalStatus === 'approved' ||
        target.clinicianApprovalStatus === 'clinician_approved')
  );

  const hasMin = target?.minValue !== undefined && target?.minValue !== null;
  const hasMax = target?.maxValue !== undefined && target?.maxValue !== null;

  const targetMin = hasMin ? target!.minValue! : (target?.targetMin ?? 80);
  const targetMax = hasMax ? target!.maxValue! : (target?.targetMax ?? 130);

  const isCritical = record.valueMgDl < 54 || record.targetStatus === 'critical_low';
  const isHigh = isTargetApproved && hasMax && record.valueMgDl > targetMax;
  const isLow = isTargetApproved && hasMin && record.valueMgDl < targetMin && !isCritical;

  const cardBorder = isCritical
    ? 'border-red-300 bg-gradient-to-br from-red-50/70 via-white to-white'
    : isHigh
    ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-white'
    : isLow
    ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-white'
    : !isTargetApproved
    ? 'border-slate-300 bg-gradient-to-br from-slate-50/70 via-white to-white'
    : 'border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-white';

  const highDiff = Number((record.valueMgDl - targetMax).toFixed(1));
  const lowDiff = Number((targetMin - record.valueMgDl).toFixed(1));

  const badgeComponent = isCritical ? (
    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-red-600 text-white shadow-xs">
      <AlertTriangle className="w-4 h-4 mr-1.5" />
      {t('criticalLow')}
    </span>
  ) : !isTargetApproved ? (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
      <Target className="w-4 h-4 mr-1.5 text-slate-500" />
      {t('personalTargetNotConfigured')}
    </span>
  ) : isHigh ? (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs">
      <ArrowUpRight className="w-4 h-4 mr-1.5" />
      {t('aboveConfiguredTarget', { diff: highDiff })}
    </span>
  ) : isLow ? (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs">
      <AlertTriangle className="w-4 h-4 mr-1.5" />
      {t('belowConfiguredTarget', { diff: lowDiff })}
    </span>
  ) : (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
      <CheckCircle2 className="w-4 h-4 mr-1.5" />
      {t('withinConfiguredTarget')}
    </span>
  );

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm transition relative overflow-hidden ${cardBorder}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Reading Value & Context */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-teal-800 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <span>{t('latestReading')}</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 my-2">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 font-sans">
              {record.valueMgDl}
            </span>
            <span className="text-2xl font-bold text-slate-500">mg/dL</span>
            <div className="self-center ml-2">{badgeComponent}</div>
          </div>

          {/* Visual Target Spectrum Gauge */}
          <GlucoseSpectrumGauge
            valueMgDl={record.valueMgDl}
            targetMin={targetMin}
            targetMax={targetMax}
            isTargetApproved={isTargetApproved}
            isCritical={isCritical}
            isHigh={isHigh}
            isLow={isLow}
          />

          {/* Context Meta Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700 mt-4">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs capitalize">
              {record.measurementType.replace(/_/g, ' ')}
            </span>

            <span className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              {formattedDate}, {formattedTime} (Phnom Penh)
            </span>

            <span className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <User className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              {t('recordedBy')}: {record.recordedByName || 'Caregiver'}
            </span>
          </div>

          {record.mealDescription ? (
            <p className="text-xs text-slate-600 mt-3 italic bg-white/90 p-3 rounded-xl border border-slate-200/60 max-w-xl">
              &ldquo;{record.mealDescription}&rdquo;
            </p>
          ) : null}
        </div>

        {/* Right: Primary Action Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch flex-shrink-0">
          <button
            onClick={onRecordClick}
            className="px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 touch-target"
          >
            <Plus className="w-5 h-5" />
            <span>{t('recordReading')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
