import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifestyleService } from '@/services/lifestyle-service';
import { LifestyleJournal, ActivityLog } from '@/types';

export interface MealRecommendation {
  period: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  titleKm: string;
  titleEn: string;
  descriptionKm: string;
  descriptionEn: string;
  giLevel: 'low' | 'medium';
  plateTipKm: string;
  plateTipEn: string;
  cautionKm?: string;
  cautionEn?: string;
}

export function getMealRecommendation(): MealRecommendation {
  // Use Asia/Phnom_Penh hour
  const phnomPenhHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Phnom_Penh',
      hour: 'numeric',
      hour12: false
    }).format(new Date()),
    10
  );

  if (phnomPenhHour < 11) {
    return {
      period: 'breakfast',
      titleKm: 'សម្លកកូរ ឬ ពងមាន់ស្ងោរជាមួយបន្លែស្រស់',
      titleEn: 'Khmer Vegetable Soup (Samlor Korko) & Boiled Egg',
      descriptionKm: 'សម្បូរសរសៃបន្លែ ប្រូតេអ៊ីនខ្ពស់ និងមិនធ្វើឱ្យជាតិស្ករឡើងលឿន',
      descriptionEn: 'High-fiber mixed vegetables with clean protein to steady morning glucose',
      giLevel: 'low',
      plateTipKm: 'កាត់បន្ថយបាយសមកត្រឹម ១ កូនចាន និងបន្ថែមបន្លែច្រើន',
      plateTipEn: 'Keep white rice to 1 small bowl; prioritize greens and broth',
      cautionKm: 'ចៀសវាងកាហ្វេទឹកដោះគោខាប់ផ្អែម ឬនំបញ្ចុកទឹកសម្លផ្អែម',
      cautionEn: 'Avoid sweetened condensed milk iced coffee or sugary tea'
    };
  }

  if (phnomPenhHour < 16) {
    return {
      period: 'lunch',
      titleKm: 'ត្រីចំហុយខ្ញី ជាមួយត្រកួន ឬស្លឹកម្រុំស្ងោរ',
      titleEn: 'Steamed Ginger Fish with Boiled Greens & Brown Rice',
      descriptionKm: 'អូមេហ្គា-៣ ជួយបេះដូង និងកាបូអ៊ីដ្រាតរំលាយយឺតការពារជាតិស្ករឡើងខ្ពស់ក្រោយបាយ',
      descriptionEn: 'Lean omega-3 fish with slow-digesting greens to blunt post-meal spike',
      giLevel: 'low',
      plateTipKm: 'រូបមន្តចានសុខភាព៖ បន្លែ ១/២, សាច់ត្រី ១/៤, បាយសម្រូប ១/៤',
      plateTipEn: 'Plate rule: 1/2 vegetables, 1/4 fish/protein, 1/4 brown rice',
      cautionKm: 'ដើរយឺតៗ ១៥ នាទីក្រោយបាយ ដើម្បីជួយដុតរំលាយជាតិស្ករ',
      cautionEn: 'A gentle 15-minute walk after lunch lowers 2-hour postprandial spike'
    };
  }

  if (phnomPenhHour < 21) {
    return {
      period: 'dinner',
      titleKm: 'សម្លស្ងោរត្រឡាចសាច់មាន់ស្រែ ឬស្ងោរម្រះ',
      titleEn: 'Clear Winter Melon or Bitter Gourd Soup with Chicken',
      descriptionKm: 'ងាយរំលាយ ជាតិទឹកច្រើន និងម្រះជួយសម្រួលជាតិស្ករពេលយប់',
      descriptionEn: 'Light, hydrating broth; bitter gourd naturally aids glucose metabolism',
      giLevel: 'low',
      plateTipKm: 'ពិសាឱ្យបានមុនម៉ោង ៧:៣០ យប់ ដើម្បីសម្រួលដំណេក និងជាតិស្ករពេលព្រឹក',
      plateTipEn: 'Dine at least 2–3 hours before bed to protect overnight fasting sugar',
      cautionKm: 'កុំទទួលទានផ្លែឈើផ្អែមខ្លាំង (ស្វាយទុំ មៀន) នៅពេលល្ងាច',
      cautionEn: 'Avoid late-night high-sugar tropical fruits (ripe mango, longan)'
    };
  }

  return {
    period: 'snack',
    titleKm: 'ទឹកក្តៅឧណ្ហៗ ឬ គ្រាប់ធញ្ញជាតិពីរបីគ្រាប់',
    titleEn: 'Warm Water or Handful of Unsalted Almonds/Walnuts',
    descriptionKm: 'ជួយឱ្យគេងលក់ស្រួល និងរក្សាកម្រិតជាតិស្ករឱ្យថេរពេញមួយយប់',
    descriptionEn: 'Calming, zero added sugar, maintains steady glucose through the night',
    giLevel: 'low',
    plateTipKm: 'កុំពិសាទឹកច្រើនពេកមុនគេង ដើម្បីកុំឱ្យនោមញឹកញាប់ពេលយប់',
    plateTipEn: 'Sip moderately so sleep is not disrupted by bathroom visits'
  };
}

export function useDailyWellness() {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: journals = [], isLoading: isJournalsLoading } = useQuery<LifestyleJournal[]>({
    queryKey: ['journals'],
    queryFn: () => lifestyleService.getJournals()
  });

  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery<ActivityLog[]>({
    queryKey: ['activities'],
    queryFn: () => lifestyleService.getActivities()
  });

  const todayJournal = journals.find((j) => j.logDate === todayStr) || journals[0];
  const waterGlasses = todayJournal?.waterGlasses ?? 6;
  const waterGoal = 8;

  // Sum active minutes from today's activities
  const todayActivities = activities.filter((a) => {
    const actDate = a.loggedAt ? a.loggedAt.split('T')[0] : '';
    return actDate === todayStr || actDate === '';
  });
  const activeMinutes = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) || 25;
  const activityGoal = 30;

  const waterMutation = useMutation({
    mutationFn: async (newCount: number) => {
      const val = Math.max(0, Math.min(20, newCount));
      return lifestyleService.logJournal({
        logDate: todayStr,
        waterGlasses: val,
        sleepHours: todayJournal?.sleepHours ?? 7.5,
        symptoms: todayJournal?.symptoms ?? []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    }
  });

  const activityMutation = useMutation({
    mutationFn: async (minutes: number) => {
      return lifestyleService.logActivity({
        activityType: 'walking',
        durationMinutes: minutes,
        intensity: 'light',
        loggedAt: new Date().toISOString(),
        notes: 'Quick post-meal walk logged from Dashboard'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  const mealRecommendation = getMealRecommendation();

  return {
    todayStr,
    waterGlasses,
    waterGoal,
    activeMinutes,
    activityGoal,
    mealRecommendation,
    isLoading: isJournalsLoading || isActivitiesLoading,
    isUpdatingWater: waterMutation.isPending,
    isLoggingActivity: activityMutation.isPending,
    addWater: () => waterMutation.mutate(waterGlasses + 1),
    removeWater: () => waterMutation.mutate(waterGlasses - 1),
    logQuickWalk: (mins = 15) => activityMutation.mutate(mins)
  };
}
