'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Medication, MedicationLog } from '@/types';
import { Pill, CheckCircle2, Clock, Plus, ShieldCheck, User } from 'lucide-react';
import { DoseLogModal } from './DoseLogModal';
import { useRole } from '@/context/RoleContext';

interface MedicationListProps {
  medications: Medication[];
  logs: MedicationLog[];
  onRefresh: () => void;
}

export function MedicationList({ medications, logs, onRefresh }: MedicationListProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const { role } = useRole();
  const [selectedMedForLog, setSelectedMedForLog] = useState<Medication | null>(null);

  return (
    <div className="space-y-6">
      {/* Prescribed Medications Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('title')}</h3>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      {med.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-teal-800 mt-1">
                    Frequency: {med.frequency}
                  </p>
                  {med.timingInstructions && (
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Instructions:</strong> {med.timingInstructions}
                    </p>
                  )}
                  {med.prescribingDoctor && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Prescribed by {med.prescribingDoctor}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => setSelectedMedForLog(med)}
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition touch-target"
                >
                  + {t('logDose')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t('safetyWarning')}</p>
        </div>
      </div>

      {/* Medication Adherence Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Recent Medication Dose Logs</h3>
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No medication doses recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const d = new Date(log.recordedTime);
              const formatted = d.toLocaleDateString('en-US', {
                timeZone: 'Asia/Phnom_Penh',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isTaken = log.status === 'taken';
              const isMissed = log.status === 'missed';

              return (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isTaken ? 'bg-emerald-500' : isMissed ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-slate-800">{log.medicationName}</span>
                      <div className="text-[11px] text-slate-500">
                        Recorded by {log.recordedByName || 'Family'} • {formatted} (Phnom Penh)
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-800'
                          : isMissed
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dose Log Modal */}
      {selectedMedForLog && (
        <DoseLogModal
          medication={selectedMedForLog}
          isOpen={Boolean(selectedMedForLog)}
          onClose={() => setSelectedMedForLog(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

