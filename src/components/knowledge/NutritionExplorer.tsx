'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { knowledgeService } from '@/services/knowledge-service';
import { FoodNutritionItem } from '@/types';
import { Search, Utensils } from 'lucide-react';
import { FoodNutritionCard } from './FoodNutritionCard';

const quickSearchItems = [
  { en: 'white rice', km: 'បាយស' },
  { en: 'brown rice', km: 'បាយសម្រូប' },
  { en: 'fresh fish', km: 'ត្រីស្រស់' },
  { en: 'chicken breast', km: 'ទ្រូងមាន់' },
  { en: 'morning glory', km: 'ត្រកួន' },
  { en: 'tofu', km: 'តៅហ៊ូ' },
  { en: 'boiled egg', km: 'ស៊ុតស្ងោរ' },
  { en: 'apple', km: 'ផ្លែប៉ោម' },
  { en: 'banana', km: 'ផ្លែចេក' }
];

export function NutritionExplorer() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('white rice');
  const [activeQuery, setActiveQuery] = useState('white rice');
  const [displayMode, setDisplayMode] = useState<'per100g' | 'perServing'>('per100g');

  const { data: foods = [], isLoading, isError } = useQuery<FoodNutritionItem[]>({
    queryKey: ['nutrition', activeQuery],
    queryFn: () => knowledgeService.searchFoods(activeQuery),
    enabled: Boolean(activeQuery.trim())
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 mb-3">
            <Utensils className="w-3.5 h-3.5 mr-1 text-emerald-300" />
            {locale === 'km' ? 'អាហារូបត្ថម្ភ និងកាបូអ៊ីដ្រាត' : 'Food & Nutrition Explorer'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight">
            {locale === 'km'
              ? 'ស្វែងយល់ពីកាបូអ៊ីដ្រាត និងអាហារូបត្ថម្ភ (USDA Database)'
              : 'Nutrient Breakdown & Carb Awareness (USDA)'}
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-khmer">
            {locale === 'km'
              ? 'ស្រាវជ្រាវបរិមាណកាបូអ៊ីដ្រាត ជាតិស្ករ ជាតិសរសៃ និងកាឡូរីពីទិន្នន័យផ្លូវការរបស់ USDA ដើម្បីជួយរៀបចំម្ហូបអាហារឱ្យមានតុល្យភាព'
              : 'Search official USDA FoodData Central nutritional facts. Distinguish total carbohydrates from sugars and understand portion pacing.'}
          </p>
        </div>
      </div>

      {/* Search Input & Quick Chips */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'km'
                  ? 'ស្វែងរកឈ្មោះម្ហូប ឬអាហារ (ឧ. rice, fish, apple)...'
                  : 'Search foods (e.g. white rice, salmon, tofu, banana)...'
              }
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow-sm transition touch-target flex-shrink-0 font-khmer"
          >
            {locale === 'km' ? 'ស្វែងរក' : 'Search'}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickSearchItems.map((item) => (
            <button
              key={item.en}
              type="button"
              onClick={() => {
                setSearchQuery(item.en);
                setActiveQuery(item.en);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeQuery === item.en
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {locale === 'km' ? item.km : item.en}
            </button>
          ))}
        </div>
      </div>

      {/* Serving Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setDisplayMode('per100g')}
            className={`px-3 py-1.5 rounded-xl transition ${
              displayMode === 'per100g' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Per 100g
          </button>
          <button
            onClick={() => setDisplayMode('perServing')}
            className={`px-3 py-1.5 rounded-xl transition ${
              displayMode === 'perServing' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Per Serving
          </button>
        </div>
      </div>

      {/* Food Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-khmer border border-slate-200">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Fetching USDA nutrition data...
        </div>
      ) : isError || foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center text-slate-500 font-khmer border border-slate-200">
          <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No food results found matching &ldquo;{activeQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foods.map((food) => (
            <FoodNutritionCard key={food.fdcId} food={food} displayMode={displayMode} />
          ))}
        </div>
      )}
    </div>
  );
}
