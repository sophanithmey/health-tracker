import React, { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Layers, BookOpen, Droplet, HeartPulse, AlertTriangle, Pill, Utensils } from 'lucide-react';
import { KnowledgeCategory } from '@/types';

interface KnowledgeCategoryPillsProps {
  activeCategory: KnowledgeCategory | 'all';
  onSelectCategory: (category: KnowledgeCategory | 'all') => void;
}

export function KnowledgeCategoryPills({
  activeCategory,
  onSelectCategory
}: KnowledgeCategoryPillsProps) {
  const locale = useLocale();

  const categories = useMemo(
    () => [
      { id: 'all', label: locale === 'km' ? 'គ្រប់ប្រធានបទទាំងអស់' : 'All Topics', icon: Layers },
      { id: 'understanding', label: locale === 'km' ? 'ស្វែងយល់ពីទឹកនោមផ្អែម' : 'Understanding Diabetes', icon: BookOpen },
      { id: 'testing_guide', label: locale === 'km' ? 'មគ្គុទ្ទេសក៍វាស់ជាតិស្ករ' : 'Testing Guide', icon: Droplet },
      { id: 'glucose_hba1c', label: locale === 'km' ? 'កម្រិតជាតិស្ករ & HbA1c' : 'Glucose & HbA1c', icon: HeartPulse },
      { id: 'hypo_hyper', label: locale === 'km' ? 'ជាតិស្ករចុះទាប / ឡើងខ្ពស់' : 'Low & High Blood Sugar', icon: AlertTriangle },
      { id: 'medications', label: locale === 'km' ? 'ព័ត៌មានថ្នាំលេប' : 'Medication Education', icon: Pill },
      { id: 'nutrition', label: locale === 'km' ? 'អាហារូបត្ថម្ភ & ម្ហូបអាហារ' : 'Food & Nutrition', icon: Utensils }
    ],
    [locale]
  );

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
              isSelected
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
