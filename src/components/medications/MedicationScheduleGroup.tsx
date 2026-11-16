'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Sun, Moon, SunMedium, Bed, Clock } from 'lucide-react';
import { Medication, MedicationLog } from '@/types';
import { RoutinePeriod } from '@/lib/medication-schedule';
import { MedicationListItem } from './MedicationListItem';

interface MedicationScheduleGroupProps {
  period: RoutinePeriod;
  medications: Medication[];
  todayLogs: MedicationLog[];
  deletingId: string | null;
  quickLoggingId: string | null;
  onOpenDetail?: (rxcuiOrName: string, drugName: string) => void;
  onLogDose: (med: Medication) => void;
  onQuickMarkTaken: (med: Medication) => void;
  onDelete: (id: string, name: string) => void;
}

export function MedicationScheduleGroup({
  period,
  medications,
  todayLogs,
  deletingId,
  quickLoggingId,
  onOpenDetail,
  onLogDose,
  onQuickMarkTaken,
  onDelete
}: MedicationScheduleGroupProps) {
  const t = useTranslations('medications');

  if (medications.length === 0) return null;

  const RoutineIcon =
    period === 'morning' ? Sun :
    period === 'afternoon' ? SunMedium :
    period === 'evening' ? Moon :
    period === 'bedtime' ? Bed : Clock;

  return (
    <div className="space-y-3">
      {/* Schedule Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <RoutineIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 font-khmer">
              {t(`${period}Routine`)}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {t(`${period}RoutineHint`)}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {medications.length} {medications.length === 1 ? t('pillUnit') : t('pillsUnit')}
        </span>
      </div>

      {/* Medication Cards in this Routine */}
      <div className="space-y-3">
        {medications.map((med) => (
          <MedicationListItem
            key={med.id}
            med={med}
            todayLogs={todayLogs}
            isDeleting={deletingId === med.id}
            isQuickLogging={quickLoggingId === med.id}
            onOpenDetail={onOpenDetail}
            onLogDose={onLogDose}
            onQuickMarkTaken={onQuickMarkTaken}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
