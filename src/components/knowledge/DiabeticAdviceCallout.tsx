'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DiabeticPortionAdvice } from '@/lib/diabetic-food-advisor';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface DiabeticAdviceCalloutProps {
  advice: DiabeticPortionAdvice;
  isKhmer: boolean;
}

export function DiabeticAdviceCallout({
  advice,
  isKhmer,
}: DiabeticAdviceCalloutProps) {
  const t = useTranslations('knowledge');
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className='p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2'>
      <div className='flex items-start space-x-2'>
        <Scale className='w-4 h-4 text-teal-700 shrink-0 mt-0.5' />
        <div className='text-xs leading-relaxed'>
          <strong className='text-slate-900 block font-khmer'>
            {t('howMuchToEat')}
          </strong>
          <span className='text-slate-700 font-khmer'>
            {isKhmer ? advice.portionGuideKm : advice.portionGuideEn}
          </span>
        </div>
      </div>

      {/* Quick toggle for detailed eating guide */}
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 pt-1 font-khmer'
      >
        <span>
          {isExpanded ? t('hideDetailedGuide') : t('showDetailedGuide')}
        </span>
        {isExpanded ? (
          <ChevronUp className='w-3.5 h-3.5' />
        ) : (
          <ChevronDown className='w-3.5 h-3.5' />
        )}
      </button>

      {isExpanded ? (
        <div className='pt-2 border-t border-slate-200/80 space-y-2 text-[11px]'>
          <div>
            <strong className='text-slate-900 font-khmer'>
              {t('bloodSugarImpact')}{' '}
            </strong>
            <span className='text-slate-600 font-khmer'>
              {isKhmer ? advice.glycemicImpactKm : advice.glycemicImpactEn}
            </span>
          </div>

          <div>
            <strong className='text-slate-900 font-khmer'>
              {t('howToEatSafely')}{' '}
            </strong>
            <span className='text-slate-600 font-khmer'>
              {isKhmer ? advice.howToEatKm : advice.howToEatEn}
            </span>
          </div>

          {advice.healthierSwapEn ? (
            <div className='bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 text-amber-950'>
              <strong className='font-khmer'>
                💡 {t('healthierSwap')}{' '}
              </strong>
              <span className='font-khmer'>
                {isKhmer ? advice.healthierSwapKm : advice.healthierSwapEn}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
