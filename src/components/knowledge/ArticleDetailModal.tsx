'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { HealthKnowledgeArticle } from '@/types';
import {
  X,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  Tag
} from 'lucide-react';

interface ArticleDetailModalProps {
  article: HealthKnowledgeArticle | null;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const locale = useLocale();

  if (!article) return null;

  const displayTitle = locale === 'km' && article.titleKm ? article.titleKm : article.title;
  const secondaryTitle = locale === 'km' && article.titleKm ? article.title : article.titleKm;
  const displayContent = locale === 'km' && article.contentKm ? article.contentKm : article.contentHtml;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5 pr-6">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <BookOpen className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/70 mb-1">
                {article.sourceName}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-khmer leading-snug">
                {displayTitle}
              </h3>
              {secondaryTitle && (
                <p className="text-xs text-slate-400 font-medium">{secondaryTitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{article.sourceName}</span>
            </span>

            {article.lastReviewed && (
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Reviewed: {article.lastReviewed}</span>
              </span>
            )}

            {article.clinicalCode && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                Code: {article.clinicalCode}
              </span>
            )}
          </div>

          {/* Medical Non-Diagnostic Disclaimer */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-950 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium font-khmer">
              <strong>
                {locale === 'km'
                  ? 'ព័ត៌មានអប់រំសុខភាពទូទៅ (Non-Diagnostic Disclaimer)៖ '
                  : 'Educational Health Information Disclaimer: '}
              </strong>
              {locale === 'km'
                ? 'ខ្លឹមសារនេះត្រូវបានចងក្រងពីបណ្ណាល័យវេជ្ជសាស្ត្រជាតិអាមេរិក (MedlinePlus/NIH) សម្រាប់តែការស្វែងយល់ និងតាមដានសុខភាពគ្រួសារប៉ុណ្ណោះ។ វាមិនមែនជាការធ្វើរោគវិនិច្ឆ័យ ឬការព្យាបាលវេជ្ជសាស្ត្រឡើយ។ កុំផ្លាស់ប្តូរកម្រិតថ្នាំដោយគ្មានការពិគ្រោះយោបល់ជាមួយគ្រូពេទ្យ។'
                : 'This article is sourced from the U.S. National Library of Medicine (MedlinePlus/NIH) for general educational reference only. It does not replace professional medical diagnosis or personalized treatment plans. Never modify prescribed medication doses without consulting your clinician.'}
            </div>
          </div>

          {/* Formatted Article Content */}
          <div
            className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed font-khmer space-y-4"
            dangerouslySetInnerHTML={{ __html: displayContent || `<p>${article.summary}</p>` }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 flex-shrink-0">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center space-x-1.5 transition"
          >
            <span>
              {locale === 'km' ? 'អានអត្ថបទដើមលើ MedlinePlus.gov' : 'View original source on MedlinePlus.gov'}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition font-khmer"
          >
            {locale === 'km' ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

