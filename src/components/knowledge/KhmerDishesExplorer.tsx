'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CAMBODIAN_FOOD_GUIDE, CambodianDish } from '@/data/cambodianFoodGuide';
import { KhmerDishCard } from './KhmerDishCard';
import { QuickMealLogModal } from '@/components/lifestyle/QuickMealLogModal';
import { Search, Apple } from 'lucide-react';

interface KhmerDishesExplorerProps {
  initialSearchQuery?: string;
}

export function KhmerDishesExplorer({
  initialSearchQuery = '',
}: KhmerDishesExplorerProps) {
  const t = useTranslations('knowledge');
  const locale = useLocale();
  const isKhmer = locale === 'km';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dishQuery, setDishQuery] = useState(initialSearchQuery);
  const [selectedDishToLog, setSelectedDishToLog] =
    useState<CambodianDish | null>(null);

  const categories = [
    { id: 'all', en: 'All Dishes', km: 'ទាំងអស់' },
    { id: 'soup', en: 'Soups & Stews', km: 'សម្ល / ស៊ុប' },
    { id: 'main', en: 'Main Dishes', km: 'ម្ហូបចម្បង' },
    { id: 'noodle', en: 'Noodles', km: 'គុយទាវ / នំបញ្ចុក' },
    { id: 'staple', en: 'Rice & Snacks', km: 'បាយ / នំ' },
    { id: 'fruit', en: 'Local Fruits', km: 'ផ្លែឈើ' },
  ];

  const filteredDishes = CAMBODIAN_FOOD_GUIDE.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'all' || dish.category === selectedCategory;
    const q = dishQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      dish.nameKm.toLowerCase().includes(q) ||
      dish.nameEn.toLowerCase().includes(q) ||
      dish.descriptionKm.toLowerCase().includes(q) ||
      dish.descriptionEn.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className='space-y-4 animate-fade-in'>
      {/* Category Pills & Search Filter */}
      <div className='bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5'>
        <div className='relative'>
          <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            value={dishQuery}
            onChange={(e) => setDishQuery(e.target.value)}
            placeholder={
              isKhmer
                ? 'ស្វែងរកមុខម្ហូបខ្មែរ (ឧ. សម្លកកូរ, គុយទាវ, ឡុកឡាក់)...'
                : 'Filter Cambodian dishes (e.g. Samlor Korko, Kuy Teav, Lok Lak)...'
            }
            className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-khmer'
          />
        </div>

        <div className='flex items-center space-x-1.5 overflow-x-auto pb-1'>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 font-khmer ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isKhmer ? cat.km : cat.en}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className='bg-white rounded-3xl p-10 text-center text-slate-500 font-khmer border border-slate-200'>
          <Apple className='w-8 h-8 text-slate-300 mx-auto mb-2' />
          {t('noFoodFound', { query: dishQuery })}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {filteredDishes.map((dish) => (
            <KhmerDishCard
              key={dish.id}
              dish={dish}
              isKhmer={isKhmer}
              onLogMeal={(d) => setSelectedDishToLog(d)}
            />
          ))}
        </div>
      )}

      {/* Quick Meal Log Modal */}
      {selectedDishToLog ? (
        <QuickMealLogModal
          isOpen={Boolean(selectedDishToLog)}
          onClose={() => setSelectedDishToLog(null)}
          foodName={selectedDishToLog.nameEn}
          foodNameKm={selectedDishToLog.nameKm}
          initialPortion={
            isKhmer
              ? selectedDishToLog.portionGuidanceKm
              : selectedDishToLog.portionGuidanceEn
          }
          initialCarbLevel={selectedDishToLog.carbLevel}
        />
      ) : null}
    </div>
  );
}
