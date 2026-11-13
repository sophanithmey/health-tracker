'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { MealLog, MealType } from '@/types';
import { Utensils, Plus, Clock, Check } from 'lucide-react';
import { CAMBODIAN_FOOD_GUIDE } from '@/data/cambodianFoodGuide';

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
      await axios.post('/api/lifestyle/meals', {
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
      alert(err.response?.data?.error || 'Failed to log meal');
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
          <h3 className="text-lg font-bold text-slate-900">{t('mealLogTab')}</h3>
          <p className="text-xs text-slate-500">Track meal composition and portion pacing</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition touch-target"
        >
          {isAdding ? tCommon('close') : `+ ${t('logMeal')}`}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4"
        >
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
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
            />

            {/* Quick Cambodian Dish Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              {CAMBODIAN_FOOD_GUIDE.slice(0, 4).map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => selectDishPreset(dish.nameKm, dish.carbLevel)}
                  className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold rounded-lg hover:bg-teal-100"
                >
                  {dish.nameKm.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Portion</label>
              <input
                type="text"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                placeholder="e.g. 1 bowl, 1/2 cup rice"
                className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Carb Level</label>
              <select
                value={carbEstimate}
                onChange={(e) => setCarbEstimate(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 font-semibold"
              >
                <option value="low">Low Carb (High Veg/Protein)</option>
                <option value="moderate">Moderate Carb</option>
                <option value="high">High Carb (Rice / Noodles)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow"
          >
            {isSubmitting ? tCommon('loading') : tCommon('save')}
          </button>
        </form>
      )}

      {/* Meals History */}
      <div className="divide-y divide-slate-100">
        {meals.map((meal) => {
          const d = new Date(meal.loggedAt);
          const timeFormatted = d.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Phnom_Penh',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={meal.id} className="py-3 flex items-start justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 capitalize">
                    {meal.mealType}:
                  </span>{' '}
                  <span className="text-slate-700">{meal.foodDescription}</span>
                  {meal.portionSize && (
                    <span className="text-slate-500 block text-[11px]">
                      Portion: {meal.portionSize}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Logged by {meal.recordedByName || 'Mom'} at {timeFormatted}
                  </span>
                </div>
              </div>

              {meal.carbEstimate && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex-shrink-0 ${
                    meal.carbEstimate === 'low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : meal.carbEstimate === 'moderate'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {meal.carbEstimate} carb
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

