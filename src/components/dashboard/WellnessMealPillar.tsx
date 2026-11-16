'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Utensils, ArrowRight } from 'lucide-react';
import { MealRecommendation } from '@/hooks/use-daily-wellness';

interface WellnessMealPillarProps {
  recommendation: MealRecommendation;
  isKhmer?: boolean;
}

export function WellnessMealPillar({
  recommendation,
  isKhmer
}: WellnessMealPillarProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isKm = isKhmer ?? (locale === 'km');

  return (
    <div className="bg-linear-to-b from-amber-50/60 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center">
            <Utensils className="w-4 h-4 mr-1.5 text-amber-700" />
            {t('whatMomCanEat')}
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200 uppercase">
            {recommendation.period}
          </span>
        </div>

        <h4 className="text-sm font-black text-slate-900 mt-1 font-khmer">
          {isKm ? recommendation.titleKm : recommendation.titleEn}
        </h4>

        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {isKm ? recommendation.descriptionKm : recommendation.descriptionEn}
        </p>

        <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] font-semibold text-amber-900">
          🥗 {isKm ? recommendation.plateTipKm : recommendation.plateTipEn}
        </div>
      </div>

      <Link
        href="/lifestyle"
        className="w-full py-2.5 px-3 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300/80 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 touch-target shadow-2xs group"
      >
        <span>{t('viewCambodianFoodGuide')}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
      </Link>
    </div>
  );
}
