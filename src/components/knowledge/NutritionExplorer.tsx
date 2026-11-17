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
  { en: 'morning glory', km: 'ត្រកួន' },
  { en: 'cabbage', km: 'ស្ពៃក្តោប' },
  { en: 'cucumber', km: 'ត្រសក់' },
  { en: 'fresh fish', km: 'ត្រីស្រស់' },
  { en: 'boiled egg', km: 'ស៊ុតស្ងោរ' },
  { en: 'chicken breast', km: 'ទ្រូងមាន់' },
  { en: 'brown rice', km: 'បាយសម្រូប' },
  { en: 'tofu', km: 'តៅហ៊ូ' },
  { en: 'banana', km: 'ផ្លែចេក' },
  { en: 'apple', km: 'ផ្លែប៉ោម' }
];

export function NutritionExplorer() {
  const locale = useLocale();
  const isKhmer = locale === 'km';
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
            {isKhmer ? 'អាហារូបត្ថម្ភ និងកាបូអ៊ីដ្រាត' : 'Food & Nutrition Explorer'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight">
            {isKhmer
              ? 'ស្វែងយល់ពីកាបូអ៊ីដ្រាត និងរបៀបញ៉ាំសុវត្ថិភាព (USDA)'
              : 'Nutrient Breakdown & Diabetic Portion Guide (USDA)'}
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-khmer">
            {isKhmer
              ? 'ស្វែងរកព័ត៌មានអាហារូបត្ថម្ភ ជាមួយការណែនាំពីបរិមាណដែលគួរញ៉ាំ និងកម្រិតសុវត្ថិភាពសម្រាប់អ្នកជំងឺទឹកនោមផ្អែម'
              : 'Search official USDA FoodData Central nutritional facts with clinical portion sizes, glycemic spike warnings, and safe pairing advice.'}
          </p>
        </div>
      </div>

      {/* ADA Plate Method Visual Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 text-xs text-emerald-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🍽️</span>
            <div>
              <h4 className="font-bold text-emerald-900 font-khmer">
                {isKhmer ? 'វិធានចានសុខភាព ADA (Diabetes Plate Method)' : 'ADA Diabetes Plate Method'}
              </h4>
              <p className="text-[11px] text-emerald-800 font-khmer mt-0.5">
                {isKhmer
                  ? 'បន្លែគ្មានម្សៅ ១/២ ចាន (ញ៉ាំដោយសេរី) • សាច់/ត្រី ១/៤ ចាន • បាយ/ជាតិម្សៅ ១/៤ ចាន (កម្រិត ១/២ កែវ)'
                  : '1/2 Plate Non-Starchy Veggies (Eat Freely) • 1/4 Plate Lean Protein • 1/4 Plate Carbs (Limit to 1/2 cup)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 {isKhmer ? 'បន្លែ៖ កន្លះចាន' : 'Veg: 1/2 Plate'}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-300">
              🔵 {isKhmer ? 'ប្រូតេអ៊ីន៖ ១/៤' : 'Protein: 1/4'}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
              🟡 {isKhmer ? 'បាយ៖ ១/៤' : 'Carbs: 1/4'}
            </span>
          </div>
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
                isKhmer
                  ? 'ស្វែងរកឈ្មោះម្ហូប ឬបន្លែ (ឧ. white rice, morning glory, fish)...'
                  : 'Search food or vegetable (e.g. white rice, morning glory, fish)...'
              }
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow-sm transition touch-target flex-shrink-0 font-khmer"
          >
            {isKhmer ? 'ស្វែងរក' : 'Search'}
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
              {isKhmer ? item.km : item.en}
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
