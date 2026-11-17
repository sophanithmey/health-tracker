'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { FoodNutritionItem } from '@/types';
import { getDiabeticFoodAdvice } from '@/lib/diabetic-food-advisor';
import {
  Flame,
  Wheat,
  Candy,
  Scale,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FoodNutritionCardProps {
  food: FoodNutritionItem;
  displayMode: 'per100g' | 'perServing';
}

export function FoodNutritionCard({ food, displayMode }: FoodNutritionCardProps) {
  const locale = useLocale();
  const isKhmer = locale === 'km';
  const [isExpanded, setIsExpanded] = useState(true);

  const nutrients =
    displayMode === 'perServing' && food.perServing ? food.perServing : food.per100g;

  const advice = getDiabeticFoodAdvice(food);

  const VerdictIcon =
    advice.verdict === 'eat_freely'
      ? ShieldCheck
      : advice.verdict === 'portion_control'
      ? Scale
      : AlertTriangle;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between space-y-4">
      <div className="space-y-3.5">
        {/* Header & External USDA link */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {food.descriptionKm ? (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 font-khmer">
                  {food.descriptionKm}
                </span>
              ) : null}

              {/* Diabetic Verdict Pill */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${advice.verdictBadgeClass} font-khmer`}
              >
                <VerdictIcon className="w-3.5 h-3.5 mr-1" />
                {isKhmer ? advice.verdictTitleKm : advice.verdictTitleEn}
              </span>
            </div>

            <h4 className="text-base font-black text-slate-900 leading-snug">
              {food.description}
            </h4>

            {food.brandOwner ? (
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Brand: {food.brandOwner}
              </p>
            ) : null}
          </div>

          <a
            href={food.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-teal-700 p-1.5 rounded-lg hover:bg-slate-50 transition shrink-0"
            title="View on USDA FoodData Central"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Clinical Diabetic Portion Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-start space-x-2">
            <Scale className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-slate-900 block font-khmer">
                {isKhmer ? 'បរិមាណដែលគួរញ៉ាំ៖' : 'How Much to Eat:'}
              </strong>
              <span className="text-slate-700 font-khmer">
                {isKhmer ? advice.portionGuideKm : advice.portionGuideEn}
              </span>
            </div>
          </div>

          {/* Quick toggle for detailed eating guide */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 pt-1 font-khmer"
          >
            <span>
              {isExpanded
                ? isKhmer
                  ? 'បិទការណែនាំលម្អិត'
                  : 'Hide detailed eating guide'
                : isKhmer
                ? 'បង្ហាញរបៀបញ៉ាំសុវត្ថិភាព'
                : 'Show safe eating tips'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded ? (
            <div className="pt-2 border-t border-slate-200/80 space-y-2 text-[11px]">
              <div>
                <strong className="text-slate-900 font-khmer">
                  {isKhmer ? 'ឥទ្ធិពលលើជាតិស្ករ៖ ' : 'Blood Sugar Impact: '}
                </strong>
                <span className="text-slate-600 font-khmer">
                  {isKhmer ? advice.glycemicImpactKm : advice.glycemicImpactEn}
                </span>
              </div>

              <div>
                <strong className="text-slate-900 font-khmer">
                  {isKhmer ? 'គន្លឹះញ៉ាំសុវត្ថិភាព៖ ' : 'How to Eat Safely: '}
                </strong>
                <span className="text-slate-600 font-khmer">
                  {isKhmer ? advice.howToEatKm : advice.howToEatEn}
                </span>
              </div>

              {advice.healthierSwapEn ? (
                <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 text-amber-950">
                  <strong className="font-khmer">
                    💡 {isKhmer ? 'ជម្រើសជំនួសល្អជាង៖ ' : 'Healthier Swap: '}
                  </strong>
                  <span className="font-khmer">
                    {isKhmer ? advice.healthierSwapKm : advice.healthierSwapEn}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Standard Serving Reference */}
        <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
          <Scale className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {displayMode === 'perServing' && food.servingSize
              ? `Serving: ${food.servingSize}${food.servingSizeUnit || 'g'} ${
                  food.householdServingText ? `(${food.householdServingText})` : ''
                }`
              : 'Standard Reference: Per 100 grams'}
          </span>
        </div>

        {/* Macro Nutrients Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Calories', icon: Flame, val: nutrients.caloriesKcal !== undefined ? `${nutrients.caloriesKcal} kcal` : 'N/A', bg: 'bg-orange-50/70 border-orange-200/80 text-orange-800 icon-text-orange-600' },
            { label: 'Carbs', icon: Wheat, val: nutrients.carbohydratesG !== undefined ? `${nutrients.carbohydratesG}g` : 'N/A', bg: 'bg-amber-50/70 border-amber-200/80 text-amber-800 icon-text-amber-600' },
            { label: 'Sugars', icon: Candy, val: nutrients.totalSugarsG !== undefined ? `${nutrients.totalSugarsG}g` : '0g', bg: 'bg-purple-50/70 border-purple-200/80 text-purple-800 icon-text-purple-600' }
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`p-2.5 rounded-xl border ${m.bg.split(' ')[0]} ${m.bg.split(' ')[1]}`}>
                <div className={`text-[10px] font-bold uppercase flex items-center space-x-1 ${m.bg.split(' ')[2]}`}>
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{m.val}</div>
              </div>
            );
          })}
        </div>

        {/* Secondary Nutrients Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Fiber: <strong className="text-slate-800">{nutrients.dietaryFiberG ?? 0}g</strong></span>
          <span>Protein: <strong className="text-slate-800">{nutrients.proteinG ?? 0}g</strong></span>
          <span>Fat: <strong className="text-slate-800">{nutrients.totalFatG ?? 0}g</strong></span>
        </div>
      </div>
    </div>
  );
}
