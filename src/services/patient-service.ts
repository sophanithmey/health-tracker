import apiClient from '@/lib/api-client';
import { PatientProfile, UserRole } from '@/types';

export const patientService = {
  async getPatient(): Promise<PatientProfile> {
    const res = await apiClient.get<{ success: boolean; data: PatientProfile }>(
      '/api/patient',
    );
    return res.data.data;
  },

  async updatePatient(data: Partial<PatientProfile>): Promise<PatientProfile> {
    const res = await apiClient.patch<{ success: boolean; data: PatientProfile }>(
      '/api/patient',
      data,
    );
    return res.data.data;
  },

  async switchRole(role: UserRole): Promise<{ role: UserRole }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { role: UserRole };
    }>('/api/auth/switch-role', { role });
    return res.data.data;
  },
};
