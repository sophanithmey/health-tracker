'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FoodNutritionItem } from '@/types';
import { getDiabeticFoodAdvice } from '@/lib/diabetic-food-advisor';
import { DiabeticAdviceCallout } from './DiabeticAdviceCallout';
import { QuickMealLogModal } from '@/components/lifestyle/QuickMealLogModal';
import {
  Flame,
  Wheat,
  Candy,
  Scale,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface FoodNutritionCardProps {
  food: FoodNutritionItem;
  displayMode: 'per100g' | 'perServing';
}

export function FoodNutritionCard({
  food,
  displayMode,
}: FoodNutritionCardProps) {
  const t = useTranslations('knowledge');
  const locale = useLocale();
  const isKhmer = locale === 'km';
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const nutrients =
    displayMode === 'perServing' && food.perServing
      ? food.perServing
      : food.per100g;

  const advice = getDiabeticFoodAdvice(food);

  const VerdictIcon =
    advice.verdict === 'eat_freely'
      ? ShieldCheck
      : advice.verdict === 'portion_control'
      ? Scale
      : AlertTriangle;

  return (
    <>
      <div className='bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between space-y-4'>
        <div className='space-y-3.5'>
          {/* Header & External USDA link */}
          <div className='flex items-start justify-between gap-2'>
            <div>
              <div className='flex flex-wrap items-center gap-2 mb-1.5'>
                {food.descriptionKm ? (
                  <span className='text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 font-khmer'>
                    {food.descriptionKm}
                  </span>
                ) : null}

                {/* Diabetic Verdict Pill */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${advice.verdictBadgeClass} font-khmer`}
                >
                  <VerdictIcon className='w-3.5 h-3.5 mr-1' />
                  {isKhmer ? advice.verdictTitleKm : advice.verdictTitleEn}
                </span>
              </div>

              <h4 className='text-base font-black text-slate-900 leading-snug'>
                {food.description}
              </h4>

              {food.brandOwner ? (
                <p className='text-xs text-slate-400 font-medium mt-0.5'>
                  {t('brandLabel', { brand: food.brandOwner })}
                </p>
              ) : null}
            </div>

            <a
              href={food.sourceUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-slate-400 hover:text-teal-700 p-1.5 rounded-lg hover:bg-slate-50 transition shrink-0'
              title={t('viewOnUsda')}
            >
              <ExternalLink className='w-4 h-4' />
            </a>
          </div>

          {/* Clinical Diabetic Portion Callout */}
          <DiabeticAdviceCallout advice={advice} isKhmer={isKhmer} />

          {/* Standard Serving Reference */}
          <div className='text-[11px] text-slate-500 font-medium flex items-center space-x-1'>
            <Scale className='w-3.5 h-3.5 text-slate-400' />
            <span>
              {displayMode === 'perServing' && food.servingSize
                ? `${t('serving')}: ${food.servingSize}${
                    food.servingSizeUnit || 'g'
                  } ${
                    food.householdServingText
                      ? `(${food.householdServingText})`
                      : ''
                  }`
                : t('standardRef100g')}
            </span>
          </div>

          {/* Macro Nutrients Grid */}
          <div className='grid grid-cols-3 gap-2 text-xs'>
            {[
              {
                label: t('calories'),
                icon: Flame,
                val:
                  nutrients.caloriesKcal !== undefined
                    ? `${nutrients.caloriesKcal} kcal`
                    : 'N/A',
                bg: 'bg-orange-50/70 border-orange-200/80 text-orange-800',
              },
              {
                label: t('carbs'),
                icon: Wheat,
                val:
                  nutrients.carbohydratesG !== undefined
                    ? `${nutrients.carbohydratesG}g`
                    : 'N/A',
                bg: 'bg-amber-50/70 border-amber-200/80 text-amber-800',
              },
              {
                label: t('sugars'),
                icon: Candy,
                val:
                  nutrients.totalSugarsG !== undefined
                    ? `${nutrients.totalSugarsG}g`
                    : '0g',
                bg: 'bg-purple-50/70 border-purple-200/80 text-purple-800',
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className={`p-2.5 rounded-xl border ${m.bg.split(' ')[0]} ${
                    m.bg.split(' ')[1]
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase flex items-center space-x-1 ${
                      m.bg.split(' ')[2]
                    }`}
                  >
                    <Icon className='w-3 h-3' />
                    <span>{m.label}</span>
                  </div>
                  <div className='text-sm font-black text-slate-900 mt-0.5'>
                    {m.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Nutrients Row & Log to Meal Action */}
          <div className='pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium'>
            <div className='flex items-center space-x-2.5'>
              <span>
                {t('fiber')}:{' '}
                <strong className='text-slate-800'>
                  {nutrients.dietaryFiberG ?? 0}g
                </strong>
              </span>
              <span>
                {t('protein')}:{' '}
                <strong className='text-slate-800'>
                  {nutrients.proteinG ?? 0}g
                </strong>
              </span>
              <span>
                {t('fat')}:{' '}
                <strong className='text-slate-800'>
                  {nutrients.totalFatG ?? 0}g
                </strong>
              </span>
            </div>

            <button
              type='button'
              onClick={() => setIsLogModalOpen(true)}
              className='inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold transition font-khmer text-xs touch-target'
            >
              <Plus className='w-3.5 h-3.5 text-teal-700' />
              <span>{t('logToMeal')}</span>
            </button>
          </div>
        </div>
      </div>

      <QuickMealLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        foodName={food.description}
        foodNameKm={food.descriptionKm}
        initialPortion={
          isKhmer ? advice.portionGuideKm : advice.portionGuideEn
        }
        initialCarbLevel={
          advice.verdict === 'eat_freely'
            ? 'low'
            : advice.verdict === 'portion_control'
            ? 'moderate'
            : 'high'
        }
      />
    </>
  );
}
