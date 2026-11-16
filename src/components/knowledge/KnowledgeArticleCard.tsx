import React from 'react';
import { useLocale } from 'next-intl';
import {
  ChevronRight,
  Building2,
  Droplet,
  BookOpen,
  HeartPulse,
  AlertTriangle,
  Pill,
  Utensils,
  Tag,
  LucideIcon
} from 'lucide-react';
import { HealthKnowledgeArticle } from '@/types';

interface KnowledgeArticleCardProps {
  article: HealthKnowledgeArticle;
  onSelect: (article: HealthKnowledgeArticle) => void;
}

interface CategoryStyle {
  labelEn: string;
  labelKm: string;
  icon: LucideIcon;
  badgeClass: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  testing_guide: {
    labelEn: 'Testing Guide',
    labelKm: 'មគ្គុទ្ទេសក៍វាស់',
    icon: Droplet,
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80'
  },
  understanding: {
    labelEn: 'Understanding',
    labelKm: 'ការយល់ដឹង',
    icon: BookOpen,
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80'
  },
  glucose_hba1c: {
    labelEn: 'Glucose & A1C',
    labelKm: 'ជាតិស្ករ & A1C',
    icon: HeartPulse,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
  },
  hypo_hyper: {
    labelEn: 'Low & High Sugar',
    labelKm: 'ជាតិស្ករឡើង/ចុះ',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80'
  },
  medications: {
    labelEn: 'Medications',
    labelKm: 'ថ្នាំលេប',
    icon: Pill,
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80'
  },
  nutrition: {
    labelEn: 'Nutrition',
    labelKm: 'អាហារូបត្ថម្ភ',
    icon: Utensils,
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-200/80'
  }
};

export function KnowledgeArticleCard({ article, onSelect }: KnowledgeArticleCardProps) {
  const locale = useLocale();

  const title = locale === 'km' && article.titleKm ? article.titleKm : article.title;
  const summary = locale === 'km' && article.summaryKm ? article.summaryKm : article.summary;

  const style = CATEGORY_STYLES[article.category] || {
    labelEn: article.category.replace(/_/g, ' '),
    labelKm: article.category.replace(/_/g, ' '),
    icon: Tag,
    badgeClass: 'bg-slate-50 text-slate-800 border-slate-200/80'
  };

  const CategoryIcon = style.icon;
  const categoryLabel = locale === 'km' ? style.labelKm : style.labelEn;

  return (
    <div
      onClick={() => onSelect(article)}
      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Badge & Source Header */}
        <div className="flex items-center justify-between gap-2.5 mb-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs shrink-0 whitespace-nowrap capitalize ${style.badgeClass}`}
          >
            <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-khmer">{categoryLabel}</span>
          </span>

          <div
            className="flex items-center gap-1.5 text-xs text-slate-400 font-medium min-w-0"
            title={article.sourceName}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11px] text-slate-500 font-medium">
              {article.sourceName}
            </span>
          </div>
        </div>

        {/* Article Title */}
        <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-khmer line-clamp-2 leading-snug">
          {title}
        </h4>

        {/* Article Summary */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Read Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
        <span className="font-khmer">{locale === 'km' ? 'អានអត្ថបទ' : 'Read Article'}</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
