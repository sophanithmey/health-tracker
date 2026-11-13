'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { CambodianFoodGuide } from '@/components/lifestyle/CambodianFoodGuide';
import { MealLogSection } from '@/components/lifestyle/MealLogSection';
import { WaterTracker } from '@/components/lifestyle/WaterTracker';
import { ActivityLogSection } from '@/components/lifestyle/ActivityLogSection';
import { SymptomChecklist } from '@/components/lifestyle/SymptomChecklist';
import { MealLog, ActivityLog, LifestyleJournal } from '@/types';
import { HeartPulse, Utensils, Droplet, Footprints, Moon } from 'lucide-react';

export default function LifestylePage() {
  const t = useTranslations('lifestyle');
  const [activeTab, setActiveTab] = useState<'food_guide' | 'meals' | 'water' | 'activity' | 'sleep'>('food_guide');

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: meals, refetch: refetchMeals } = useQuery<MealLog[]>({
    queryKey: ['meals'],
    queryFn: async () => {
      const res = await axios.get('/api/lifestyle/meals');
      return res.data.data;
    }
  });

  const { data: activities, refetch: refetchActivities } = useQuery<ActivityLog[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await axios.get('/api/lifestyle/activities');
      return res.data.data;
    }
  });

  const { data: journals, refetch: refetchJournals } = useQuery<LifestyleJournal[]>({
    queryKey: ['journals'],
    queryFn: async () => {
      const res = await axios.get('/api/lifestyle/journals');
      return res.data.data;
    }
  });

  const todayJournal = journals?.find((j) => j.logDate === todayStr);

  const tabs = [
    { id: 'food_guide', label: t('foodGuideTab'), icon: Utensils },
    { id: 'meals', label: t('mealLogTab'), icon: HeartPulse },
    { id: 'water', label: t('waterTab'), icon: Droplet },
    { id: 'activity', label: t('activityTab'), icon: Footprints },
    { id: 'sleep', label: t('sleepTab'), icon: Moon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h2>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex-shrink-0 touch-target ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'food_guide' && <CambodianFoodGuide />}
      {activeTab === 'meals' && (
        <MealLogSection meals={meals || []} onRefresh={refetchMeals} />
      )}
      {activeTab === 'water' && (
        <WaterTracker
          currentGlasses={todayJournal?.waterGlasses || 6}
          logDate={todayStr}
          onUpdate={refetchJournals}
        />
      )}
      {activeTab === 'activity' && (
        <ActivityLogSection
          activities={activities || []}
          onRefresh={refetchActivities}
        />
      )}
      {activeTab === 'sleep' && (
        <SymptomChecklist
          journal={todayJournal}
          logDate={todayStr}
          onRefresh={refetchJournals}
        />
      )}
    </div>
  );
}

