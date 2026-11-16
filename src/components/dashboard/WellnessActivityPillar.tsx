'use client';

import { useTranslations } from 'next-intl';
import { Footprints, Plus } from 'lucide-react';

interface WellnessActivityPillarProps {
  activeMinutes: number;
  activityGoal: number;
  isLoggingActivity: boolean;
  onLogQuickWalk: (mins: number) => void;
  isKhmer?: boolean;
}

export function WellnessActivityPillar({
  activeMinutes,
  activityGoal,
  isLoggingActivity,
  onLogQuickWalk,
}: WellnessActivityPillarProps) {
  const t = useTranslations('dashboard');
  const percent = Math.min(
    100,
    Math.round((activeMinutes / activityGoal) * 100),
  );

  return (
    <div className='bg-linear-to-b from-emerald-50/60 via-white to-emerald-50/30 border border-emerald-100 rounded-2xl p-5 flex flex-col justify-between space-y-4'>
      <div>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center'>
            <Footprints className='w-4 h-4 mr-1.5 text-emerald-600' />
            {t('physicalActivity')}
          </span>
          <span className='text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200'>
            {percent}% {t('goal')}
          </span>
        </div>

        <div className='flex items-baseline space-x-2 my-1'>
          <span className='text-3xl font-black text-slate-900'>
            {activeMinutes}
          </span>
          <span className='text-xs font-bold text-slate-500'>
            / {activityGoal} {t('minsUnit')}
          </span>
        </div>

        <div className='w-full bg-slate-100 rounded-full h-2.5 overflow-hidden my-2.5'>
          <div
            className='bg-emerald-600 h-2.5 rounded-full transition-all duration-500'
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className='text-xs text-slate-600 leading-relaxed'>
          💡 {t('postMealWalkTip')}
        </p>
      </div>

      <button
        onClick={() => onLogQuickWalk(15)}
        disabled={isLoggingActivity}
        className='w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 touch-target'
      >
        <Plus className='w-4 h-4' />
        <span>{isLoggingActivity ? '...' : t('logQuickWalkBtn')}</span>
      </button>
    </div>
  );
}
