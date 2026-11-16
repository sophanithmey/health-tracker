'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { lifestyleService } from '@/services/lifestyle-service';
import { MealLog, MealType } from '@/types';
import { Utensils } from 'lucide-react';
import { CAMBODIAN_FOOD_GUIDE } from '@/data/cambodianFoodGuide';
import { MealLogCard } from './MealLogCard';

interface MealLogSectionProps {
  meals: MealLog[];
  onRefresh: () => void;
}

export function MealLogSection({ meals, onRefresh }: MealLogSectionProps) {
  const t = useTranslations('lifestyle');
  const tCommon = useTranslations('common');

  const [isAdding, setIsAdding] = useState(false);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodDescription, setFoodDescription] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [carbEstimate, setCarbEstimate] = useState<'low' | 'moderate' | 'high'>('low');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await lifestyleService.logMeal({
        mealType,
        loggedAt: new Date().toISOString(),
        foodDescription: foodDescription.trim(),
        portionSize: portionSize.trim() || undefined,
        carbEstimate
      });
      setFoodDescription('');
      setPortionSize('');
      setIsAdding(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to log meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectDishPreset = (dishName: string, carb: 'low' | 'moderate' | 'high') => {
    setFoodDescription(dishName);
    setCarbEstimate(carb);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-khmer">{t('mealLogTab')}</h3>
          <p className="text-xs text-slate-500">Track meal composition and portion pacing</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition touch-target"
        >
          {isAdding ? tCommon('close') : `+ ${t('logMeal')}`}
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`py-2 px-1 rounded-xl font-bold capitalize transition ${
                  mealType === type
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Food / Dish Description
            </label>
            <input
              type="text"
              required
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              placeholder="e.g. Samlor Korko with plenty of greens and small rice"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              Quick Suggestions from Cambodian Food Guide:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CAMBODIAN_FOOD_GUIDE.slice(0, 4).map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => selectDishPreset(f.nameKm, f.carbLevel)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 font-khmer"
                >
                  {f.nameKm}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Carb Impact</label>
              <select
                value={carbEstimate}
                onChange={(e) => setCarbEstimate(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-bold"
              >
                <option value="low">Low Carb (បន្លែ/ស៊ុប)</option>
                <option value="moderate">Moderate (បាយកន្លះចាន)</option>
                <option value="high">High Carb (បាយច្រើន/បង្អែម)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Portion</label>
              <input
                type="text"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                placeholder="e.g. 1 small bowl"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Meal'}
          </button>
        </form>
      ) : null}

      {/* Meals list */}
      <div className="space-y-3">
        {meals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No meals recorded for today yet.
          </div>
        ) : (
          meals.map((meal) => <MealLogCard key={meal.id} meal={meal} />)
        )}
      </div>
    </div>
  );
}
