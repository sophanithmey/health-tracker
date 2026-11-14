'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations, useLocale } from 'next-intl';
import { HealthKnowledgeArticle, KnowledgeCategory } from '@/types';
import { ArticleDetailModal } from './ArticleDetailModal';
import { TestingGuideView } from './TestingGuideView';
import { NutritionExplorer } from './NutritionExplorer';
import {
  BookOpen,
  Search,
  Droplet,
  HeartPulse,
  Pill,
  Utensils,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export function KnowledgeDashboard() {
  const t = useTranslations('knowledge');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HealthKnowledgeArticle | null>(null);

  // Queries
  const { data: articles, isLoading } = useQuery<HealthKnowledgeArticle[]>({
    queryKey: ['knowledge', activeCategory, submittedQuery],
    queryFn: async () => {
      if (submittedQuery.trim()) {
        const res = await axios.get(
          `/api/knowledge/search?q=${encodeURIComponent(submittedQuery)}&category=${
            activeCategory !== 'all' ? activeCategory : ''
          }`
        );
        return res.data?.data || [];
      } else {
        const res = await axios.get(
          `/api/knowledge/topics${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`
        );
        return res.data?.data || [];
      }
    }
  });

  // Medication-specific MedlinePlus Connect educational lookup query when on medications tab
  const { data: medicationArticles } = useQuery<HealthKnowledgeArticle[]>({
    queryKey: ['knowledge_meds'],
    queryFn: async () => {
      const res = await axios.get('/api/knowledge/medications?q=metformin');
      return res.data?.data || [];
    },
    enabled: activeCategory === 'medications' || activeCategory === 'all'
  });

  const categories = [
    { id: 'all', label: locale === 'km' ? 'គ្រប់ប្រធានបទទាំងអស់' : 'All Topics', icon: Layers },
    { id: 'understanding', label: locale === 'km' ? 'ស្វែងយល់ពីទឹកនោមផ្អែម' : 'Understanding Diabetes', icon: BookOpen },
    { id: 'testing_guide', label: locale === 'km' ? 'មគ្គុទ្ទេសក៍វាស់ជាតិស្ករ' : 'Testing Guide', icon: Droplet },
    { id: 'glucose_hba1c', label: locale === 'km' ? 'កម្រិតជាតិស្ករ & HbA1c' : 'Glucose & HbA1c', icon: HeartPulse },
    { id: 'hypo_hyper', label: locale === 'km' ? 'ជាតិស្ករចុះទាប / ឡើងខ្ពស់' : 'Low & High Blood Sugar', icon: AlertTriangle },
    { id: 'medications', label: locale === 'km' ? 'ព័ត៌មានថ្នាំលេប' : 'Medication Education', icon: Pill },
    { id: 'nutrition', label: locale === 'km' ? 'អាហារូបត្ថម្ភ & ម្ហូបអាហារ' : 'Food & Nutrition', icon: Utensils }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Portal Header */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-300" />
            {locale === 'km' ? 'មជ្ឈមណ្ឌលចំណេះដឹងវេជ្ជសាស្ត្រ' : 'Reliable Medical Knowledge'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight leading-tight">
            {locale === 'km'
              ? 'ចំណេះដឹងវេជ្ជសាស្ត្រ និងការថែទាំជំងឺទឹកនោមផ្អែម'
              : 'Diabetes Education & Health Information'}
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-khmer">
            {locale === 'km'
              ? 'ផ្តល់ព័ត៌មានអប់រំដែលអាចទុកចិត្តបានពីបណ្ណាល័យវេជ្ជសាស្ត្រជាតិអាមេរិក (MedlinePlus / NIH) និងក្រសួងកសិកម្មអាមេរិក (USDA) ដើម្បីជួយគ្រួសារតាមដាន និងថែទាំអ្នកម្តាយបានត្រឹមត្រូវ។'
              : 'Evidence-based diabetes knowledge integrated from the U.S. National Library of Medicine (MedlinePlus/NIH) and USDA FoodData Central.'}
          </p>
        </div>
      </div>

      {/* 2. Search & Category Segment Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'km'
                  ? 'ស្វែងរកប្រធានបទអប់រំ (ឧ. fasting, metformin, a1c, hypoglycemia, rice)...'
                  : 'Search MedlinePlus & guides (e.g. fasting, metformin, a1c, hypoglycemia)...'
              }
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow-sm transition touch-target flex-shrink-0 font-khmer"
          >
            {locale === 'km' ? 'ស្វែងរក' : 'Search'}
          </button>
        </form>

        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  handleClearSearch();
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-khmer">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Conditional Dedicated Views */}
      {activeCategory === 'testing_guide' && !submittedQuery ? (
        <TestingGuideView
          onOpenArticleModal={(id) => {
            const found = articles?.find((a) => a.id === id);
            if (found) setSelectedArticle(found);
          }}
        />
      ) : activeCategory === 'nutrition' && !submittedQuery ? (
        <NutritionExplorer />
      ) : (
        /* 4. Articles Listing Grid */
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-khmer border border-slate-200">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              {locale === 'km' ? 'កំពុងទាញយកព័ត៌មានវេជ្ជសាស្ត្រ...' : 'Fetching authoritative articles...'}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-500 font-khmer border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">
                {locale === 'km' ? 'រកមិនឃើញអត្ថបទដែលត្រូវនឹងការស្វែងរកទេ' : 'No articles match your query'}
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-3 px-4 py-2 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200"
              >
                {locale === 'km' ? 'បង្ហាញប្រធានបទទាំងអស់ឡើងវិញ' : 'Reset search filter'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => {
                const title = locale === 'km' && article.titleKm ? article.titleKm : article.title;
                const summary = locale === 'km' && article.summaryKm ? article.summaryKm : article.summary;

                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                          {article.isCurated
                            ? locale === 'km'
                              ? 'ការណែនាំសំខាន់'
                              : 'Curated Guide'
                            : 'MedlinePlus'}
                        </span>

                        {article.clinicalCode && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {article.clinicalCode}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 group-hover:text-teal-800 transition font-khmer leading-snug">
                        {title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-khmer">
                        {summary}
                      </p>
                    </div>

                    {/* Footer info */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[170px]">
                        {article.sourceName}
                      </span>
                      <span className="text-teal-700 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition font-khmer">
                        <span>{locale === 'km' ? 'អានបន្ថែម' : 'Read'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. MedlinePlus Connect Medication Section (When on Medications or All Topics) */}
          {(activeCategory === 'medications' || activeCategory === 'all') && medicationArticles && medicationArticles.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span className="font-khmer">
                      {locale === 'km'
                        ? 'ព័ត៌មានថ្នាំលេបពី MedlinePlus Connect (RxNorm)'
                        : 'Official Drug Information (MedlinePlus Connect)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Verified prescription education for Metformin HCl (RxCUI: 860975)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicationArticles.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => setSelectedArticle(med)}
                    className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 hover:bg-teal-50 cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{med.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {med.summary}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-teal-200/60 flex items-center justify-between text-xs text-teal-800 font-bold">
                      <span>Source: NLM MedlinePlus Connect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Medical Safety Disclaimer Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
            <div className="font-khmer leading-relaxed">
              <strong>
                {locale === 'km'
                  ? 'ការបញ្ជាក់សុវត្ថិភាពវេជ្ជសាស្ត្រ (Medical Safety Notice)៖ '
                  : 'Medical Safety Notice: '}
              </strong>
              {locale === 'km'
                ? 'ព័ត៌មានទាំងអស់ក្នុងទំព័រនេះមានគោលបំណងអប់រំ និងស្វែងយល់បន្ថែមប៉ុណ្ណោះ។ វាមិនជំនួសការធ្វើរោគវិនិច្ឆ័យ ឬវេជ្ជបញ្ជារបស់គ្រូពេទ្យឡើយ។ មិនត្រូវកែប្រែកម្រិតថ្នាំលេប ឬកែប្រែកម្រិតគោលដៅដោយគ្មានការពិគ្រោះយោបល់ជាមួយគ្រូពេទ្យឡើយ។'
                : 'All information provided in this module is for educational purposes only and does not constitute medical diagnosis or formal treatment plans. Never modify prescribed medication or care plans without direct consultation with Mom\'s attending clinician.'}
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Reader Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
