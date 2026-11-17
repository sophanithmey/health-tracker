'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ModalWrapper } from '@/components/molecules/modal-wrapper';
import { lifestyleService } from '@/services/lifestyle-service';
import { MealType } from '@/types';
import { Utensils, CheckCircle2 } from 'lucide-react';

interface QuickMealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string;
  foodNameKm?: string;
  initialPortion?: string;
  initialCarbLevel?: 'low' | 'moderate' | 'high';
  onSuccess?: () => void;
}

const getDefaultMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  return 'snack';
};

export function QuickMealLogModal({
  isOpen,
  onClose,
  foodName,
  foodNameKm,
  initialPortion = '',
  initialCarbLevel = 'moderate',
  onSuccess,
}: QuickMealLogModalProps) {
  const t = useTranslations('lifestyle');
  const tCommon = useTranslations('common');

  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [portion, setPortion] = useState(initialPortion);
  const [carbEstimate, setCarbEstimate] = useState<'low' | 'moderate' | 'high'>(
    initialCarbLevel,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMealType(getDefaultMealType());
      setPortion(initialPortion);
      setCarbEstimate(initialCarbLevel);
      setIsSuccess(false);
    }
  }, [isOpen, initialPortion, initialCarbLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName) return;

    setIsSubmitting(true);
    try {
      const displayName = foodNameKm
        ? `${foodNameKm} (${foodName})`
        : foodName;

      await lifestyleService.logMeal({
        mealType,
        loggedAt: new Date().toISOString(),
        foodDescription: displayName,
        portionSize: portion.trim() || undefined,
        carbEstimate,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to log meal';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealTypes: { type: MealType; emoji: string; key: 'breakfast' | 'lunch' | 'dinner' | 'snack' }[] = [
    { type: 'breakfast', emoji: '🌅', key: 'breakfast' },
    { type: 'lunch', emoji: '☀️', key: 'lunch' },
    { type: 'dinner', emoji: '🌙', key: 'dinner' },
    { type: 'snack', emoji: '🍎', key: 'snack' },
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('quickLogMealTitle')}
      subtitle={t('quickLogMealSubtitle')}
      icon={<Utensils className='w-5 h-5 text-teal-700' />}
      maxWidth='md'
    >
      {isSuccess ? (
        <div className='p-8 text-center space-y-3 animate-fade-in'>
          <CheckCircle2 className='w-14 h-14 text-emerald-600 mx-auto animate-bounce' />
          <h4 className='text-lg font-bold text-slate-900 font-khmer'>
            {t('mealSavedSuccess', { mealType: t(mealType) })}
          </h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Selected Food Badge */}
          <div className='p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-2xl'>
            <div className='text-xs font-semibold text-teal-800 uppercase tracking-wider font-khmer'>
              {t('foodNameLabel')}
            </div>
            <div className='text-base font-bold text-slate-900 mt-0.5'>
              {foodNameKm ? (
                <span className='font-khmer mr-1.5'>{foodNameKm}</span>
              ) : null}
              <span className='text-slate-700 text-sm font-medium'>
                {foodName}
              </span>
            </div>
          </div>

          {/* Meal Timing Type Selector */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5 font-khmer'>
              {t('mealTypeLabel')}
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {mealTypes.map(({ type, emoji, key }) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setMealType(type)}
                  className={`py-2 px-1 text-xs rounded-xl font-bold flex flex-col items-center justify-center transition border font-khmer ${
                    mealType === type
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className='text-sm mb-0.5'>{emoji}</span>
                  <span>{t(key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Portion Size Input */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1 font-khmer'>
              {t('portionLabel')}
            </label>
            <input
              type='text'
              value={portion}
              onChange={(e) => setPortion(e.target.value)}
              placeholder='e.g. 1/2 cup, 1 bowl with veggies'
              className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-khmer'
            />
          </div>

          {/* Carb Impact */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5 font-khmer'>
              {t('carbEstimateLabel')}
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {[
                { level: 'low', key: 'lowCarb', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                { level: 'moderate', key: 'moderateCarb', bg: 'bg-teal-50 text-teal-800 border-teal-300' },
                { level: 'high', key: 'highCarb', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
              ].map((c) => (
                <button
                  key={c.level}
                  type='button'
                  onClick={() => setCarbEstimate(c.level as 'low' | 'moderate' | 'high')}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition font-khmer ${
                    carbEstimate === c.level
                      ? 'ring-2 ring-teal-600 font-black shadow-2xs ' + c.bg
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t(c.key as 'lowCarb' | 'moderateCarb' | 'highCarb')}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end space-x-2 pt-2 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 font-khmer'
            >
              {tCommon('cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-50 font-khmer'
            >
              {isSubmitting ? tCommon('loading') : t('saveMealButton')}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
