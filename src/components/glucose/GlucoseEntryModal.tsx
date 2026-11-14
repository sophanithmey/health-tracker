'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Droplet,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Utensils,
  AlertTriangle,
  Check,
  Activity,
  HeartPulse
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
  const locale = useLocale();
  const queryClient = useQueryClient();

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
      setErrorMsg(
        locale === 'km'
          ? 'សូមបញ្ចូលកម្រិតជាតិស្ករត្រឹមត្រូវចន្លោះពី ២០ ដល់ ៦០០ mg/dL'
          : 'Please enter a valid glucose reading between 20 and 600 mg/dL'
      );
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
        // Invalidate TanStack query cache so dashboard and history table reflect immediately
        await queryClient.invalidateQueries({ queryKey: ['glucose'] });
        await queryClient.invalidateQueries({ queryKey: ['reports'] });
        await queryClient.invalidateQueries({ queryKey: ['alerts'] });
        await queryClient.invalidateQueries({ queryKey: ['glucose-targets'] });
        await queryClient.invalidateQueries({ queryKey: ['patient'] });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header (Clean, Non-scrolling) */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Droplet className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-khmer tracking-tight">
                {t('formTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showConfirm ? (
          <form onSubmit={handleInitialSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="p-6 sm:px-8 py-6 overflow-y-auto space-y-6 flex-1">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center space-x-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Two Column Layout on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Value & Measurement Context */}
                <div className="space-y-5">
                  {/* Value Input (Senior friendly, huge font) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 font-khmer flex items-center justify-between">
                      <span>{t('valueLabel')} *</span>
                      <span className="text-teal-700 font-medium text-[11px]">mg/dL</span>
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
                        className="w-full text-3xl sm:text-4xl font-extrabold text-slate-900 bg-slate-50/80 border-2 border-teal-300 rounded-2xl py-3 px-4 focus:bg-white focus:border-teal-600 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 transition shadow-2xs pr-20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base sm:text-lg">
                        mg/dL
                      </span>
                    </div>

                    {/* Quick Preset Buttons for Elderly ease */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">
                        {locale === 'km' ? 'កែរហ័ស:' : 'Quick adjust:'}
                      </span>
                      {[100, 120, 140, 148, 160].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setValueMgDl(preset.toString())}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 rounded-xl text-xs font-bold transition"
                        >
                          {preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setValueMgDl((prev) => (parseFloat(prev || '0') + 5).toString())}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-black transition"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setValueMgDl((prev) => Math.max(20, parseFloat(prev || '0') - 5).toString())
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition"
                      >
                        -5
                      </button>
                    </div>
                  </div>

                  {/* Measurement Type / Context */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 font-khmer">
                      {t('typeLabel')} *
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
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
                          className={`p-3 rounded-2xl border text-left font-bold transition flex items-center justify-between ${
                            measurementType === item.id
                              ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-2 ring-teal-200'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs sm:text-sm leading-tight">{item.label}</span>
                          {measurementType === item.id && (
                            <Check className="w-4 h-4 text-teal-700 flex-shrink-0 ml-1.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Date, Time, Meal, Symptoms & Notes */}
                <div className="space-y-4">
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>{tCommon('date')} *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={measuredDate}
                        onChange={(e) => setMeasuredDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>{tCommon('time')} *</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={measuredTime}
                        onChange={(e) => setMeasuredTime(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Meal description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                      <Utensils className="w-4 h-4 text-teal-600" />
                      <span>{t('mealDescription')} ({locale === 'km' ? 'ជម្រើស' : 'Optional'})</span>
                    </label>
                    <input
                      type="text"
                      value={mealDescription}
                      onChange={(e) => setMealDescription(e.target.value)}
                      placeholder={
                        locale === 'km'
                          ? 'ឧ. មុនបាយព្រឹក អត់អាហារ ១០ ម៉ោង'
                          : 'e.g. Before breakfast, fasting 10 hours'
                      }
                      className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                    />
                  </div>

                  {/* Symptoms Observed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                      {t('symptoms')} ({locale === 'km' ? 'ជម្រើស' : 'Optional'})
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickSymptoms.map((sym) => {
                        const isSelected = symptoms.includes(sym.labelEn);
                        return (
                          <button
                            key={sym.id}
                            type="button"
                            onClick={() => toggleSymptom(sym.labelEn)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              isSelected
                                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {locale === 'km' ? sym.labelKm : sym.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                      {tCommon('notes')} ({locale === 'km' ? 'ជម្រើស' : 'Optional'})
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        locale === 'km'
                          ? 'កំណត់ចំណាំបន្ថែមសម្រាប់គ្រួសារ ឬគ្រូពេទ្យ...'
                          : 'Additional context for family or clinician...'
                      }
                      className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Non-scrolling Footer with Action Buttons */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition touch-target"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl text-sm shadow-md transition flex items-center space-x-2 touch-target"
              >
                <Check className="w-5 h-5" />
                <span>{t('saveReading')}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Dialog Step */
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 sm:px-8 py-8 overflow-y-auto space-y-6 flex-1 text-center max-w-xl mx-auto w-full">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 font-khmer">
                  {t('confirmTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">{t('confirmMessage')}</p>
              </div>

              <div className="bg-slate-50/80 rounded-3xl p-5 text-left border border-slate-200 space-y-3.5">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
                  <span className="text-xs sm:text-sm font-bold text-slate-500">{t('valueLabel')}:</span>
                  <span className="text-3xl font-black text-teal-800">
                    {valueMgDl} <span className="text-base text-slate-400 font-bold">mg/dL</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-bold text-slate-500">{t('typeLabel')}:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {measurementType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-bold text-slate-500">{tCommon('date')} & {tCommon('time')}:</span>
                  <span className="font-bold text-slate-700">
                    {measuredDate} at {measuredTime}
                  </span>
                </div>
                {mealDescription && (
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-700">{locale === 'km' ? 'អាហារ:' : 'Meal:'}</span> {mealDescription}
                  </div>
                )}
              </div>

              {parseFloat(valueMgDl) < 70 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs text-left flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block text-amber-950 mb-0.5">
                      {locale === 'km' ? 'ការព្រមានកម្រិតជាតិស្ករទាប:' : 'Low Blood Sugar Warning:'}
                    </span>
                    {locale === 'km'
                      ? 'ប្រសិនបើអ្នកជំងឺដឹងខ្លួន សូមត្រៀមស្ករស្រូបលឿន ១៥ ក្រាម (គោលការណ៍ ១៥-១៥)។'
                      : 'If conscious, prepare 15g fast-acting sugar (15-15 Rule).'}
                  </div>
                </div>
              )}
            </div>

            {/* Non-scrolling Confirmation Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition touch-target"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl text-sm shadow-md transition flex items-center space-x-2 touch-target"
              >
                <Check className="w-5 h-5" />
                <span>{isSubmitting ? tCommon('loading') : tCommon('confirm')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
