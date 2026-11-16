'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Target, X, AlertTriangle, Layers, FileText } from 'lucide-react';
import { GlucoseTarget, MeasurementType } from '@/types';
import { useTargetForm } from '@/hooks/use-target-form';
import { TargetPresetsSelector } from './TargetPresetsSelector';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  target?: GlucoseTarget | null;
  patientId?: string;
}

export function TargetModal({
  isOpen,
  onClose,
  onSuccess,
  target,
  patientId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
}: TargetModalProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');

  const {
    measurementType,
    setMeasurementType,
    thresholdMode,
    setThresholdMode,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    effectiveFrom,
    setEffectiveFrom,
    effectiveUntil,
    setEffectiveUntil,
    notes,
    setNotes,
    reason,
    setReason,
    activePreset,
    applyPreset,
    isSubmitting,
    errorMsg,
    handleSubmit
  } = useTargetForm(target, patientId, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-200/90 my-auto overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-khmer">
                {target ? t('editTarget') || 'Edit Target' : t('newTarget') || 'New Glycemic Target'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set personalized clinical blood glucose boundaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {/* Quick Presets */}
          <TargetPresetsSelector
            activePreset={activePreset}
            onSelectPreset={applyPreset}
          />

          {/* Measurement Context & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Context *
              </label>
              <select
                value={measurementType}
                onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="fasting">Fasting (អត់អាហារ)</option>
                <option value="before_meal">Before Meal (មុនបាយ)</option>
                <option value="1h_after_meal">1h Post-Meal (១ម៉ោងក្រោយបាយ)</option>
                <option value="2h_after_meal">2h Post-Meal (២ម៉ោងក្រោយបាយ)</option>
                <option value="bedtime">Bedtime (មុនចូលគេង)</option>
                <option value="random">Random (ពេលណាក៏បាន)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rule Mode *
              </label>
              <select
                value={thresholdMode}
                onChange={(e) => setThresholdMode(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="range">Range (Min &amp; Max)</option>
                <option value="upper_only">Upper Threshold Only</option>
                <option value="lower_only">Lower Threshold Only</option>
              </select>
            </div>
          </div>

          {/* Target Value Range Inputs */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min (mg/dL) {thresholdMode !== 'upper_only' ? '*' : '(optional)'}
                </label>
                <input
                  type="number"
                  min="40"
                  max="400"
                  disabled={thresholdMode === 'upper_only'}
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  placeholder="80"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max (mg/dL) {thresholdMode !== 'lower_only' ? '*' : '(optional)'}
                </label>
                <input
                  type="number"
                  min="40"
                  max="400"
                  disabled={thresholdMode === 'lower_only'}
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  placeholder="130"
                />
              </div>
            </div>
          </div>

          {/* Dates & Clinical Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Effective From *</label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Effective Until</label>
              <input
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical reason or ADA guidelines reference..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-700/20 transition flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            <span>{target ? 'Update Target' : 'Save Glycemic Target'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
