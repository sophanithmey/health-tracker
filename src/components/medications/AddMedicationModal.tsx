'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';
import { Pill, X, Sparkles, ShieldCheck, Stethoscope, Clock, Calendar } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMedicationModal({ isOpen, onClose, onSuccess }: AddMedicationModalProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('500 mg');
  const [frequency, setFrequency] = useState('Once daily');
  const [timingInstructions, setTimingInstructions] = useState('Take with breakfast');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    {
      name: 'Metformin HCl',
      dosage: '500 mg',
      frequency: 'Once daily',
      timing: 'Take with breakfast'
    },
    {
      name: 'Metformin HCl',
      dosage: '850 mg',
      frequency: 'Twice daily',
      timing: 'Take with breakfast & dinner'
    },
    {
      name: 'Gliclazide',
      dosage: '30 mg (MR)',
      frequency: 'Once daily',
      timing: 'Take with breakfast'
    },
    {
      name: 'Sitagliptin (Januvia)',
      dosage: '100 mg',
      frequency: 'Once daily',
      timing: 'Take in the morning'
    }
  ];

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setName(preset.name);
    setDosage(preset.dosage);
    setFrequency(preset.frequency);
    setTimingInstructions(preset.timing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(locale === 'km' ? 'សូមបញ្ចូលឈ្មោះថ្នាំ' : 'Please enter medication name');
      return;
    }
    if (!dosage.trim()) {
      setErrorMsg(locale === 'km' ? 'សូមបញ្ចូលកម្រិតថ្នាំ' : 'Please enter dosage');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await axios.post('/api/medications', {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timingInstructions: timingInstructions.trim() || undefined,
        prescribingDoctor: prescribingDoctor.trim() || undefined,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error ||
          (locale === 'km' ? 'មានបញ្ហាក្នុងការរក្សាទុកថ្នាំ' : 'Failed to save medication')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 text-teal-800 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-khmer">
              {t('addMedication')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {locale === 'km'
                ? 'បញ្ចូលព័ត៌មានថ្នាំតាមវេជ្ជបញ្ជារបស់វេជ្ជបណ្ឌិត'
                : 'Enter prescribed medication according to physician instructions'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Quick Presets for Common Oral Diabetes Meds */}
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {locale === 'km' ? 'ជម្រើសរហ័ស (Common Prescriptions):' : 'Common Diabetes Medications:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                {preset.name} {preset.dosage}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
              {t('name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin HCl"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Dosage & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                {t('dosage')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                {t('frequency')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Once daily, Twice daily"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Timing Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
              {t('timing')}
            </label>
            <input
              type="text"
              value={timingInstructions}
              onChange={(e) => setTimingInstructions(e.target.value)}
              placeholder="e.g. Take with breakfast and a glass of water"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                'Take with breakfast',
                'Take after dinner',
                'Before meals',
                'At bedtime'
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTimingInstructions(opt)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[11px] font-medium transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Prescribing Doctor & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                {t('prescribingDoctor')}
              </label>
              <input
                type="text"
                value={prescribingDoctor}
                onChange={(e) => setPrescribingDoctor(e.target.value)}
                placeholder="e.g. Attending Physician"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
              {tCommon('notes')} (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prescribed for fasting glucose management"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Clinical Safety Box */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              {locale === 'km'
                ? 'សូមបញ្ជាក់៖ ត្រូវប្រាកដថាឈ្មោះ និងកម្រិតថ្នាំស្របតាមវេជ្ជបញ្ជារបស់គ្រូពេទ្យ។ កម្មវិធីមិនអនុញ្ញាតឱ្យផ្លាស់ប្តូរកម្រិតថ្នាំដោយគ្មានការពិគ្រោះយោបល់ឡើយ។'
                : 'Safety check: Always verify the medication dosage with Mom\'s attending doctor. Never change prescribed doses without medical advice.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm transition touch-target"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow-md transition touch-target flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{tCommon('loading')}</span>
              ) : (
                <span>+ {t('addMedication')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

