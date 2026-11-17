'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { knowledgeService } from '@/services/knowledge-service';
import { FoodNutritionItem } from '@/types';
import { Search, Utensils } from 'lucide-react';
import { FoodNutritionCard } from './FoodNutritionCard';
import { KhmerDishesExplorer } from './KhmerDishesExplorer';

const QUICK_SEARCH_ITEMS = [
  { key: 'whiteRice', query: 'white rice' },
  { key: 'morningGlory', query: 'morning glory' },
  { key: 'cabbage', query: 'cabbage' },
  { key: 'cucumber', query: 'cucumber' },
  { key: 'freshFish', query: 'fresh fish' },
  { key: 'boiledEgg', query: 'boiled egg' },
  { key: 'chickenBreast', query: 'chicken breast' },
  { key: 'brownRice', query: 'brown rice' },
  { key: 'tofu', query: 'tofu' },
  { key: 'banana', query: 'banana' },
  { key: 'apple', query: 'apple' },
] as const;

export function NutritionExplorer() {
  const t = useTranslations('knowledge');
  const [explorerMode, setExplorerMode] = useState<'usda' | 'khmer'>('usda');
  const [searchQuery, setSearchQuery] = useState('white rice');
  const [activeQuery, setActiveQuery] = useState('white rice');
  const [displayMode, setDisplayMode] = useState<'per100g' | 'perServing'>('per100g');

  const {
    data: foods = [],
    isLoading,
    isError,
  } = useQuery<FoodNutritionItem[]>({
    queryKey: ['nutrition', activeQuery],
    queryFn: () => knowledgeService.searchFoods(activeQuery),
    enabled: Boolean(activeQuery.trim()) && explorerMode === 'usda',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Hero Header */}
      <div className='bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md'>
        <div className='relative z-10 max-w-2xl'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 mb-3'>
            <Utensils className='w-3.5 h-3.5 mr-1 text-emerald-300' />
            {t('foodNutritionExplorer')}
          </span>
          <h2 className='text-2xl sm:text-3xl font-black font-khmer tracking-tight'>
            {t('foodNutritionTitle')}
          </h2>
          <p className='text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-khmer'>
            {t('foodNutritionSubtitle')}
          </p>
        </div>
      </div>

      {/* ADA Plate Method Visual Summary */}
      <div className='bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 text-xs text-emerald-950'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center space-x-2.5'>
            <span className='text-xl'>🍽️</span>
            <div>
              <h4 className='font-bold text-emerald-900 font-khmer'>
                {t('adaPlateMethodTitle')}
              </h4>
              <p className='text-[11px] text-emerald-800 font-khmer mt-0.5'>
                {t('adaPlateMethodSubtitle')}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-1.5 shrink-0 text-[11px] font-bold'>
            <span className='px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300'>
              🟢 {t('plateVeg')}
            </span>
            <span className='px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-300'>
              🔵 {t('plateProtein')}
            </span>
            <span className='px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300'>
              🟡 {t('plateCarbs')}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: USDA Ingredients vs Khmer Traditional Dishes */}
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => setExplorerMode('usda')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 font-khmer ${
            explorerMode === 'usda'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🥦</span>
          <span>{t('usdaFoodsTab')}</span>
        </button>
        <button
          type='button'
          onClick={() => setExplorerMode('khmer')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 font-khmer ${
            explorerMode === 'khmer'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🍲</span>
          <span>{t('khmerDishesTab')}</span>
        </button>
      </div>

      {/* Mode View: Khmer Dishes or USDA Search */}
      {explorerMode === 'khmer' ? (
        <KhmerDishesExplorer />
      ) : (
        <div className='space-y-4'>
          {/* Search Input & Quick Chips */}
          <div className='bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4'>
            <form onSubmit={handleSearchSubmit} className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <Search className='w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('foodSearchPlaceholder')}
                  className='w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition'
                />
              </div>
              <button
                type='submit'
                className='px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow-sm transition touch-target flex-shrink-0 font-khmer'
              >
                {t('search')}
              </button>
            </form>

            <div className='flex flex-wrap gap-1.5 pt-1'>
              {QUICK_SEARCH_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type='button'
                  onClick={() => {
                    setSearchQuery(item.query);
                    setActiveQuery(item.query);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeQuery === item.query
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t(`quickFoods.${item.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Serving Toggle */}
          <div className='flex justify-end'>
            <div className='inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold'>
              <button
                onClick={() => setDisplayMode('per100g')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  displayMode === 'per100g'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                {t('per100g')}
              </button>
              <button
                onClick={() => setDisplayMode('perServing')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  displayMode === 'perServing'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                {t('perServing')}
              </button>
            </div>
          </div>

          {/* Food Cards Grid */}
          {isLoading ? (
            <div className='bg-white rounded-3xl p-12 text-center text-slate-400 font-khmer border border-slate-200'>
              <div className='w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2' />
              {t('fetchingFoodData')}
            </div>
          ) : isError || foods.length === 0 ? (
            <div className='bg-white rounded-3xl p-10 text-center text-slate-500 font-khmer border border-slate-200'>
              <Utensils className='w-8 h-8 text-slate-300 mx-auto mb-2' />
              {t('noFoodFound', { query: activeQuery })}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {foods.map((food) => (
                <FoodNutritionCard
                  key={food.fdcId}
                  food={food}
                  displayMode={displayMode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
