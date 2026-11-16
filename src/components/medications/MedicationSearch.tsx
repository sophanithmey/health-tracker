'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Search, Database, Loader2, Pill } from 'lucide-react';
import { RxNormDrugConcept } from '@/types/medication-database';
import { useMedicationSearch } from '@/hooks/use-medication-search';
import { MedicationSearchResultCard } from './MedicationSearchResultCard';

interface MedicationSearchProps {
  onSelectMedication?: (med: RxNormDrugConcept) => void;
  onOpenDetail: (rxcui: string, drugName: string) => void;
}

const quickPills = [
  { query: 'metformin', label: 'Metformin', labelKm: 'មេតហ្វ័រមីន' },
  { query: 'gliclazide', label: 'Gliclazide', labelKm: 'គ្លីក្លាស៊ីត' },
  { query: 'sitagliptin', label: 'Sitagliptin (Januvia)', labelKm: 'ស៊ីតាក្លីបទីន' },
  { query: 'glimepiride', label: 'Glimepiride', labelKm: 'គ្លីមេភីរាយ' },
  { query: 'empagliflozin', label: 'Empagliflozin', labelKm: 'អែមប៉ាក្លីហ្វ្លូស៊ីន' },
  { query: 'insulin', label: 'Insulin', labelKm: 'អាំងស៊ុយលីន' }
];

export function MedicationSearch({ onSelectMedication, onOpenDetail }: MedicationSearchProps) {
  const locale = useLocale();
  const { query, setQuery, items, isLoading } = useMedicationSearch('metformin');

  return (
    <div className="space-y-6">
      {/* Search Header Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-bold mb-3 border border-white/10">
            <Database className="w-3.5 h-3.5" />
            <span>{locale === 'km' ? 'មូលទិន្នន័យថ្នាំស្តង់ដារជាតិ' : 'Official RxNorm & DailyMed Drug Database'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight leading-snug">
            {locale === 'km'
              ? 'ស្វែងរកព័ត៌មានថ្នាំ & កម្រិតប្រើប្រាស់'
              : 'Search Medications & Clinical Drug Reference'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-2 font-medium leading-relaxed">
            {locale === 'km'
              ? 'ស្រាវជ្រាវឈ្មោះឱសថទូទៅ (Generic), ឈ្មោះពាណិជ្ជកម្ម (Brand), សារធាតុសកម្ម, កម្រិតថ្នាំ និងការណែនាំពី FDA សហរដ្ឋអាមេរិក'
              : 'Explore generic and brand names, active ingredients, available strengths, dosage forms, and official FDA/DailyMed safety labeling.'}
          </p>

          {/* Search Input Bar */}
          <div className="mt-6 relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'km' ? 'ស្វែងរកឈ្មោះថ្នាំ (ឧ. Metformin, Diamicron, Januvia)...' : 'Search drug name (e.g. Metformin, Gliclazide, Januvia)...'}
                className="w-full bg-white text-slate-900 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-400/30"
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-teal-700 animate-spin absolute right-4" />
              ) : null}
            </div>
          </div>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {quickPills.map((pill) => (
              <button
                key={pill.query}
                onClick={() => setQuery(pill.query)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  query.toLowerCase() === pill.query.toLowerCase()
                    ? 'bg-teal-400 text-teal-950 font-black'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {locale === 'km' ? pill.labelKm : pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {items.length === 0 && !isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No standardized RxNorm medications found matching &ldquo;{query}&rdquo;.
          </div>
        ) : (
          items.map((item) => (
            <MedicationSearchResultCard
              key={item.rxcui}
              item={item}
              onOpenDetail={onOpenDetail}
              onSelectMedication={onSelectMedication}
            />
          ))
        )}
      </div>
    </div>
  );
}
