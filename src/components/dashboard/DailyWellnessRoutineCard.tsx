'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useDailyWellness } from '@/hooks/use-daily-wellness';
import { Link } from '@/i18n/routing';
import { HeartPulse, Info } from 'lucide-react';
import { WellnessActivityPillar } from './WellnessActivityPillar';
import { WellnessHydrationPillar } from './WellnessHydrationPillar';
import { WellnessMealPillar } from './WellnessMealPillar';

export function DailyWellnessRoutineCard() {
  const t = useTranslations('dashboard');
  const {
    waterGlasses,
    waterGoal,
    activeMinutes,
    activityGoal,
    mealRecommendation,
    isUpdatingWater,
    isLoggingActivity,
    addWater,
    removeWater,
    logQuickWalk
  } = useDailyWellness();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shadow-xs flex-shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-khmer">
              {t('dailyWellnessTitle')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('dailyWellnessSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
            {t('todayRoutine')}
          </span>
        </div>
      </div>

      {/* 2. Three-Pillar Wellness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <WellnessActivityPillar
          activeMinutes={activeMinutes}
          activityGoal={activityGoal}
          isLoggingActivity={isLoggingActivity}
          onLogQuickWalk={logQuickWalk}
        />
        <WellnessHydrationPillar
          waterGlasses={waterGlasses}
          waterGoal={waterGoal}
          isUpdatingWater={isUpdatingWater}
          onAddWater={addWater}
          onRemoveWater={removeWater}
        />
        <WellnessMealPillar
          recommendation={mealRecommendation}
        />
      </div>

      {/* 3. Bottom Clinical Pacing Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2.5">
          <Info className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span>
            {t('pacingBannerText')}
          </span>
        </div>
        <Link
          href="/lifestyle"
          className="text-teal-800 font-bold hover:underline whitespace-nowrap ml-4 hidden sm:inline"
        >
          {t('lifestyleHubLink')}
        </Link>
      </div>
    </div>
  );
}
