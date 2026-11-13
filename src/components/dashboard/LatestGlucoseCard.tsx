'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { GlucoseRecord, GlucoseTarget } from '@/types';
import { Droplet, AlertTriangle, CheckCircle, Clock, User, ArrowUpRight } from 'lucide-react';

interface LatestGlucoseCardProps {
  record?: GlucoseRecord;
  target?: GlucoseTarget;
  onRecordClick: () => void;
}

export function LatestGlucoseCard({ record, target, onRecordClick }: LatestGlucoseCardProps) {
  const t = useTranslations('dashboard');
  const tBlood = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');

  if (!record) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-xs">
        <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">{t('noReadings')}</h3>
        <p className="text-sm text-slate-500 mb-4">Start by recording Mom&apos;s morning blood sugar.</p>
        <button
          onClick={onRecordClick}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow transition"
        >
          {t('recordReading')}
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

  const isCritical = record.targetStatus === 'critical_low' || record.valueMgDl < 54;
  const isHigh = record.targetStatus === 'high' || record.valueMgDl > (target?.targetMax ?? 130);
  const isLow = record.targetStatus === 'low' || (record.valueMgDl < 70 && !isCritical);
  const isNormal = record.targetStatus === 'normal' && !isHigh && !isLow && !isCritical;

  const statusBg = isCritical
    ? 'bg-red-50 border-red-300 text-red-900'
    : isHigh
    ? 'bg-amber-50 border-amber-300 text-amber-900'
    : isLow
    ? 'bg-amber-50 border-amber-300 text-amber-900'
    : 'bg-emerald-50 border-emerald-300 text-emerald-900';

  const statusBadge = isCritical ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
      Critical Low (&lt; 54 mg/dL)
    </span>
  ) : isHigh ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
      <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
      Above configured target
    </span>
  ) : isLow ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
      Below target
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
      <CheckCircle className="w-3.5 h-3.5 mr-1" />
      Within target
    </span>
  );

  return (
    <div
      className={`rounded-3xl p-6 border-2 shadow-xs transition ${statusBg} relative overflow-hidden`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wide uppercase opacity-80 mb-1">
            <Droplet className="w-4 h-4 text-teal-700" />
            <span>{t('latestReading')}</span>
          </div>

          <div className="flex items-baseline space-x-3 my-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
              {record.valueMgDl}
            </span>
            <span className="text-xl font-bold text-slate-600">
              mg/dL
            </span>
            <div>{statusBadge}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700 mt-2">
            <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
              {record.measurementType.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-slate-500" />
              {formattedDate}, {formattedTime} (Phnom Penh)
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1 text-slate-500" />
              {t('recordedBy')}: {record.recordedByName || 'Family Member'}
            </span>
          </div>

          {record.mealDescription && (
            <p className="text-xs text-slate-600 mt-2 italic bg-white/50 p-2 rounded-lg">
              &ldquo;{record.mealDescription}&rdquo;
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
          <button
            onClick={onRecordClick}
            className="w-full sm:w-auto px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-md transition touch-target text-center"
          >
            + {t('recordReading')}
          </button>
        </div>
      </div>
    </div>
  );
}

