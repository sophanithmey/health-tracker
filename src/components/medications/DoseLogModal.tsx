'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Pill, X, Check, AlertCircle, Clock } from 'lucide-react';
import { Medication, MedicationDoseStatus } from '@/types';

interface DoseLogModalProps {
  medication: Medication;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DoseLogModal({ medication, isOpen, onClose, onSuccess }: DoseLogModalProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');

  const [status, setStatus] = useState<MedicationDoseStatus>('taken');
  const [scheduledTime, setScheduledTime] = useState<string>(() => new Date().toISOString());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/medications/logs', {
        medicationId: medication.id,
        status,
        scheduledTime,
        notes: notes.trim() || undefined
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to log dose');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3 text-teal-800 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('logDose')}</h3>
            <p className="text-xs text-slate-500">{medication.name} ({medication.dosage})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Dose Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'taken', label: t('taken'), color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { id: 'missed', label: t('missed'), color: 'border-amber-500 bg-amber-50 text-amber-900' },
                { id: 'skipped_by_doctor', label: t('skippedByDoctor'), color: 'border-purple-500 bg-purple-50 text-purple-900' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id as MedicationDoseStatus)}
                  className={`p-3 rounded-xl border text-left font-bold text-xs sm:text-sm transition flex items-center justify-between ${
                    status === item.id
                      ? `${item.color} shadow-xs ring-2 ring-teal-200`
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {status === item.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken after breakfast with water"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-[11px] text-teal-900">
            {t('safetyWarning')}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow"
            >
              {isSubmitting ? tCommon('loading') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

