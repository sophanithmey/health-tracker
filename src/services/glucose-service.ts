import apiClient from '@/lib/api-client';
import { GlucoseRecord, MeasurementType, NotificationAlert } from '@/types';

export interface CreateGlucoseRecordPayload {
  valueMgDl: number;
  measurementType: MeasurementType;
  measuredAt: string;
  mealDescription?: string;
  symptoms?: string[];
  notes?: string;
}

export const glucoseService = {
  async getRecords(limit?: number): Promise<{ records: GlucoseRecord[]; total: number }> {
    const url = limit ? `/api/glucose?limit=${limit}` : '/api/glucose';
    const res = await apiClient.get<{ success: boolean; data: { records: GlucoseRecord[]; total: number } }>(url);
    return res.data.data;
  },

  async createRecord(payload: CreateGlucoseRecordPayload): Promise<{ record: GlucoseRecord; alert?: NotificationAlert }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { record: GlucoseRecord; alert?: NotificationAlert };
    }>('/api/glucose', payload);
    return res.data.data;
  },

  async deleteRecord(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(`/api/glucose/${id}`);
    return res.data.success;
  }
};
