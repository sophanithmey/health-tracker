import React from 'react';
import { FoodNutritionItem } from '@/types';
import { Flame, Wheat, Candy, Dna, Scale, ExternalLink } from 'lucide-react';

interface FoodNutritionCardProps {
  food: FoodNutritionItem;
  displayMode: 'per100g' | 'perServing';
}

export function FoodNutritionCard({ food, displayMode }: FoodNutritionCardProps) {
  const nutrients =
    displayMode === 'perServing' && food.perServing ? food.perServing : food.per100g;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            {food.descriptionKm ? (
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 inline-block mb-1 font-khmer">
                {food.descriptionKm}
              </span>
            ) : null}
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
            className="text-slate-400 hover:text-teal-700 p-1.5 rounded-lg hover:bg-slate-50 transition"
            title="View on USDA FoodData Central"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="text-[11px] text-slate-500 mt-2 font-medium flex items-center space-x-1">
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
        <div className="grid grid-cols-3 gap-2 mt-3.5 text-xs">
          <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80">
            <div className="text-[10px] font-bold text-orange-800 uppercase flex items-center space-x-1">
              <Flame className="w-3 h-3 text-orange-600" />
              <span>Calories</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {nutrients.caloriesKcal !== undefined ? `${nutrients.caloriesKcal} kcal` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center space-x-1">
              <Wheat className="w-3 h-3 text-amber-600" />
              <span>Carbs</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {nutrients.carbohydratesG !== undefined ? `${nutrients.carbohydratesG}g` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
            <div className="text-[10px] font-bold text-purple-800 uppercase flex items-center space-x-1">
              <Candy className="w-3 h-3 text-purple-600" />
              <span>Sugars</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {nutrients.totalSugarsG !== undefined ? `${nutrients.totalSugarsG}g` : '0g'}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Fiber: <strong className="text-slate-800">{nutrients.dietaryFiberG ?? 0}g</strong></span>
          <span>Protein: <strong className="text-slate-800">{nutrients.proteinG ?? 0}g</strong></span>
          <span>Fat: <strong className="text-slate-800">{nutrients.totalFatG ?? 0}g</strong></span>
        </div>
      </div>
    </div>
  );
}
