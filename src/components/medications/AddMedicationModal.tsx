'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';
import {
  Pill,
  X,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Clock,
  Calendar,
  FileText,
  Check,
  Plus
} from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    rxcui?: string;
    name?: string;
    dosage?: string;
    genericName?: string;
    brandName?: string;
    activeIngredients?: string[];
    dosageForm?: string;
  } | null;
}

export function AddMedicationModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: AddMedicationModalProps) {
  if (!isOpen) return null;

  return (
    <AddMedicationDialogContent
      key={initialData?.rxcui || initialData?.name || 'new-medication'}
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={initialData}
    />
  );
}

function AddMedicationDialogContent({
  onClose,
  onSuccess,
  initialData
}: Omit<AddMedicationModalProps, 'isOpen'>) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '500 mg');
  const [frequency, setFrequency] = useState('Once daily');
  const [timingInstructions, setTimingInstructions] = useState('Take with breakfast');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [rxcui, setRxcui] = useState<string | undefined>(initialData?.rxcui);
  const [genericName, setGenericName] = useState<string | undefined>(initialData?.genericName);
  const [brandName, setBrandName] = useState<string | undefined>(initialData?.brandName);
  const [activeIngredients, setActiveIngredients] = useState<string[]>(
    initialData?.activeIngredients || []
  );
  const [dosageForm, setDosageForm] = useState<string | undefined>(initialData?.dosageForm);
  const [activePreset, setActivePreset] = useState<string | null>(
    initialData ? null : 'Metformin HCl 500 mg'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickPresets = [
    {
      id: 'met-500',
      label: 'Metformin HCl 500 mg',
      name: 'Metformin HCl',
      dosage: '500 mg',
      frequency: 'Once daily',
      timing: locale === 'km' ? 'លេបជាមួយបាយព្រឹក' : 'Take with breakfast'
    },
    {
      id: 'met-850',
      label: 'Metformin HCl 850 mg',
      name: 'Metformin HCl',
      dosage: '850 mg',
      frequency: 'Twice daily',
      timing: locale === 'km' ? 'លេបជាមួយបាយព្រឹក និងល្ងាច' : 'Take with breakfast & dinner'
    },
    {
      id: 'glic-30',
      label: 'Gliclazide 30 mg (MR)',
      name: 'Gliclazide MR',
      dosage: '30 mg',
      frequency: 'Once daily',
      timing: locale === 'km' ? 'លេបជាមួយបាយព្រឹក' : 'Take with breakfast'
    },
    {
      id: 'sita-100',
      label: 'Sitagliptin 100 mg',
      name: 'Sitagliptin (Januvia)',
      dosage: '100 mg',
      frequency: 'Once daily',
      timing: locale === 'km' ? 'លេបពេលព្រឹក' : 'Take in the morning'
    }
  ];

  const timingShortcuts = locale === 'km'
    ? [
        'លេបជាមួយបាយព្រឹក',
        'លេបក្រោយបាយល្ងាច',
        'លេបមុនពេលបាយ',
        'លេបមុនចូលគេង'
      ]
    : [
        'Take with breakfast',
        'Take after dinner',
        'Before meals',
        'At bedtime'
      ];

  const applyPreset = (preset: (typeof quickPresets)[0]) => {
    setActivePreset(preset.label);
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
        isActive: true,
        rxcui: rxcui || undefined,
        genericName: genericName || undefined,
        brandName: brandName || undefined,
        activeIngredients: activeIngredients.length > 0 ? activeIngredients : undefined,
        dosageForm: dosageForm || undefined,
        referenceSource: rxcui ? 'RxNorm' : undefined
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header (Clean, Non-scrolling) */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Pill className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-khmer tracking-tight">
                {t('addMedication')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {locale === 'km'
                  ? 'បញ្ចូលព័ត៌មានថ្នាំតាមវេជ្ជបញ្ជារបស់វេជ្ជបណ្ឌិត'
                  : 'Enter prescribed medication according to physician instructions'}
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

        {/* Modal Form Body (Scrollable if viewport is small) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Quick Presets Banner */}
            <div className="p-4 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-teal-50/60 border border-teal-200/70 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900 mb-2.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span className="font-khmer">
                  {locale === 'km'
                    ? 'ជម្រើសរហ័ស (Common Prescriptions):'
                    : 'Common Diabetes Prescriptions (Quick Select):'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickPresets.map((preset) => {
                  const isSelected = activePreset === preset.label;
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
                      <span className="truncate">{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Responsive Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Core Medicine Info) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-khmer">
                    {locale === 'km' ? 'ព័ត៌មានអំពីថ្នាំ (Medication Details)' : 'Medication Details'}
                  </h4>
                </div>

                {/* Medicine Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 font-khmer">
                      {t('name')} <span className="text-red-500">*</span>
                    </label>
                    {rxcui && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        RxCUI: {rxcui}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setActivePreset(null);
                    }}
                    placeholder="e.g. Metformin HCl"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                  />
                </div>

                {/* Dosage & Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                      {t('dosage')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dosage}
                      onChange={(e) => {
                        setDosage(e.target.value);
                        setActivePreset(null);
                      }}
                      placeholder="e.g. 500 mg"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
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
                      onChange={(e) => {
                        setFrequency(e.target.value);
                        setActivePreset(null);
                      }}
                      placeholder="e.g. Once daily, Twice daily"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
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
                    placeholder="e.g. Take with breakfast and water"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {timingShortcuts.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTimingInstructions(opt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          timingInstructions === opt
                            ? 'bg-teal-100 text-teal-800 font-bold border border-teal-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Prescribing Doctor & Schedule) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-khmer">
                    {locale === 'km' ? 'វេជ្ជបញ្ជា និងកាលបរិច្ឆេទ (Prescription)' : 'Prescription & Schedule'}
                  </h4>
                </div>

                {/* Prescribing Doctor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                    {t('prescribingDoctor')}
                  </label>
                  <input
                    type="text"
                    value={prescribingDoctor}
                    onChange={(e) => setPrescribingDoctor(e.target.value)}
                    placeholder={locale === 'km' ? 'ឧ. វេជ្ជបណ្ឌិត កែវ' : 'e.g. Attending Physician'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                  />
                </div>

                {/* Dates: Start Date & Optional End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                      {locale === 'km' ? 'កាលបរិច្ឆេទចាប់ផ្តើម' : 'Start Date'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                      {locale === 'km' ? 'កាលបរិច្ឆេទបញ្ចប់ (ជម្រើស)' : 'End Date (Optional)'}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-khmer">
                    {locale === 'km' ? 'កំណត់ចំណាំបន្ថែម (ជម្រើស)' : `${tCommon('notes')} (Optional)`}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      locale === 'km'
                        ? 'ឧ. លេបសម្រាប់គ្រប់គ្រងជាតិស្ករពេលព្រឹក'
                        : 'e.g. Prescribed for fasting glucose control'
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                  />
                </div>

                {/* Safety Advisory Banner */}
                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-[11px] text-amber-950 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    {locale === 'km'
                      ? 'សូមបញ្ជាក់៖ ត្រូវប្រាកដថាឈ្មោះ និងកម្រិតថ្នាំស្របតាមវេជ្ជបញ្ជារបស់គ្រូពេទ្យ។ កម្មវិធីមិនអនុញ្ញាតឱ្យផ្លាស់ប្តូរកម្រិតថ្នាំដោយគ្មានការពិគ្រោះយោបល់ឡើយ។'
                      : 'Safety check: Always verify the medication dosage with Mom\'s attending doctor. Never change prescribed doses without medical advice.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky / Dedicated Action Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline font-khmer">
              {locale === 'km' ? '✓ ទិន្នន័យរក្សាទុកក្នុងប្រព័ន្ធសុវត្ថិភាព' : '✓ Stored securely on the server'}
            </span>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition touch-target"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-7 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-teal-700/20 transition touch-target flex items-center justify-center space-x-2 disabled:opacity-50 font-khmer"
              >
                {isSubmitting ? (
                  <span>{tCommon('loading')}</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t('addMedication')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
