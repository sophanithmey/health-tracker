'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Pill,
  Info,
  Check,
  CheckCircle2,
  Clock,
  Trash2,
  Sun,
  Moon,
  SunMedium,
  Bed,
  MoreVertical
} from 'lucide-react';
import { Medication, MedicationLog } from '@/types';
import {
  getMedicationRoutinePeriod,
  getTimingKhmerTranslation,
  getMedicationTodayLog,
  ROUTINE_METADATA
} from '@/lib/medication-schedule';

interface MedicationListItemProps {
  med: Medication;
  todayLogs: MedicationLog[];
  isDeleting: boolean;
  isQuickLogging?: boolean;
  onOpenDetail?: (rxcuiOrName: string, drugName: string) => void;
  onLogDose: (med: Medication) => void;
  onQuickMarkTaken: (med: Medication) => void;
  onDelete: (id: string, name: string) => void;
}

export function MedicationListItem({
  med,
  todayLogs,
  isDeleting,
  isQuickLogging = false,
  onOpenDetail,
  onLogDose,
  onQuickMarkTaken,
  onDelete
}: MedicationListItemProps) {
  const t = useTranslations('medications');
  const locale = useLocale();
  const isKhmer = locale === 'km';

  const period = getMedicationRoutinePeriod(med);
  const meta = ROUTINE_METADATA[period];
  const khmerTiming = getTimingKhmerTranslation(med.timingInstructions);
  const { isTakenToday, takenAtStr } = getMedicationTodayLog(med.id, todayLogs);

  const RoutineIcon =
    period === 'morning' ? Sun :
    period === 'afternoon' ? SunMedium :
    period === 'evening' ? Moon :
    period === 'bedtime' ? Bed : Clock;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isTakenToday
          ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-xs'
      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
    >
      <div className="flex items-start space-x-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
            isTakenToday ? 'bg-emerald-600 text-white' : 'bg-teal-50 border border-teal-200 text-teal-700'
          }`}
        >
          {isTakenToday ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base sm:text-lg font-black text-slate-900 font-khmer">
              {med.name}
            </h4>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {med.dosage}
            </span>

            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}>
              <RoutineIcon className="w-3.5 h-3.5 mr-1" />
              {t(`${period}Routine`)}
            </span>

            {isTakenToday ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3 mr-1 text-emerald-700" />
                {t('takenAt', { time: takenAtStr || '' })}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 mr-1 text-amber-600" />
                {t('dueToday')}
              </span>
            )}
          </div>

          {med.timingInstructions ? (
            <div className="text-xs text-slate-700 pt-0.5">
              <span className="font-semibold text-slate-900">{t('instructionsPrefix')} </span>
              <span>{med.timingInstructions}</span>
              {khmerTiming && !isKhmer ? <span className="text-slate-500 font-khmer ml-1">({khmerTiming})</span> : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
            {med.prescribingDoctor ? <span>Dr. {med.prescribingDoctor}</span> : null}
            <span>{med.frequency}</span>
          </div>

          {med.notes ? (
            <p className="text-xs text-slate-600 italic bg-slate-50/80 p-2 rounded-lg border border-slate-100 max-w-md">
              &ldquo;{med.notes}&rdquo;
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end flex-shrink-0">
        {onOpenDetail ? (
          <button
            type="button"
            onClick={() => onOpenDetail(med.rxcui || med.name, med.name)}
            className="flex-1 sm:flex-initial px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center space-x-1.5 touch-target"
            title="Drug Guide & FDA Safety"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('drugGuide')}</span>
          </button>
        ) : null}

        {isTakenToday ? (
          <button
            type="button"
            onClick={() => onLogDose(med)}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 touch-target"
            title="Log another dose or edit notes"
          >
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('takenStatus')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onQuickMarkTaken(med)}
            disabled={isQuickLogging}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition touch-target flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{isQuickLogging ? '...' : t('markTaken')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onLogDose(med)}
          className="p-2.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition border border-slate-200 hover:border-teal-200 touch-target"
          title={t('customDose')}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(med.id, med.name)}
          disabled={isDeleting}
          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200 touch-target disabled:opacity-50"
          title={t('removePrescription')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
