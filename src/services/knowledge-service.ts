import apiClient from '@/lib/api-client';
import { HealthKnowledgeArticle, FoodNutritionItem } from '@/types';

export const knowledgeService = {
  async getTopics(category?: string): Promise<HealthKnowledgeArticle[]> {
    const url = category && category !== 'all' ? `/api/knowledge/topics?category=${category}` : '/api/knowledge/topics';
    const res = await apiClient.get<{ success: boolean; data: HealthKnowledgeArticle[] }>(url);
    return res.data.data || [];
  },

  async searchArticles(query: string, category?: string): Promise<HealthKnowledgeArticle[]> {
    const catParam = category && category !== 'all' ? `&category=${category}` : '';
    const res = await apiClient.get<{ success: boolean; data: HealthKnowledgeArticle[] }>(
      `/api/knowledge/search?q=${encodeURIComponent(query)}${catParam}`
    );
    return res.data.data || [];
  },

  async getMedicationArticles(query = 'metformin'): Promise<HealthKnowledgeArticle[]> {
    const res = await apiClient.get<{ success: boolean; data: HealthKnowledgeArticle[] }>(
      `/api/knowledge/medications?q=${encodeURIComponent(query)}`
    );
    return res.data.data || [];
  },

  async searchFoods(query: string): Promise<FoodNutritionItem[]> {
    const res = await apiClient.get<{ success: boolean; data: FoodNutritionItem[] }>(
      `/api/nutrition/search?q=${encodeURIComponent(query)}`
    );
    return res.data.data || [];
  }
};
