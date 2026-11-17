'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CambodianDish } from '@/data/cambodianFoodGuide';
import { Plus } from 'lucide-react';

interface KhmerDishCardProps {
  dish: CambodianDish;
  isKhmer: boolean;
  onLogMeal: (dish: CambodianDish) => void;
}

export function KhmerDishCard({ dish, isKhmer, onLogMeal }: KhmerDishCardProps) {
  const t = useTranslations('knowledge');
  const carbBadge =
    dish.carbLevel === 'low'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : dish.carbLevel === 'moderate'
      ? 'bg-teal-100 text-teal-800 border-teal-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className='bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition space-y-3.5'>
      <div className='space-y-2.5'>
        {/* Title & Carb Badge */}
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h4 className='text-base font-black text-slate-900 font-khmer'>
              {dish.nameKm}
            </h4>
            <span className='text-xs font-semibold text-slate-500'>
              {dish.nameEn}
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 font-khmer ${carbBadge}`}
          >
            {t('carbLevelLabel')}: {dish.carbLevel.toUpperCase()}
          </span>
        </div>

        <p className='text-xs text-slate-600 leading-relaxed font-khmer'>
          {isKhmer ? dish.descriptionKm : dish.descriptionEn}
        </p>

        {/* Key Components */}
        <div className='bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs font-khmer'>
          {dish.keyComponents.vegetables.length > 0 ? (
            <div>
              <span className='font-bold text-emerald-800'>
                {isKhmer ? 'បន្លែ (Veggies):' : 'Vegetables:'}{' '}
              </span>
              <span className='text-slate-600'>
                {dish.keyComponents.vegetables.join(', ')}
              </span>
            </div>
          ) : null}

          {dish.keyComponents.protein.length > 0 ? (
            <div>
              <span className='font-bold text-teal-800'>
                {isKhmer ? 'សាច់/ប្រូតេអ៊ីន (Protein):' : 'Protein:'}{' '}
              </span>
              <span className='text-slate-600'>
                {dish.keyComponents.protein.join(', ')}
              </span>
            </div>
          ) : null}

          {dish.keyComponents.carbohydrates.length > 0 ? (
            <div>
              <span className='font-bold text-amber-800'>
                {isKhmer ? 'ជាតិម្សៅ (Carbs):' : 'Carbs:'}{' '}
              </span>
              <span className='text-slate-600'>
                {dish.keyComponents.carbohydrates.join(', ')}
              </span>
            </div>
          ) : null}
        </div>

        {/* Portion Guidance */}
        <div className='text-xs bg-teal-50/70 p-3 rounded-2xl text-teal-950 border border-teal-100/80'>
          <strong className='block font-khmer text-teal-900'>
            {t('howMuchToEat')}
          </strong>
          <span className='font-khmer leading-relaxed text-slate-700'>
            {isKhmer ? dish.portionGuidanceKm : dish.portionGuidanceEn}
          </span>
        </div>
      </div>

      {/* Educational Tip & Log Meal Action */}
      <div className='pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2'>
        <div className='text-[11px] text-slate-500 font-khmer italic flex-1 min-w-[200px]'>
          💡 {isKhmer ? dish.educationalTipKm : dish.educationalTipEn}
        </div>

        <button
          type='button'
          onClick={() => onLogMeal(dish)}
          className='inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold transition font-khmer text-xs touch-target'
        >
          <Plus className='w-3.5 h-3.5 text-teal-700' />
          <span>{t('logToMeal')}</span>
        </button>
      </div>
    </div>
  );
}
