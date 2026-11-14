'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';
import {
  Target,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  Check,
  AlertTriangle,
  Layers
} from 'lucide-react';
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
  const locale = useLocale();
  const { role } = useRole();

  const [measurementType, setMeasurementType] = useState<MeasurementType>('fasting');
  const [thresholdMode, setThresholdMode] = useState<'range' | 'upper_only' | 'lower_only'>('range');
  const [minValue, setMinValue] = useState<string>('80');
  const [maxValue, setMaxValue] = useState<string>('130');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [effectiveUntil, setEffectiveUntil] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string | null>('fasting_standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clinicalPresets = [
    {
      id: 'fasting_standard',
      labelKm: 'Fasting ៨០–១៣០ (ADA)',
      labelEn: 'Fasting 80–130 (ADA)',
      type: 'fasting' as MeasurementType,
      mode: 'range' as const,
      min: '80',
      max: '130',
      notesKm: 'គោលការណ៍ណែនាំស្តង់ដារ ADA សម្រាប់ពេលព្រឹកព្រលឹម (អត់អាហារ ៨-១០ ម៉ោង)',
      notesEn: 'Standard ADA recommendation for fasting (8–10h without food)'
    },
    {
      id: 'postmeal_standard',
      labelKm: 'ក្រោយអាហារ ≤ ១៨០',
      labelEn: 'Post-Meal ≤ 180 (ADA)',
      type: '2h_after_meal' as MeasurementType,
      mode: 'upper_only' as const,
      min: '',
      max: '180',
      notesKm: 'កម្រិតពិដានក្រោយអាហារ ២ ម៉ោង តិចជាង ១៨០ mg/dL',
      notesEn: 'ADA peak 2-hour postprandial goal: under 180 mg/dL'
    },
    {
      id: 'bedtime_safe',
      labelKm: 'មុនចូលគេង ១០០–១៤០',
      labelEn: 'Bedtime 100–140 (Safe)',
      type: 'bedtime' as MeasurementType,
      mode: 'range' as const,
      min: '100',
      max: '140',
      notesKm: 'កម្រិតសុវត្ថិភាពពេលយប់ការពារការធ្លាក់ជាតិស្ករ',
      notesEn: 'Overnight glycemic safety target to prevent nocturnal hypoglycemia'
    },
    {
      id: 'fasting_tight',
      labelKm: 'Fasting ៧០–១១០ (Strict)',
      labelEn: 'Fasting 70–110 (Strict)',
      type: 'fasting' as MeasurementType,
      mode: 'range' as const,
      min: '70',
      max: '110',
      notesKm: 'គោលដៅតឹងរ៉ឹងសម្រាប់អ្នកជំងឺវ័យក្មេង ឬស្ថិតក្នុងដំណាក់កាលដំបូង',
      notesEn: 'Stringent glycemic target for early-stage management'
    }
  ];

  const applyPreset = (preset: (typeof clinicalPresets)[0]) => {
    setActivePreset(preset.id);
    setMeasurementType(preset.type);
    setThresholdMode(preset.mode);
    setMinValue(preset.min);
    setMaxValue(preset.max);
    setNotes(locale === 'km' ? preset.notesKm : preset.notesEn);
  };

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
      setActivePreset(null);
    } else {
      setMeasurementType('fasting');
      setThresholdMode('range');
      setMinValue('80');
      setMaxValue('130');
      setEffectiveFrom(new Date().toISOString().split('T')[0]);
      setEffectiveUntil('');
      setNotes(
        locale === 'km'
          ? 'គោលការណ៍ណែនាំស្តង់ដារ ADA សម្រាប់ពេលព្រឹកព្រលឹម (អត់អាហារ ៨-១០ ម៉ោង)'
          : 'Standard ADA recommendation for fasting (8–10h without food)'
      );
      setReason('');
      setActivePreset('fasting_standard');
    }
    setErrorMsg(null);
  }, [target, isOpen, locale]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
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
        throw new Error(
          locale === 'km'
            ? 'កម្រិតអប្បបរមាត្រូវតែជាចំនួនវិជ្ជមាន'
            : 'Minimum value must be a positive number'
        );
      }
      if (max !== null && (isNaN(max) || max <= 0)) {
        throw new Error(
          locale === 'km'
            ? 'កម្រិតអតិបរមាត្រូវតែជាចំនួនវិជ្ជមាន'
            : 'Maximum value must be a positive number'
        );
      }
      if (min !== null && max !== null && min >= max) {
        throw new Error(
          locale === 'km'
            ? 'កម្រិតអតិបរមាត្រូវតែធំជាងកម្រិតអប្បបរមា'
            : 'Target maximum must be strictly greater than target minimum'
        );
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
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          (locale === 'km'
            ? 'មានបញ្ហាក្នុងការរក្សាទុកគោលដៅជាតិស្ករ'
            : 'Failed to save glucose target')
      );
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
              <Target className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-khmer tracking-tight">
                {target ? t('editTargetTitle') : t('newTargetTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {role === 'clinician'
                  ? locale === 'km'
                    ? 'ការកំណត់ និងការអនុម័តគោលដៅជាតិស្ករផ្ទាល់ដោយវេជ្ជបណ្ឌិត'
                    : 'Clinician direct configuration & immediate approval'
                  : locale === 'km'
                  ? 'ស្នើគោលដៅជាតិស្ករសម្រាប់ការពិនិត្យ និងយល់ព្រមពីវេជ្ជបណ្ឌិត'
                  : 'Propose target for clinician review & approval'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Clinical Presets Banner */}
            <div className="p-4 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-teal-50/60 border border-teal-200/70 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900 mb-2.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span className="font-khmer">
                  {locale === 'km'
                    ? 'ជម្រើសគោលដៅគ្លីនិករហ័ស (ADA Clinical Targets):'
                    : 'Common ADA Clinical Targets (Quick Select):'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {clinicalPresets.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-200'
                          : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <span>{locale === 'km' ? preset.labelKm : preset.labelEn}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white ml-1 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Fields Grid (2-Columns on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Context & Boundaries */}
              <div className="space-y-4">
                {/* Measurement Context */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{t('measurementType')} *</span>
                  </label>
                  <select
                    value={measurementType}
                    onChange={(e) => {
                      setMeasurementType(e.target.value as MeasurementType);
                      setActivePreset(null);
                    }}
                    disabled={Boolean(target)}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition shadow-2xs"
                  >
                    <option value="fasting">
                      {locale === 'km' ? 'Fasting (ពេលព្រឹកព្រលឹម - អត់អាហារ)' : 'Fasting (8–10h without food)'}
                    </option>
                    <option value="before_meal">
                      {locale === 'km' ? 'Before Meal (មុនពេលអាហារ)' : 'Before Meal (Preprandial)'}
                    </option>
                    <option value="1h_after_meal">
                      {locale === 'km' ? '1h After Meal (១ ម៉ោងក្រោយអាហារ)' : '1 Hour After Meal'}
                    </option>
                    <option value="2h_after_meal">
                      {locale === 'km' ? '2h After Meal (២ ម៉ោងក្រោយអាហារ)' : '2 Hours After Meal (Postprandial)'}
                    </option>
                    <option value="bedtime">
                      {locale === 'km' ? 'Bedtime (មុនពេលចូលគេង)' : 'Bedtime'}
                    </option>
                    <option value="random">
                      {locale === 'km' ? 'Random / Casual Reading (វាស់ចៃដន្យ)' : 'Random / Casual Reading'}
                    </option>
                    <option value="other">
                      {locale === 'km' ? 'Other (ពេលផ្សេងទៀត)' : 'Other Context'}
                    </option>
                  </select>
                </div>

                {/* Threshold Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>{t('thresholdMode')} *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setThresholdMode('range');
                        setActivePreset(null);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition flex items-center justify-center text-center ${
                        thresholdMode === 'range'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {locale === 'km' ? 'ចន្លោះ (Min–Max)' : 'Range (Min–Max)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThresholdMode('upper_only');
                        setActivePreset(null);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition flex items-center justify-center text-center ${
                        thresholdMode === 'upper_only'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {locale === 'km' ? 'ពិដាន (≤ Max)' : 'Upper Only (≤ Max)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThresholdMode('lower_only');
                        setActivePreset(null);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition flex items-center justify-center text-center ${
                        thresholdMode === 'lower_only'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {locale === 'km' ? 'បាត (≥ Min)' : 'Lower Only (≥ Min)'}
                    </button>
                  </div>
                </div>

                {/* Min & Max Numeric Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  {(thresholdMode === 'range' || thresholdMode === 'lower_only') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('targetMin')} *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="40"
                          max="300"
                          step="1"
                          required
                          value={minValue}
                          onChange={(e) => {
                            setMinValue(e.target.value);
                            setActivePreset(null);
                          }}
                          placeholder="80"
                          className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition shadow-2xs pr-16"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          mg/dL
                        </span>
                      </div>
                    </div>
                  )}

                  {(thresholdMode === 'range' || thresholdMode === 'upper_only') && (
                    <div className={thresholdMode === 'upper_only' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('targetMax')} *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="50"
                          max="500"
                          step="1"
                          required
                          value={maxValue}
                          onChange={(e) => {
                            setMaxValue(e.target.value);
                            setActivePreset(null);
                          }}
                          placeholder="130"
                          className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition shadow-2xs pr-16"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          mg/dL
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dates, Notes & Reason */}
              <div className="space-y-4">
                {/* Effective Dates Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span>{t('effectiveFrom')} *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{t('effectiveUntil')} ({locale === 'km' ? 'ជម្រើស' : 'Optional'})</span>
                    </label>
                    <input
                      type="date"
                      value={effectiveUntil}
                      onChange={(e) => setEffectiveUntil(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>{t('clinicalNotes')} ({locale === 'km' ? 'ជម្រើស' : 'Optional'})</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      locale === 'km'
                        ? 'កំណត់ចំណាំរបស់គ្រូពេទ្យ ឬការណែនាំពិសេស...'
                        : "Physician's instructions or clinical rationale..."
                    }
                    className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition shadow-2xs"
                  />
                </div>

                {/* Reason for Change (when editing) */}
                {target && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('reasonForChange')}
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        locale === 'km'
                          ? 'ឧ. ការកែសម្រួលក្រោយការពិនិត្យតាមដាននៅមន្ទីរពេទ្យ'
                          : 'e.g. Adjusted post-meal threshold following clinic visit'
                      }
                      className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition shadow-2xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Medical Approval Warning Banner (Placed neatly at the bottom) */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block font-bold text-amber-950 mb-0.5">
                  {t('approvalNoticeTitle')}
                </strong>
                {role === 'clinician'
                  ? t('clinicianImmediateNotice')
                  : t('caregiverPendingNotice')}
              </div>
            </div>
          </div>

          {/* Action Buttons (Sticky at Bottom) */}
          <div className="flex items-center space-x-3 pt-5 border-t border-slate-100 flex-shrink-0 mt-6 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition touch-target"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl shadow-md transition flex items-center justify-center space-x-2 touch-target"
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? tCommon('loading') : t('saveTarget')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
