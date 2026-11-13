'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import {
  Droplet,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Utensils,
  AlertTriangle
} from 'lucide-react';
import { MeasurementType, NotificationAlert } from '@/types';

interface GlucoseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (alert?: NotificationAlert) => void;
}

export function GlucoseEntryModal({ isOpen, onClose, onSuccess }: GlucoseEntryModalProps) {
  const t = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');
  const tAlerts = useTranslations('alerts');

  const [valueMgDl, setValueMgDl] = useState<string>('148');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('fasting');
  const [measuredDate, setMeasuredDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [measuredTime, setMeasuredTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [mealDescription, setMealDescription] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickSymptoms = [
    { id: 'thirst', labelKm: 'ស្រេកទឹកខុសធម្មតា', labelEn: 'Unusual thirst' },
    { id: 'dizziness', labelKm: 'វិលមុខ', labelEn: 'Dizziness' },
    { id: 'shakiness', labelKm: 'ញ័រដៃជើង', labelEn: 'Shakiness' },
    { id: 'sweating', labelKm: 'បែកញើសត្រជាក់', labelEn: 'Cold sweat' },
    { id: 'fatigue', labelKm: 'អស់កម្លាំង', labelEn: 'Fatigue' }
  ];

  const toggleSymptom = (label: string) => {
    setSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueMgDl);
    if (isNaN(val) || val < 20 || val > 600) {
      setErrorMsg('Please enter a valid glucose reading between 20 and 600 mg/dL');
      return;
    }
    setErrorMsg(null);
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const combinedDateTime = new Date(`${measuredDate}T${measuredTime}:00`).toISOString();

      const res = await axios.post('/api/glucose', {
        valueMgDl: parseFloat(valueMgDl),
        measurementType,
        measuredAt: combinedDateTime,
        mealDescription: mealDescription.trim() || undefined,
        symptoms,
        notes: notes.trim() || undefined
      });

      if (res.data?.success) {
        onSuccess(res.data.data?.alert);
        setShowConfirm(false);
        onClose();
      } else {
        setErrorMsg(res.data?.error || 'Failed to save glucose reading');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Error saving reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {!showConfirm ? (
          <div>
            <div className="flex items-center space-x-3 text-teal-800 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                <Droplet className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('formTitle')}</h2>
                <p className="text-xs text-slate-500">{t('subtitle')}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInitialSubmit} className="space-y-5">
              {/* Value Input (Senior friendly, huge font) */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  {t('valueLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="20"
                    max="600"
                    required
                    value={valueMgDl}
                    onChange={(e) => setValueMgDl(e.target.value)}
                    placeholder={t('valuePlaceholder')}
                    className="w-full text-3xl font-extrabold text-slate-900 bg-slate-50 border-2 border-teal-300 rounded-2xl py-3 px-4 focus:bg-white focus:border-teal-600 focus:outline-none transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                    mg/dL
                  </span>
                </div>

                {/* Quick Preset Buttons for Elderly ease */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-slate-500">Quick adjust:</span>
                  {[120, 140, 148, 160].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValueMgDl(preset.toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 rounded-lg text-xs font-semibold transition"
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setValueMgDl((prev) => (parseFloat(prev || '0') + 5).toString())}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValueMgDl((prev) => Math.max(20, parseFloat(prev || '0') - 5).toString())
                    }
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold"
                  >
                    -5
                  </button>
                </div>
              </div>

              {/* Measurement Type / Context */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  {t('typeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { id: 'fasting', label: t('fasting') },
                    { id: 'before_meal', label: t('before_meal') },
                    { id: '1h_after_meal', label: t('1h_after_meal') },
                    { id: '2h_after_meal', label: t('2h_after_meal') },
                    { id: 'bedtime', label: t('bedtime') },
                    { id: 'other', label: t('other') }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMeasurementType(item.id as MeasurementType)}
                      className={`p-3 rounded-xl border text-left font-medium transition text-xs sm:text-sm ${
                        measurementType === item.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                    {tCommon('date')}
                  </label>
                  <input
                    type="date"
                    value={measuredDate}
                    onChange={(e) => setMeasuredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                    {tCommon('time')} (Asia/Phnom_Penh)
                  </label>
                  <input
                    type="time"
                    value={measuredTime}
                    onChange={(e) => setMeasuredTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Meal description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  <Utensils className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  {t('mealDescription')}
                </label>
                <input
                  type="text"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="e.g. Before breakfast, fasting 10 hours"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              {/* Symptoms Observed */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t('symptoms')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickSymptoms.map((sym) => {
                    const isSelected = symptoms.includes(sym.labelEn);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleSymptom(sym.labelEn)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sym.labelKm} ({sym.labelEn})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {tCommon('notes')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context for family or clinician..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-base shadow-md transition touch-target"
              >
                {t('saveReading')}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Dialog Step */
          <div className="py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t('confirmTitle')}
            </h3>
            <p className="text-sm text-slate-500 mb-6">{t('confirmMessage')}</p>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left border border-slate-200 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">{t('valueLabel')}:</span>
                <span className="text-2xl font-black text-teal-800">
                  {valueMgDl} mg/dL
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('typeLabel')}:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {measurementType.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{tCommon('date')} & {tCommon('time')}:</span>
                <span className="font-medium text-slate-700">
                  {measuredDate} at {measuredTime} (Asia/Phnom_Penh)
                </span>
              </div>
              {mealDescription && (
                <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-semibold">Meal:</span> {mealDescription}
                </div>
              )}
            </div>

            {parseFloat(valueMgDl) < 70 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs mb-4 text-left flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Low Blood Sugar Warning:</span> If conscious, prepare 15g fast-acting sugar (15-15 Rule).
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow transition"
              >
                {isSubmitting ? tCommon('loading') : tCommon('confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

