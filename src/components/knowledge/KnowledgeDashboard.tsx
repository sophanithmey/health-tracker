'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { Search, BookOpen } from 'lucide-react';
import { TestingGuideView } from './TestingGuideView';
import { useKnowledgeDashboard } from '@/hooks/use-knowledge-dashboard';
import { KnowledgeCategoryPills } from './KnowledgeCategoryPills';
import { KnowledgeArticleCard } from './KnowledgeArticleCard';

const ArticleDetailModal = dynamic(
  () => import('./ArticleDetailModal').then((m) => m.ArticleDetailModal),
  { ssr: false }
);

const NutritionExplorer = dynamic(
  () => import('./NutritionExplorer').then((m) => m.NutritionExplorer),
  {
    loading: () => (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs animate-pulse text-center text-slate-400">
        Loading Nutrition Explorer...
      </div>
    )
  }
);

export function KnowledgeDashboard() {
  const t = useTranslations('knowledge');
  const locale = useLocale();

  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedArticle,
    setSelectedArticle,
    articles,
    isLoading,
    handleSearchSubmit
  } = useKnowledgeDashboard();

  return (
    <div className="space-y-6">
      {/* Category Navigation Pills */}
      <KnowledgeCategoryPills
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Conditional: Testing Guide View or Nutrition Explorer or Standard Articles */}
      {activeCategory === 'testing_guide' ? (
        <TestingGuideView />
      ) : activeCategory === 'nutrition' ? (
        <NutritionExplorer />
      ) : (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    locale === 'km'
                      ? 'ស្វែងរកប្រធានបទសុខភាព (ឧ. HbA1c, អាហារ, ជាតិស្ករចុះ)...'
                      : 'Search clinical topics (e.g. HbA1c, hypoglycemia, diet)...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition"
              >
                {locale === 'km' ? 'ស្វែងរក' : 'Search'}
              </button>
            </form>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading educational library articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No clinical articles found matching your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <KnowledgeArticleCard
                  key={article.id}
                  article={article}
                  onSelect={setSelectedArticle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedArticle ? (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      ) : null}
    </div>
  );
}
