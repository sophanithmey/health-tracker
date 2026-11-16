'use client';

import { useTranslations } from 'next-intl';
import { Droplets, Plus, Minus } from 'lucide-react';

interface WellnessHydrationPillarProps {
  waterGlasses: number;
  waterGoal: number;
  isUpdatingWater: boolean;
  onAddWater: () => void;
  onRemoveWater: () => void;
  isKhmer?: boolean;
}

export function WellnessHydrationPillar({
  waterGlasses,
  waterGoal,
  isUpdatingWater,
  onAddWater,
  onRemoveWater
}: WellnessHydrationPillarProps) {
  const t = useTranslations('dashboard');
  const percent = Math.min(100, Math.round((waterGlasses / waterGoal) * 100));

  return (
    <div className="bg-linear-to-b from-blue-50/60 via-white to-blue-50/30 border border-blue-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-blue-800 flex items-center">
            <Droplets className="w-4 h-4 mr-1.5 text-blue-600" />
            {t('hydrationIntake')}
          </span>
          <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
            {percent}% {t('done')}
          </span>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-black text-slate-900">{waterGlasses}</span>
          <span className="text-xs font-bold text-slate-500">/ {waterGoal} {t('glassesUnit')}</span>
        </div>

        {/* Visual Droplet Blocks */}
        <div className="flex items-center space-x-1 my-3">
          {Array.from({ length: waterGoal }).map((_, idx) => (
            <div
              key={idx}
              className={`h-4 flex-1 rounded-sm transition-all duration-300 ${
                idx < waterGlasses ? 'bg-blue-600' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          💧 {t('hydrationTip')}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onRemoveWater}
          disabled={waterGlasses <= 0 || isUpdatingWater}
          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center touch-target"
          aria-label="Decrease water"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onAddWater}
          disabled={isUpdatingWater}
          className="flex-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addOneGlass')}</span>
        </button>
      </div>
    </div>
  );
}
