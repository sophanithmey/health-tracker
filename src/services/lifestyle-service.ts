import apiClient from '@/lib/api-client';
import { MealLog, ActivityLog, LifestyleJournal } from '@/types';

export const lifestyleService = {
  async getMeals(): Promise<MealLog[]> {
    const res = await apiClient.get<{ success: boolean; data: MealLog[] }>(
      '/api/lifestyle/meals',
    );
    return res.data.data;
  },

  async logMeal(payload: Record<string, unknown>): Promise<MealLog> {
    const res = await apiClient.post<{ success: boolean; data: MealLog }>(
      '/api/lifestyle/meals',
      payload,
    );
    return res.data.data;
  },

  async getActivities(): Promise<ActivityLog[]> {
    const res = await apiClient.get<{ success: boolean; data: ActivityLog[] }>(
      '/api/lifestyle/activities',
    );
    return res.data.data;
  },

  async logActivity(payload: Record<string, unknown>): Promise<ActivityLog> {
    const res = await apiClient.post<{ success: boolean; data: ActivityLog }>(
      '/api/lifestyle/activities',
      payload,
    );
    return res.data.data;
  },

  async getJournals(): Promise<LifestyleJournal[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: LifestyleJournal[];
    }>('/api/lifestyle/journals');
    return res.data.data;
  },

  async logJournal(
    payload: Record<string, unknown>,
  ): Promise<LifestyleJournal> {
    const res = await apiClient.post<{
      success: boolean;
      data: LifestyleJournal;
    }>('/api/lifestyle/journals', payload);
    return res.data.data;
  },
};
