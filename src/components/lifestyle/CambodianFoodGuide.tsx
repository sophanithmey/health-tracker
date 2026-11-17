'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CAMBODIAN_FOOD_GUIDE, CambodianDish } from '@/data/cambodianFoodGuide';
import { QuickMealLogModal } from './QuickMealLogModal';
import { Apple, Plus } from 'lucide-react';

export function CambodianFoodGuide() {
  const t = useTranslations('lifestyle');
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDishToLog, setSelectedDishToLog] =
    useState<CambodianDish | null>(null);

  const filteredDishes =
    selectedCategory === 'all'
      ? CAMBODIAN_FOOD_GUIDE
      : CAMBODIAN_FOOD_GUIDE.filter((d) => d.category === selectedCategory);

  return (
    <div className='space-y-6'>
      {/* Educational Header Banner */}
      <div className='bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-950'>
        <div className='flex items-start space-x-3'>
          <Apple className='w-7 h-7 text-emerald-700 flex-shrink-0 mt-0.5' />
          <div>
            <h3 className='text-lg font-bold text-emerald-900 mb-1 font-khmer'>
              មគ្គុទ្ទេសក៍អាហារូបត្ថម្ភខ្មែរសម្រាប់សុខភាព (Cambodian Food Guide)
            </h3>
            <p className='text-sm leading-relaxed text-emerald-800 font-khmer'>
              {locale === 'km'
                ? 'របបអាហារសុខភាពផ្ដោតលើការញ៉ាំបន្លែបៃតងគ្មានជាតិម្សៅឱ្យបានច្រើន ប្រូតេអ៊ីនគ្រប់គ្រាន់ និងការកម្រិតបរិមាណបាយ ឬជាតិម្សៅឱ្យសមល្មម គ្មានអាហារណាដែល «ត្រូវហាមដាច់ខាត» ឬ «ញ៉ាំមិនកំណត់» នោះទេ — គន្លឹះសំខាន់គឺការយល់ដឹងពីចំណែកអាហារ'
                : 'Balanced nutrition focuses on generous non-starchy leafy greens, lean protein, and mindful carbohydrate portion control. No single food is universally forbidden or unlimited — the key is portion awareness and sequence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className='flex items-center space-x-2 overflow-x-auto pb-2'>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 font-khmer ${
            selectedCategory === 'all'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {locale === 'km' ? 'ទាំងអស់' : 'All Dishes'} ({CAMBODIAN_FOOD_GUIDE.length})
        </button>
        {['soup', 'main', 'noodle', 'staple', 'fruit'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize flex-shrink-0 font-khmer ${
              selectedCategory === cat
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dishes Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {filteredDishes.map((dish) => {
          const carbBadge =
            dish.carbLevel === 'low'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : dish.carbLevel === 'moderate'
              ? 'bg-teal-100 text-teal-800 border-teal-300'
              : 'bg-amber-100 text-amber-800 border-amber-300';

          return (
            <div
              key={dish.id}
              className='bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition space-y-3'
            >
              <div>
                <div className='flex items-start justify-between gap-2 mb-2'>
                  <div>
                    <h4 className='text-base sm:text-lg font-black text-slate-900 font-khmer'>
                      {dish.nameKm}
                    </h4>
                    <span className='text-xs font-medium text-slate-500'>
                      {dish.nameEn}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 font-khmer ${carbBadge}`}
                  >
                    Carb: {dish.carbLevel.toUpperCase()}
                  </span>
                </div>

                <p className='text-xs text-slate-600 mb-3 leading-relaxed font-khmer'>
                  {locale === 'km' ? dish.descriptionKm : dish.descriptionEn}
                </p>

                {/* Key Components */}
                <div className='bg-slate-50 rounded-2xl p-3 mb-3 border border-slate-100 space-y-1.5 text-xs font-khmer'>
                  {dish.keyComponents.vegetables.length > 0 ? (
                    <div>
                      <span className='font-bold text-emerald-800'>
                        {locale === 'km' ? 'បន្លែ (Veggies):' : 'Vegetables:'}{' '}
                      </span>
                      <span className='text-slate-600'>
                        {dish.keyComponents.vegetables.join(', ')}
                      </span>
                    </div>
                  ) : null}
                  {dish.keyComponents.protein.length > 0 ? (
                    <div>
                      <span className='font-bold text-teal-800'>
                        {locale === 'km' ? 'សាច់/ប្រូតេអ៊ីន (Protein):' : 'Protein:'}{' '}
                      </span>
                      <span className='text-slate-600'>
                        {dish.keyComponents.protein.join(', ')}
                      </span>
                    </div>
                  ) : null}
                  {dish.keyComponents.carbohydrates.length > 0 ? (
                    <div>
                      <span className='font-bold text-amber-800'>
                        {locale === 'km' ? 'ជាតិម្សៅ (Carbs):' : 'Carbs:'}{' '}
                      </span>
                      <span className='text-slate-600'>
                        {dish.keyComponents.carbohydrates.join(', ')}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Portion Guidance */}
                <div className='text-xs bg-teal-50/70 p-2.5 rounded-xl text-teal-950 border border-teal-100 mb-2 font-khmer'>
                  <strong>
                    {locale === 'km' ? 'ចំណែកអាហារ (Portion):' : 'Portion Guide:'}{' '}
                  </strong>
                  {locale === 'km' ? dish.portionGuidanceKm : dish.portionGuidanceEn}
                </div>
              </div>

              {/* Educational Tip & Log to Meal Button */}
              <div className='pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2'>
                <div className='italic font-khmer flex-1 min-w-[200px]'>
                  💡 {locale === 'km' ? dish.educationalTipKm : dish.educationalTipEn}
                </div>
                <button
                  type='button'
                  onClick={() => setSelectedDishToLog(dish)}
                  className='inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold transition font-khmer text-xs touch-target shrink-0'
                >
                  <Plus className='w-3.5 h-3.5 text-teal-700' />
                  <span>{t('logToMeal')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDishToLog ? (
        <QuickMealLogModal
          isOpen={Boolean(selectedDishToLog)}
          onClose={() => setSelectedDishToLog(null)}
          foodName={selectedDishToLog.nameEn}
          foodNameKm={selectedDishToLog.nameKm}
          initialPortion={
            locale === 'km'
              ? selectedDishToLog.portionGuidanceKm
              : selectedDishToLog.portionGuidanceEn
          }
          initialCarbLevel={selectedDishToLog.carbLevel}
        />
      ) : null}
    </div>
  );
}
