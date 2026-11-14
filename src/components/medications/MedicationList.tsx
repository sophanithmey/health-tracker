'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';
import { Medication, MedicationLog } from '@/types';
import { Pill, CheckCircle2, Clock, Plus, ShieldCheck, User, Trash2, Info } from 'lucide-react';
import { DoseLogModal } from './DoseLogModal';
import { AddMedicationModal } from './AddMedicationModal';
import { useRole } from '@/context/RoleContext';

interface MedicationListProps {
  medications: Medication[];
  logs: MedicationLog[];
  onRefresh: () => void;
  onOpenDetail?: (rxcui: string, drugName: string) => void;
}

export function MedicationList({ medications, logs, onRefresh, onOpenDetail }: MedicationListProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { role } = useRole();

  const [selectedMedForLog, setSelectedMedForLog] = useState<Medication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg =
      locale === 'km'
        ? `តើអ្នកពិតជាចង់លុបថ្នាំ «${name}» ចេញពីបញ្ជីមែនទេ?`
        : `Are you sure you want to remove "${name}" from the medication list?`;

    if (!window.confirm(confirmMsg)) return;

    setDeletingId(id);
    try {
      await axios.delete(`/api/medications/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete medication');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prescribed Medications Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-2xs">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-khmer">{t('title')}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{t('subtitle')}</p>
          </div>

          {/* Add Medication Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 touch-target self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addMedication')}</span>
          </button>
        </div>

        {/* Empty State vs List */}
        {medications.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50/70 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Pill className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 font-khmer">
              {locale === 'km' ? 'មិនទាន់មានថ្នាំក្នុងបញ្ជីនៅឡើយទេ' : 'No medications recorded yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {locale === 'km'
                ? 'ចុចលើប៊ូតុងខាងក្រោមដើម្បីកត់ត្រាថ្នាំលេបតាមវេជ្ជបញ្ជារបស់ម៉ាក់។'
                : "Click the button below to add Mom's prescribed oral diabetes medications."}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-2xl shadow-md transition touch-target inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addMedication')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-teal-50/80"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 font-khmer">
                        {med.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        {med.dosage}
                      </span>
                      {med.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-teal-900 mt-1">
                      Frequency: {med.frequency}
                    </p>
                    {med.timingInstructions && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        <strong>Instructions:</strong> {med.timingInstructions}
                      </p>
                    )}
                    {med.prescribingDoctor && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Prescribed by {med.prescribingDoctor}
                      </p>
                    )}
                    {med.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 bg-white/70 p-2 rounded-lg border border-slate-200/60 max-w-md">
                        &ldquo;{med.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-teal-200/60 w-full sm:w-auto justify-end flex-shrink-0">
                  {onOpenDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenDetail(med.rxcui || med.name, med.name)}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200/90 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center space-x-1.5 touch-target"
                      title={locale === 'km' ? 'ព័ត៌មានឱសថ & សុវត្ថិភាព' : 'View Drug Guide'}
                    >
                      <Info className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                      <span>{locale === 'km' ? 'ព័ត៌មានឱសថ' : 'Drug Guide'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedMedForLog(med)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition touch-target flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span>{t('logDose')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(med.id, med.name)}
                    disabled={deletingId === med.id}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200 touch-target disabled:opacity-50"
                    title={locale === 'km' ? 'លុបថ្នាំ' : 'Delete medication'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t('safetyWarning')}</p>
        </div>
      </div>

      {/* Medication Adherence Logs */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 font-khmer">
          {locale === 'km' ? 'កំណត់ត្រាការលេបថ្នាំថ្មីៗ' : 'Recent Medication Dose Logs'}
        </h3>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {locale === 'km'
              ? 'មិនទាន់មានកំណត់ត្រាការលេបថ្នាំនៅឡើយទេ។ ចុច «+ កត់ត្រាការលេប» នៅលើថ្នាំដែលត្រូវលេប។'
              : 'No medication doses recorded yet. Click "+ Log Dose" to record a scheduled dose.'}
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

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onRefresh}
      />

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
