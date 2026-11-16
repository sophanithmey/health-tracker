import React from 'react';
import { useLocale } from 'next-intl';
import { Target, Check } from 'lucide-react';
import { CLINICAL_PRESETS, ClinicalPreset } from '@/constants/clinical-presets.constants';

interface TargetPresetsSelectorProps {
  activePreset: string | null;
  onSelectPreset: (preset: ClinicalPreset) => void;
}

export function TargetPresetsSelector({
  activePreset,
  onSelectPreset
}: TargetPresetsSelectorProps) {
  const locale = useLocale();

  return (
    <div>
      <div className="flex items-center space-x-1.5 mb-2.5">
        <Target className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-xs font-bold text-slate-700">
          {locale === 'km' ? 'គំរូគោលដៅស្តង់ដារ (ADA Clinical Presets)' : 'ADA Clinical Presets'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CLINICAL_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;
          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                isSelected
                  ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <p className="text-xs font-bold">
                  {locale === 'km' ? preset.labelKm : preset.labelEn}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {preset.min ? `Min: ${preset.min}` : ''} {preset.max ? `Max: ${preset.max}` : ''} mg/dL
                </p>
              </div>
              {isSelected ? <Check className="w-4 h-4 text-teal-700 flex-shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
