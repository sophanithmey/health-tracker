import React from 'react';
import { BookmarkCheck, Check } from 'lucide-react';
import { MEDICATION_PRESETS, MedicationPreset } from '@/constants/medication-presets.constants';

interface MedicationPresetsSelectorProps {
  activePreset: string | null;
  onSelectPreset: (preset: MedicationPreset) => void;
}

export function MedicationPresetsSelector({
  activePreset,
  onSelectPreset
}: MedicationPresetsSelectorProps) {
  return (
    <div>
      <div className="flex items-center space-x-1.5 mb-2">
        <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-xs font-bold text-slate-700">Quick Diabetes Presets</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MEDICATION_PRESETS.map((p) => {
          const isSelected = activePreset === p.label;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                isSelected
                  ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <p className="text-xs font-bold truncate">{p.label}</p>
                <p className="text-[10px] text-slate-500">{p.frequency}</p>
              </div>
              {isSelected ? <Check className="w-4 h-4 text-teal-700 flex-shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
