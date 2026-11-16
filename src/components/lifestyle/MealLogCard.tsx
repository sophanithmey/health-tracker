import React from 'react';
import { Clock } from 'lucide-react';
import { MealLog } from '@/types';

interface MealLogCardProps {
  meal: MealLog;
}

export function MealLogCard({ meal }: MealLogCardProps) {
  const d = new Date(meal.loggedAt);
  const formatted = d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 capitalize bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            {meal.mealType}
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
              meal.carbEstimate === 'high'
                ? 'bg-rose-100 text-rose-800'
                : meal.carbEstimate === 'moderate'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {meal.carbEstimate} carb
          </span>
        </div>
        <p className="font-semibold text-slate-800 mt-1">{meal.foodDescription}</p>
        {meal.portionSize ? (
          <p className="text-[11px] text-slate-500">Portion: {meal.portionSize}</p>
        ) : null}
      </div>

      <div className="flex items-center text-slate-400 text-[11px]">
        <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
        <span>{formatted}</span>
      </div>
    </div>
  );
}
