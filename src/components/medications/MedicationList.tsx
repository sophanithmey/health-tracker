'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { medicationService } from '@/services/medication-service';
import { Pill, Plus, ShieldCheck, LayoutGrid, ListFilter } from 'lucide-react';
import { Medication, MedicationLog } from '@/types';
import { RoutinePeriod, getMedicationRoutinePeriod, getMedicationTodayLog } from '@/lib/medication-schedule';
import { MedicationListItem } from './MedicationListItem';
import { MedicationScheduleGroup } from './MedicationScheduleGroup';
import { TodayAdherenceBanner } from './TodayAdherenceBanner';
import { MedicationDoseLogsList } from './MedicationDoseLogsList';

const DoseLogModal = dynamic(() => import('./DoseLogModal').then((m) => m.DoseLogModal), { ssr: false });
const AddMedicationModal = dynamic(() => import('./AddMedicationModal').then((m) => m.AddMedicationModal), { ssr: false });

const ROUTINE_PERIODS: RoutinePeriod[] = ['morning', 'afternoon', 'evening', 'bedtime', 'other'];

interface MedicationListProps {
  medications: Medication[];
  logs: MedicationLog[];
  onRefresh: () => void;
  onOpenDetail?: (rxcuiOrName: string, drugName: string) => void;
}

export function MedicationList({ medications, logs, onRefresh, onOpenDetail }: MedicationListProps) {
  const t = useTranslations('medications');

  const [selectedMedForLog, setSelectedMedForLog] = useState<Medication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quickLoggingId, setQuickLoggingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'schedule' | 'all'>('schedule');

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from active medications?`)) return;
    setDeletingId(id);
    try {
      await medicationService.deleteMedication(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete medication');
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickMarkTaken = async (med: Medication) => {
    setQuickLoggingId(med.id);
    try {
      await medicationService.logDose({
        medicationId: med.id,
        status: 'taken',
        scheduledTime: new Date().toISOString(),
        recordedTime: new Date().toISOString(),
        notes: `Quick logged from Routine (${med.timingInstructions || 'Scheduled'})`
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record dose');
    } finally {
      setQuickLoggingId(null);
    }
  };

  const activeMeds = medications.filter((m) => m.isActive);
  const takenCount = activeMeds.filter((m) => getMedicationTodayLog(m.id, logs).isTakenToday).length;
  const totalCount = activeMeds.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const allTaken = totalCount > 0 && takenCount === totalCount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-khmer">
              {t('title') || "Mom's Prescribed Medications"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('routineScheduleSubtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('schedule')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  viewMode === 'schedule' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{t('bySchedule')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  viewMode === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{t('allPills')}</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addMedication')}</span>
            </button>
          </div>
        </div>

        <TodayAdherenceBanner
          takenCount={takenCount}
          totalCount={totalCount}
          adherencePercent={adherencePercent}
          allTaken={allTaken}
        />

        {medications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">
              {t('noMedicationsFound')}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Click the button above to add prescribed oral medications.
            </p>
          </div>
        ) : viewMode === 'schedule' ? (
          <div className="space-y-6">
            {ROUTINE_PERIODS.map((period) => {
              const periodMeds = medications.filter((m) => getMedicationRoutinePeriod(m) === period);
              if (periodMeds.length === 0) return null;
              return (
                <MedicationScheduleGroup
                  key={period}
                  period={period}
                  medications={periodMeds}
                  todayLogs={logs}
                  deletingId={deletingId}
                  quickLoggingId={quickLoggingId}
                  onOpenDetail={onOpenDetail}
                  onLogDose={(m) => setSelectedMedForLog(m)}
                  onQuickMarkTaken={handleQuickMarkTaken}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <MedicationListItem
                key={med.id}
                med={med}
                todayLogs={logs}
                isDeleting={deletingId === med.id}
                isQuickLogging={quickLoggingId === med.id}
                onOpenDetail={onOpenDetail}
                onLogDose={(m) => setSelectedMedForLog(m)}
                onQuickMarkTaken={handleQuickMarkTaken}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t('safetyWarning')}</p>
        </div>
      </div>

      <MedicationDoseLogsList logs={logs} />

      {selectedMedForLog ? (
        <DoseLogModal
          isOpen={Boolean(selectedMedForLog)}
          medication={selectedMedForLog}
          onClose={() => setSelectedMedForLog(null)}
          onSuccess={onRefresh}
        />
      ) : null}

      {isAddModalOpen ? (
        <AddMedicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={onRefresh}
        />
      ) : null}
    </div>
  );
}
