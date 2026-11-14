'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Search,
  Pill,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  Plus,
  Loader2,
  Tag,
  Layers,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { RxNormDrugConcept } from '@/types/medication-database';

interface MedicationSearchProps {
  onSelectMedication?: (med: RxNormDrugConcept) => void;
  onOpenDetail: (rxcui: string, drugName: string) => void;
}

export function MedicationSearch({ onSelectMedication, onOpenDetail }: MedicationSearchProps) {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [query, setQuery] = useState('metformin');
  const [debouncedQuery, setDebouncedQuery] = useState('metformin');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading, isError, error } = useQuery<{
    query: string;
    total: number;
    items: RxNormDrugConcept[];
  }>({
    queryKey: ['medication-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { query: '', total: 0, items: [] };
      const res = await axios.get(`/api/medications/search?q=${encodeURIComponent(debouncedQuery)}&limit=25`);
      return res.data?.data;
    },
    enabled: Boolean(debouncedQuery),
    staleTime: 5 * 60 * 1000
  });

  const quickPills = [
    { query: 'metformin', label: 'Metformin', labelKm: 'មេតហ្វ័រមីន' },
    { query: 'gliclazide', label: 'Gliclazide', labelKm: 'គ្លីក្លាស៊ីត' },
    { query: 'sitagliptin', label: 'Sitagliptin (Januvia)', labelKm: 'ស៊ីតាក្លីបទីន' },
    { query: 'glimepiride', label: 'Glimepiride', labelKm: 'គ្លីមេភីរាយ' },
    { query: 'empagliflozin', label: 'Empagliflozin', labelKm: 'អែមប៉ាក្លីហ្វ្លូស៊ីន' },
    { query: 'insulin', label: 'Insulin', labelKm: 'អាំងស៊ុយលីន' }
  ];

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Search Header Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-bold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locale === 'km' ? 'មូលទិន្នន័យថ្នាំស្តង់ដារជាតិ' : 'Official RxNorm & DailyMed Drug Database'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight leading-snug">
            {locale === 'km'
              ? 'ស្វែងរកព័ត៌មានថ្នាំ & កម្រិតប្រើប្រាស់'
              : 'Search Medications & Clinical Drug Reference'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-2 font-medium leading-relaxed">
            {locale === 'km'
              ? 'ស្រាវជ្រាវឈ្មោះឱសថទូទៅ (Generic), ឈ្មោះពាណិជ្ជកម្ម (Brand), សារធាតុសកម្ម, កម្រិតថ្នាំ និងការណែនាំពី FDA សហរដ្ឋអាមេរិក។'
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
                placeholder={
                  locale === 'km'
                    ? 'ស្វែងរកឈ្មោះថ្នាំ ឧ. Metformin, Gliclazide, Januvia...'
                    : 'Search medication by name, e.g. Metformin, Gliclazide, Sitagliptin...'
                }
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 text-sm sm:text-base font-bold rounded-2xl shadow-lg border border-slate-200 focus:outline-hidden focus:ring-4 focus:ring-teal-400/40 transition placeholder:text-slate-400"
              />
              {isLoading && (
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin absolute right-4" />
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center flex-wrap gap-2 mt-3.5">
              <span className="text-[11px] font-bold text-teal-200 mr-1">
                {locale === 'km' ? 'ស្វែងរករហ័ស:' : 'Quick search:'}
              </span>
              {quickPills.map((pill) => (
                <button
                  key={pill.query}
                  type="button"
                  onClick={() => setQuery(pill.query)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    query.toLowerCase() === pill.query.toLowerCase()
                      ? 'bg-white text-teal-900 shadow-sm ring-2 ring-teal-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {locale === 'km' ? `${pill.labelKm} (${pill.label})` : pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Safety Disclaimer Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start space-x-3 text-amber-950 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-bold text-amber-950 mb-0.5 font-khmer">
            {locale === 'km' ? 'សេចក្តីបញ្ជាក់ផ្នែកវេជ្ជសាស្ត្រ និងសុវត្ថិភាព:' : 'Important Clinical & Jurisdictional Notice:'}
          </strong>
          {locale === 'km'
            ? 'ព័ត៌មានក្នុងមូលទិន្នន័យនេះ ផ្អែកលើស្តង់ដារ RxNorm និងស្លាកសញ្ញា FDA សហរដ្ឋអាមេរិក សម្រាប់ជាចំណេះដឹងទូទៅប៉ុណ្ណោះ។ មិនត្រូវកែប្រែកម្រិតថ្នាំ ឬឈប់ប្រើប្រាស់ដោយគ្មានការណែនាំពីគ្រូពេទ្យព្យាបាលនៅកម្ពុជាឡើយ។'
            : 'Information is derived from RxNorm, DailyMed, and openFDA reference databases for educational awareness. Always strictly follow the personalized prescription provided by your attending physician in Cambodia.'}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-teal-700" />
          <h3 className="text-lg font-black text-slate-900 font-khmer">
            {locale === 'km' ? 'លទ្ធផលស្វែងរកឱសថ' : 'Medication Database Results'}
          </h3>
        </div>
        {debouncedQuery && (
          <span className="text-xs font-bold text-slate-500">
            {items.length} {locale === 'km' ? 'មុខថ្នាំត្រូវបានរកឃើញ' : 'concepts found'}
          </span>
        )}
      </div>

      {/* Results Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-200">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900">{locale === 'km' ? 'មានបញ្ហាក្នុងការស្វែងរក' : 'Search request failed'}</h4>
          <p className="text-xs text-slate-500 mt-1">{error?.message || 'Please check your connection and try again.'}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 font-khmer">
            {locale === 'km' ? 'រកមិនឃើញថ្នាំដែលត្រូវនឹងពាក្យស្វែងរកទេ' : 'No medications found'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {locale === 'km'
              ? 'សូមសាកល្បងបញ្ចូលឈ្មោះទូទៅ (Generic Name) ដូចជា Metformin ឬ Sitagliptin។'
              : 'Try searching by active ingredient or generic name like Metformin or Gliclazide.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                {/* Badges: Source and RxCUI */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                    <Tag className="w-3 h-3 mr-1 text-teal-600" />
                    RxCUI: {item.rxcui}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.tty || 'RxNorm Concept'}
                  </span>
                </div>

                {/* Drug Name */}
                <h4 className="text-base font-black text-slate-900 group-hover:text-teal-800 transition leading-snug">
                  {item.name}
                </h4>

                {/* Generic & Brand info */}
                <div className="text-xs text-slate-600 space-y-1">
                  {item.genericName && (
                    <p>
                      <strong className="text-slate-800">{locale === 'km' ? 'ឈ្មោះទូទៅ:' : 'Generic:'}</strong> {item.genericName}
                    </p>
                  )}
                  {item.brandName && (
                    <p>
                      <strong className="text-slate-800">{locale === 'km' ? 'ឈ្មោះពាណិជ្ជកម្ម:' : 'Brand:'}</strong> {item.brandName}
                    </p>
                  )}
                  {item.activeIngredients && item.activeIngredients.length > 0 && (
                    <p className="text-[11px] text-slate-500">
                      <strong>{locale === 'km' ? 'សារធាតុសកម្ម:' : 'Ingredients:'}</strong> {item.activeIngredients.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDetail(item.rxcui, item.genericName || item.name)}
                  className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center space-x-1.5 touch-target"
                >
                  <Info className="w-4 h-4 text-teal-700" />
                  <span>{locale === 'km' ? 'ព័ត៌មានលម្អិត & សុវត្ថិភាព' : 'View Drug Guide'}</span>
                </button>

                {onSelectMedication && (
                  <button
                    type="button"
                    onClick={() => onSelectMedication(item)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5 touch-target shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{locale === 'km' ? 'បញ្ចូលក្នុងវេជ្ជបញ្ជា' : 'Select for Prescription'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

