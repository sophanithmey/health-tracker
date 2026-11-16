import apiClient from '@/lib/api-client';
import { Medication, MedicationLog } from '@/types';
import {
  EnrichedMedicationReference,
  RxNormDrugConcept,
} from '@/types/medication-database';

export const medicationService = {
  async getMedications(): Promise<Medication[]> {
    const res = await apiClient.get<{ success: boolean; data: Medication[] }>(
      '/api/medications',
    );
    return res.data.data;
  },

  async getLogs(): Promise<MedicationLog[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: MedicationLog[];
    }>('/api/medications/logs');
    return res.data.data;
  },

  async createMedication(
    payload: Record<string, unknown>,
  ): Promise<Medication> {
    const res = await apiClient.post<{ success: boolean; data: Medication }>(
      '/api/medications',
      payload,
    );
    return res.data.data;
  },

  async deleteMedication(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(
      `/api/medications/${id}`,
    );
    return res.data.success;
  },

  async logDose(payload: Record<string, unknown>): Promise<MedicationLog> {
    const res = await apiClient.post<{ success: boolean; data: MedicationLog }>(
      '/api/medications/logs',
      payload,
    );
    return res.data.data;
  },

  async searchMedications(
    query: string,
    limit = 10,
  ): Promise<{ items: RxNormDrugConcept[]; total: number }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { items: RxNormDrugConcept[]; total: number };
    }>(`/api/medications/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return res.data.data;
  },

  async getReference(rxcui: string): Promise<EnrichedMedicationReference> {
    const res = await apiClient.get<{
      success: boolean;
      data: EnrichedMedicationReference;
    }>(`/api/medications/reference/${rxcui}`);
    return res.data.data;
  },
};
