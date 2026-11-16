import apiClient from '@/lib/api-client';
import { HealthReportSummary } from '@/types';

export const reportService = {
  async getSummary(days = 7): Promise<{ summary: HealthReportSummary }> {
    const res = await apiClient.get<{ success: boolean; data: { summary: HealthReportSummary } }>(
      `/api/reports?days=${days}`
    );
    return res.data.data;
  }
};
