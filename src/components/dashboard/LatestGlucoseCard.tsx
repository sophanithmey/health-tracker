'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { GlucoseRecord, GlucoseTarget } from '@/types';
import { Droplet, AlertTriangle, CheckCircle2, Clock, User, ArrowUpRight, Plus, Target } from 'lucide-react';

interface LatestGlucoseCardProps {
  record?: GlucoseRecord;
  target?: GlucoseTarget;
  onRecordClick: () => void;
}

export function LatestGlucoseCard({ record, target, onRecordClick }: LatestGlucoseCardProps) {
  const t = useTranslations('dashboard');
  const tBlood = useTranslations('bloodSugar');

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

  const targetMin = target?.targetMin ?? 80;
  const targetMax = target?.targetMax ?? 130;

  const isCritical = record.targetStatus === 'critical_low' || record.valueMgDl < 54;
  const isHigh = record.targetStatus === 'high' || record.valueMgDl > targetMax;
  const isLow = record.targetStatus === 'low' || (record.valueMgDl < 70 && !isCritical);

  const cardBorder = isCritical
    ? 'border-red-300 bg-gradient-to-br from-red-50/70 via-white to-white'
    : isHigh
    ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-white'
    : isLow
    ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-white'
    : 'border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-white';

  const badgeComponent = isCritical ? (
    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-red-600 text-white shadow-xs">
      <AlertTriangle className="w-4 h-4 mr-1.5" />
      Critical Low (&lt; 54 mg/dL)
    </span>
  ) : isHigh ? (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs">
      <ArrowUpRight className="w-4 h-4 mr-1.5" />
      Above configured target
    </span>
  ) : isLow ? (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs">
      <AlertTriangle className="w-4 h-4 mr-1.5" />
      Below personal target
    </span>
  ) : (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
      <CheckCircle2 className="w-4 h-4 mr-1.5" />
      Within target
    </span>
  );

  // Percentage progress across a scale of 60 to 220 mg/dL for visual gauge
  const progressPercent = Math.min(
    100,
    Math.max(0, ((record.valueMgDl - 60) / (220 - 60)) * 100)
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
          <div className="mt-5 max-w-lg bg-white/90 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
              <span className="text-slate-400">Low (&lt; 70)</span>
              <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                Target ({targetMin}–{targetMax} mg/dL)
              </span>
              <span className="text-slate-400">High (&ge; 180)</span>
            </div>

            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              {/* Target zone */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-400"
                style={{
                  left: `${((targetMin - 60) / 160) * 100}%`,
                  width: `${((targetMax - targetMin) / 160) * 100}%`
                }}
              />
              {/* Elevated zone */}
              <div
                className="absolute top-0 bottom-0 bg-amber-300"
                style={{
                  left: `${((targetMax - 60) / 160) * 100}%`,
                  width: `${((180 - targetMax) / 160) * 100}%`
                }}
              />
              {/* High zone */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-300"
                style={{
                  left: `${((180 - 60) / 160) * 100}%`,
                  right: 0
                }}
              />
            </div>

            {/* Scale Marker Pointer */}
            <div className="relative w-full h-5 mt-1.5">
              <div
                className="absolute -top-1 flex flex-col items-center -translate-x-1/2 transition-all"
                style={{ left: `${progressPercent}%` }}
              >
                <div className={`w-2.5 h-2.5 rotate-45 shadow-xs ${isCritical ? 'bg-red-600' : isHigh ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                <span className={`text-[10px] font-black whitespace-nowrap mt-0.5 ${isCritical ? 'text-red-700' : isHigh ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {record.valueMgDl} mg/dL
                </span>
              </div>
            </div>
          </div>

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

          {record.mealDescription && (
            <p className="text-xs text-slate-600 mt-3 italic bg-white/90 p-3 rounded-xl border border-slate-200/60 max-w-xl">
              &ldquo;{record.mealDescription}&rdquo;
            </p>
          )}
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
