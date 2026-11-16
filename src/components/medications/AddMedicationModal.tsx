'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Pill, X, AlertTriangle } from 'lucide-react';
import { useAddMedicationForm, InitialMedicationData } from '@/hooks/use-add-medication-form';
import { MedicationPresetsSelector } from './MedicationPresetsSelector';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: InitialMedicationData | null;
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

  const {
    name,
    setName,
    dosage,
    setDosage,
    frequency,
    setFrequency,
    timingInstructions,
    setTimingInstructions,
    prescribingDoctor,
    setPrescribingDoctor,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    rxcui,
    genericName,
    brandName,
    activePreset,
    applyPreset,
    isSubmitting,
    errorMsg,
    handleSubmit
  } = useAddMedicationForm(initialData, onSuccess, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-200/90 my-auto overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-khmer">
                {t('addMedication') || 'Add Medication'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {rxcui ? `Linked to RxNorm: RxCUI ${rxcui}` : "Add to Mom's daily routine"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {/* Quick Presets if not pre-filled */}
          {!initialData ? (
            <MedicationPresetsSelector
              activePreset={activePreset}
              onSelectPreset={applyPreset}
            />
          ) : null}

          {/* Name & Dosage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Drug Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Dosage / Strength *</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Frequency & Instructions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frequency *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed (PRN)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
              <input
                type="text"
                value={timingInstructions}
                onChange={(e) => setTimingInstructions(e.target.value)}
                placeholder="e.g. Take with breakfast"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Doctor & Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prescribing Doctor</label>
              <input
                type="text"
                value={prescribingDoctor}
                onChange={(e) => setPrescribingDoctor(e.target.value)}
                placeholder="Dr. Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pharmacy, refill instructions, or special advice..."
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
            <span>Save Medication</span>
          </button>
        </form>
      </div>
    </div>
  );
}
