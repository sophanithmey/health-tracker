'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Droplet, X, Calendar, Clock, AlertTriangle, Check } from 'lucide-react';
import { MeasurementType, NotificationAlert } from '@/types';
import { useGlucoseEntryForm } from '@/hooks/use-glucose-entry-form';
import { GlucoseEntryConfirmDialog } from './GlucoseEntryConfirmDialog';

interface GlucoseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (alert?: NotificationAlert) => void;
}

const quickSymptoms = [
  { id: 'thirst', labelKm: 'ស្រេកទឹកខុសធម្មតា', labelEn: 'Unusual thirst' },
  { id: 'dizziness', labelKm: 'វិលមុខ', labelEn: 'Dizziness' },
  { id: 'shakiness', labelKm: 'ញ័រដៃជើង', labelEn: 'Shakiness' },
  { id: 'sweating', labelKm: 'បែកញើសត្រជាក់', labelEn: 'Cold sweat' },
  { id: 'fatigue', labelKm: 'អស់កម្លាំង', labelEn: 'Fatigue' }
];

export function GlucoseEntryModal({ isOpen, onClose, onSuccess }: GlucoseEntryModalProps) {
  const t = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');

  const {
    valueMgDl,
    setValueMgDl,
    measurementType,
    setMeasurementType,
    measuredDate,
    setMeasuredDate,
    measuredTime,
    setMeasuredTime,
    mealDescription,
    setMealDescription,
    symptoms,
    toggleSymptom,
    notes,
    setNotes,
    showConfirm,
    setShowConfirm,
    isSubmitting,
    errorMsg,
    handleInitialSubmit,
    handleFinalConfirm
  } = useGlucoseEntryForm(onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-200/90 my-auto overflow-hidden">
        {showConfirm ? (
          <GlucoseEntryConfirmDialog
            valueMgDl={valueMgDl}
            measurementType={measurementType}
            measuredDate={measuredDate}
            measuredTime={measuredTime}
            symptoms={symptoms}
            isSubmitting={isSubmitting}
            onConfirm={handleFinalConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        ) : (
          <div>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Droplet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight font-khmer">
                    {t('logNewReading')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('recordReadingDesc') || "Record Mom's blood glucose and relevant context"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInitialSubmit} className="p-6 space-y-5">
              {errorMsg ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              {/* Value Input */}
              <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 text-center">
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                  {t('readingValue')} (mg/dL) *
                </label>
                <div className="flex items-center justify-center space-x-3">
                  <input
                    type="number"
                    step="1"
                    min="20"
                    max="600"
                    required
                    value={valueMgDl}
                    onChange={(e) => setValueMgDl(e.target.value)}
                    className="w-36 text-center text-4xl font-black text-slate-900 bg-white border-2 border-teal-600 rounded-2xl py-2 focus:outline-none focus:ring-4 focus:ring-teal-500/20 shadow-xs"
                  />
                  <span className="text-xl font-bold text-slate-500">mg/dL</span>
                </div>
              </div>

              {/* Measurement Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('measurementType')} *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {(['fasting', 'before_meal', '2h_after_meal', 'bedtime', 'random'] as MeasurementType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setMeasurementType(type)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        measurementType === type
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                      {measurementType === type ? <Check className="w-4 h-4" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {t('date') || 'Date'}
                  </label>
                  <input
                    type="date"
                    value={measuredDate}
                    onChange={(e) => setMeasuredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {t('time') || 'Time'}
                  </label>
                  <input
                    type="time"
                    value={measuredTime}
                    onChange={(e) => setMeasuredTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Symptoms Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('symptoms') || 'Symptoms (Optional)'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickSymptoms.map((sym) => {
                    const isSelected = symptoms.includes(sym.labelKm);
                    return (
                      <button
                        type="button"
                        key={sym.id}
                        onClick={() => toggleSymptom(sym.labelKm)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sym.labelKm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  placeholder={t('notesPlaceholder') || 'Additional notes or context...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-700/20 transition touch-target"
              >
                {tCommon('continue') || 'Review & Save'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
