'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Moon, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { LifestyleJournal } from '@/types';

interface SymptomChecklistProps {
  journal?: LifestyleJournal;
  logDate: string;
  onRefresh: () => void;
}

export function SymptomChecklist({ journal, logDate, onRefresh }: SymptomChecklistProps) {
  const t = useTranslations('lifestyle');
  const tCommon = useTranslations('common');

  const [sleepHours, setSleepHours] = useState<number>(journal?.sleepHours ?? 7.5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(journal?.symptoms ?? []);
  const [notes, setNotes] = useState<string>(journal?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const symptomList = [
    { id: 'thirst', labelKm: 'ស្រេកទឹកខ្លាំងខុសធម្មតា', labelEn: 'Unusual thirst' },
    { id: 'dizziness', labelKm: 'វិលមុខ', labelEn: 'Dizziness' },
    { id: 'shakiness', labelKm: 'ញ័រដៃជើង', labelEn: 'Shakiness' },
    { id: 'sweating', labelKm: 'បែកញើសត្រជាក់', labelEn: 'Sweating' },
    { id: 'fatigue', labelKm: 'អស់កម្លាំងល្ហិតល្ហៃ', labelEn: 'Fatigue' },
    { id: 'blurred_vision', labelKm: 'ស្រវាំងភ្នែក', labelEn: 'Blurred vision' }
  ];

  const toggleSymptom = (labelEn: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(labelEn) ? prev.filter((s) => s !== labelEn) : [...prev, labelEn]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await axios.post('/api/lifestyle/journals', {
        logDate,
        waterGlasses: journal?.waterGlasses ?? 6,
        sleepHours: Number(sleepHours),
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save journal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{t('sleepTab')}</h3>
          <p className="text-xs text-slate-500">
            Sleep quality and daily symptom observations
          </p>
        </div>
      </div>

      {/* Sleep Duration */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">
          Sleep Duration: <span className="text-indigo-600 font-black text-sm">{sleepHours} {t('hoursUnit')}</span>
        </label>
        <div className="flex items-center space-x-2">
          {[5, 6, 7, 7.5, 8, 9].map((hrs) => (
            <button
              key={hrs}
              type="button"
              onClick={() => setSleepHours(hrs)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                sleepHours === hrs
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {hrs}h
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms Checklist */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">
          {t('symptomsNoticed')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {symptomList.map((item) => {
            const isChecked = selectedSymptoms.includes(item.labelEn);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSymptom(item.labelEn)}
                className={`p-3 rounded-2xl border text-left text-xs font-medium transition flex items-center justify-between ${
                  isChecked
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="block font-bold">{item.labelKm}</span>
                  <span className="text-[11px] text-slate-500">{item.labelEn}</span>
                </div>
                {isChecked && <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {tCommon('notes')}
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did Mom feel today? Any fatigue, appetite changes, or notes..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow transition touch-target"
        >
          {isSaving ? tCommon('loading') : t('logJournal')}
        </button>
        {savedSuccess && (
          <span className="text-xs text-emerald-700 font-bold flex items-center">
            <Check className="w-4 h-4 mr-1" />
            {tCommon('saved')}
          </span>
        )}
      </div>
    </div>
  );
}

