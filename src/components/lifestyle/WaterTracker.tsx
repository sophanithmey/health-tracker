'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Droplet, Plus, Minus, Check } from 'lucide-react';

interface WaterTrackerProps {
  currentGlasses: number;
  logDate: string;
  onUpdate: () => void;
}

export function WaterTracker({ currentGlasses, logDate, onUpdate }: WaterTrackerProps) {
  const t = useTranslations('lifestyle');
  const [glasses, setGlasses] = useState(currentGlasses || 6);
  const [isSaving, setIsSaving] = useState(false);

  const updateWater = async (newVal: number) => {
    const val = Math.max(0, newVal);
    setGlasses(val);
    setIsSaving(true);
    try {
      await axios.post('/api/lifestyle/journals', {
        logDate,
        waterGlasses: val,
        sleepHours: 7.5,
        symptoms: []
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to update water:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('waterTab')}</h3>
            <p className="text-xs text-slate-500">Hydration helps support steady glucose clearance</p>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
          Goal: 8 {t('glassesUnit')} (approx. 2L)
        </span>
      </div>

      <div className="flex items-center justify-center space-x-6 py-4">
        <button
          onClick={() => updateWater(glasses - 1)}
          disabled={glasses <= 0 || isSaving}
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl transition touch-target"
          aria-label="Decrease water"
        >
          <Minus className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-5xl font-black text-blue-600">{glasses}</span>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            {t('glassesUnit')} of plain water
          </div>
        </div>

        <button
          onClick={() => updateWater(glasses + 1)}
          disabled={isSaving}
          className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-md transition touch-target"
          aria-label="Increase water"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Visual Glass Dots */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-8 rounded-md border transition ${
              i < glasses
                ? 'bg-blue-500 border-blue-600'
                : 'bg-slate-100 border-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

