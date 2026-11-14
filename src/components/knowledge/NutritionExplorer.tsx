'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocale } from 'next-intl';
import { FoodNutritionItem } from '@/types';
import {
  Search,
  Utensils,
  Sparkles,
  Flame,
  Wheat,
  Candy,
  Dna,
  ShieldCheck,
  Scale,
  ExternalLink,
  Layers
} from 'lucide-react';

export function NutritionExplorer() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('white rice');
  const [activeQuery, setActiveQuery] = useState('white rice');
  const [displayMode, setDisplayMode] = useState<'per100g' | 'perServing'>('per100g');

  const { data: foods, isLoading, isError } = useQuery<FoodNutritionItem[]>({
    queryKey: ['nutrition', activeQuery],
    queryFn: async () => {
      const res = await axios.get(`/api/nutrition/search?q=${encodeURIComponent(activeQuery)}&pageSize=8`);
      return res.data?.data || [];
    },
    enabled: Boolean(activeQuery.trim())
  });

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
              ? 'ស្រាវជ្រាវបរិមាណកាបូអ៊ីដ្រាត ជាតិស្ករ ជាតិសរសៃ និងកាឡូរីពីទិន្នន័យផ្លូវការរបស់ USDA ដើម្បីជួយរៀបចំម្ហូបអាហារឱ្យមានតុល្យភាព។'
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

        {/* Quick Food Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-bold flex items-center mr-1 font-khmer">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
            {locale === 'km' ? 'ជម្រើសពេញនិយម៖' : 'Common Staples:'}
          </span>
          {quickSearchItems.map((item) => (
            <button
              key={item.en}
              type="button"
              onClick={() => {
                setSearchQuery(item.en);
                setActiveQuery(item.en);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                activeQuery.toLowerCase() === item.en.toLowerCase()
                  ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200/90'
              }`}
            >
              {locale === 'km' ? `${item.km} (${item.en})` : item.en}
            </button>
          ))}
        </div>
      </div>

      {/* Serving Size Toggle & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="text-xs text-slate-500 font-khmer">
          {locale === 'km' ? 'លទ្ធផលស្រាវជ្រាវពី៖ ' : 'Nutrition Data Source: '}
          <strong className="text-slate-800">USDA FoodData Central API</strong>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-end sm:self-auto">
          <button
            onClick={() => setDisplayMode('per100g')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              displayMode === 'per100g'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {locale === 'km' ? 'ក្នុង ១០០ ក្រាម (Per 100g)' : 'Per 100g'}
          </button>
          <button
            onClick={() => setDisplayMode('perServing')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              displayMode === 'perServing'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {locale === 'km' ? 'ក្នុង ១ ចំណែក (Per Serving)' : 'Per Serving'}
          </button>
        </div>
      </div>

      {/* Food Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-khmer border border-slate-200">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          {locale === 'km' ? 'កំពុងស្វែងរកទិន្នន័យអាហារូបត្ថម្ភ...' : 'Fetching USDA nutrition data...'}
        </div>
      ) : isError || !foods || foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center text-slate-500 font-khmer border border-slate-200">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">
            {locale === 'km' ? 'រកមិនឃើញទិន្នន័យអាហារនេះទេ' : 'No food results found'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {locale === 'km'
              ? 'សូមសាកល្បងស្វែងរកជាពាក្យអង់គ្លេសទូទៅ (ឧ. rice, fish, bread, egg)'
              : 'Try searching with generic English names (e.g. rice, egg, fish, noodle)'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foods.map((food) => {
            const nutrients =
              displayMode === 'perServing' && food.perServing ? food.perServing : food.per100g;

            return (
              <div
                key={food.fdcId}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Title & Brand */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {food.descriptionKm && (
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 inline-block mb-1 font-khmer">
                          {food.descriptionKm}
                        </span>
                      )}
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {food.description}
                      </h4>
                      {food.brandOwner && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Brand: {food.brandOwner}
                        </p>
                      )}
                    </div>

                    <a
                      href={food.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-teal-700 p-1.5 rounded-lg hover:bg-slate-50 transition"
                      title="View on USDA FoodData Central"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Serving size context */}
                  <div className="text-[11px] text-slate-500 mt-2 font-medium flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {displayMode === 'perServing' && food.servingSize
                        ? `Serving: ${food.servingSize}${food.servingSizeUnit || 'g'} ${
                            food.householdServingText ? `(${food.householdServingText})` : ''
                          }`
                        : 'Standard Reference: Per 100 grams'}
                    </span>
                  </div>

                  {/* Macro Nutrients Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 text-xs">
                    {/* Calories */}
                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80">
                      <div className="text-[10px] font-bold text-orange-800 uppercase flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-orange-600" />
                        <span>Calories</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.caloriesKcal !== undefined ? `${nutrients.caloriesKcal} kcal` : 'N/A'}
                      </div>
                    </div>

                    {/* Total Carbs */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center space-x-1">
                        <Wheat className="w-3 h-3 text-amber-600" />
                        <span>Carbs</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.carbohydratesG !== undefined ? `${nutrients.carbohydratesG}g` : 'N/A'}
                      </div>
                    </div>

                    {/* Total Sugars */}
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                      <div className="text-[10px] font-bold text-rose-800 uppercase flex items-center space-x-1">
                        <Candy className="w-3 h-3 text-rose-600" />
                        <span>Sugars</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.totalSugarsG !== undefined ? `${nutrients.totalSugarsG}g` : 'N/A'}
                      </div>
                    </div>

                    {/* Fiber */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>Fiber</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.dietaryFiberG !== undefined ? `${nutrients.dietaryFiberG}g` : 'N/A'}
                      </div>
                    </div>

                    {/* Protein */}
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                      <div className="text-[10px] font-bold text-blue-800 uppercase flex items-center space-x-1">
                        <Dna className="w-3 h-3 text-blue-600" />
                        <span>Protein</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.proteinG !== undefined ? `${nutrients.proteinG}g` : 'N/A'}
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-600 uppercase">Total Fat</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {nutrients.totalFatG !== undefined ? `${nutrients.totalFatG}g` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diabetic Guidance Tip */}
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 font-khmer">
                  {nutrients.carbohydratesG !== undefined && nutrients.carbohydratesG > 30 ? (
                    <span className="text-amber-800 font-semibold">
                      💡 {locale === 'km' ? 'កាបូអ៊ីដ្រាតខ្ពស់៖ គួរវាស់ទំហំចានឱ្យល្មម និងបន្ថែមបន្លែ។' : 'Higher carbohydrate density: Balance portion size with non-starchy vegetables.'}
                    </span>
                  ) : (
                    <span className="text-teal-800 font-semibold">
                      ✓ {locale === 'km' ? 'ល្អសម្រាប់ការរៀបចំចានបាយសុខភាព។' : 'Suitable component for balanced plate planning.'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="font-khmer leading-relaxed">
          {locale === 'km'
            ? 'ចំណាំសុវត្ថិភាពអាហារូបត្ថម្ភ៖ កាបូអ៊ីដ្រាតសរុប (Total Carbohydrates) មានឥទ្ធិពលផ្ទាល់លើកម្រិតជាតិស្ករក្នុងឈាម។ ជាតិសរសៃ (Fiber) ជួយពន្យឺតការស្រូបយកជាតិស្ករ។ សូមកុំសន្មត់ថាអាហារដែលមានជាតិស្ករទាបសុទ្ធតែស័ក្តិសមទាំងអស់នោះទេ គួរពិនិត្យកាបូអ៊ីដ្រាតសរុបជានិច្ច។'
            : 'Clinical Nutrition Rule: Total carbohydrates have the most direct impact on post-meal blood sugar. Dietary fiber slows glucose absorption. Never assume all foods labeled low-sugar are unrestricted; always monitor total carbohydrates.'}
        </div>
      </div>
    </div>
  );
}

