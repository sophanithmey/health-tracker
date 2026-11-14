'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { X, Target, ShieldAlert, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { GlucoseTarget, MeasurementType } from '@/types';
import { useRole } from '@/context/RoleContext';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  target?: GlucoseTarget | null; // null for creating new
}

export function TargetModal({ isOpen, onClose, onSuccess, target }: TargetModalProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');
  const { role } = useRole();

  const [measurementType, setMeasurementType] = useState<MeasurementType>('fasting');
  const [thresholdMode, setThresholdMode] = useState<'range' | 'upper_only' | 'lower_only'>('range');
  const [minValue, setMinValue] = useState<string>('80');
  const [maxValue, setMaxValue] = useState<string>('130');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [effectiveUntil, setEffectiveUntil] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setMeasurementType(target.measurementType);
      const min = target.minValue ?? target.targetMin;
      const max = target.maxValue ?? target.targetMax;

      if (min && !max) {
        setThresholdMode('lower_only');
        setMinValue(String(min));
        setMaxValue('');
      } else if (!min && max) {
        setThresholdMode('upper_only');
        setMinValue('');
        setMaxValue(String(max));
      } else {
        setThresholdMode('range');
        setMinValue(min ? String(min) : '80');
        setMaxValue(max ? String(max) : '130');
      }

      setEffectiveFrom(
        target.effectiveFrom
          ? target.effectiveFrom.split('T')[0]
          : target.effectiveDate.split('T')[0]
      );
      setEffectiveUntil(target.effectiveUntil ? target.effectiveUntil.split('T')[0] : '');
      setNotes(target.notes || target.clinicianNotes || '');
      setReason('');
    } else {
      setMeasurementType('fasting');
      setThresholdMode('range');
      setMinValue('80');
      setMaxValue('130');
      setEffectiveFrom(new Date().toISOString().split('T')[0]);
      setEffectiveUntil('');
      setNotes('');
      setReason('');
    }
    setError(null);
  }, [target, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const min =
        thresholdMode === 'range' || thresholdMode === 'lower_only'
          ? Number(minValue)
          : null;
      const max =
        thresholdMode === 'range' || thresholdMode === 'upper_only'
          ? Number(maxValue)
          : null;

      if (min !== null && (isNaN(min) || min <= 0)) {
        throw new Error('Minimum value must be a positive number');
      }
      if (max !== null && (isNaN(max) || max <= 0)) {
        throw new Error('Maximum value must be a positive number');
      }
      if (min !== null && max !== null && min >= max) {
        throw new Error('Target maximum must be strictly greater than target minimum');
      }

      if (target?.id) {
        // Edit existing target
        await axios.patch(`/api/patients/${target.patientId}/glucose-targets/${target.id}`, {
          minValue: min,
          maxValue: max,
          targetMin: min ?? undefined,
          targetMax: max ?? undefined,
          notes: notes.trim() || undefined,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : undefined,
          effectiveUntil: effectiveUntil ? new Date(effectiveUntil).toISOString() : null,
          reason: reason.trim() || undefined
        });
      } else {
        // Create new target
        await axios.post(`/api/patients/a1b2c3d4-e5f6-7890-abcd-ef1234567890/glucose-targets`, {
          measurementType,
          minValue: min,
          maxValue: max,
          unit: 'mg/dL',
          source: 'clinician_configured',
          notes: notes.trim() || undefined,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : undefined,
          effectiveUntil: effectiveUntil ? new Date(effectiveUntil).toISOString() : null
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save glucose target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {target ? t('editTargetTitle') : t('newTargetTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {role === 'clinician'
                  ? 'Clinician direct configuration & approval'
                  : 'Propose target for clinician review'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Approval Warning Banner */}
        <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-bold text-amber-900 mb-0.5">
              {t('approvalNoticeTitle')}
            </strong>
            {role === 'clinician'
              ? t('clinicianImmediateNotice')
              : t('caregiverPendingNotice')}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Measurement Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('measurementType')}
            </label>
            <select
              value={measurementType}
              onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
              disabled={Boolean(target)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="fasting">Fasting (ពេលព្រឹកព្រលឹម - អត់អាហារ)</option>
              <option value="before_meal">Before Meal (មុនពេលអាហារ)</option>
              <option value="1h_after_meal">1h After Meal (១ ម៉ោងក្រោយអាហារ)</option>
              <option value="2h_after_meal">2h After Meal (២ ម៉ោងក្រោយអាហារ)</option>
              <option value="bedtime">Bedtime (មុនពេលចូលគេង)</option>
              <option value="random">Random / Casual Reading (វាស់ចៃដន្យ)</option>
              <option value="other">Other (ផ្សេងទៀត)</option>
            </select>
          </div>

          {/* Threshold Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('thresholdMode')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThresholdMode('range')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  thresholdMode === 'range'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Range (Min–Max)
              </button>
              <button
                type="button"
                onClick={() => setThresholdMode('upper_only')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  thresholdMode === 'upper_only'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Upper Only (≤ Max)
              </button>
              <button
                type="button"
                onClick={() => setThresholdMode('lower_only')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  thresholdMode === 'lower_only'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Lower Only (≥ Min)
              </button>
            </div>
          </div>

          {/* Min and Max Inputs */}
          <div className="grid grid-cols-2 gap-3">
            {(thresholdMode === 'range' || thresholdMode === 'lower_only') && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t('targetMin')} (mg/dL) *
                </label>
                <input
                  type="number"
                  min="40"
                  max="300"
                  step="1"
                  required
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {(thresholdMode === 'range' || thresholdMode === 'upper_only') && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t('targetMax')} (mg/dL) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  step="1"
                  required
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="e.g. 130"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('effectiveFrom')}</span>
              </label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('effectiveUntil')} ({tCommon('optional')})</span>
              </label>
              <input
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Clinician Notes / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t('clinicalNotes')} ({tCommon('optional')})
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Configured per Dr. Sambath's recommendation for mom's kidney-friendly regimen"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {target && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {t('reasonForChange')}
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Adjusted post-meal threshold following clinic visit"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? tCommon('saving') : t('saveTarget')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
