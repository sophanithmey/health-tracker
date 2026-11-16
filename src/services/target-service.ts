import apiClient from '@/lib/api-client';
import {
  GlucoseTarget,
  GeneralGuidelineReference,
  GlucoseTargetAuditLog,
} from '@/types';

export interface TargetsResponse {
  targets: GlucoseTarget[];
  activeTargets: Record<string, GlucoseTarget>;
  generalGuidelines: GeneralGuidelineReference[];
}

export const targetService = {
  async getTargets(patientId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'): Promise<TargetsResponse> {
    const res = await apiClient.get<{
      success: boolean;
      data: TargetsResponse | GlucoseTarget[];
      generalGuidelines?: GeneralGuidelineReference[];
    }>('/api/targets');

    const raw = res.data?.data;
    if (Array.isArray(raw)) {
      const targets = raw;
      const activeTargets: Record<string, GlucoseTarget> = {};
      for (const t of targets) {
        if (
          (t.approvalStatus === 'approved' || t.clinicianApprovalStatus === 'clinician_approved') &&
          t.isActive
        ) {
          activeTargets[t.measurementType] = t;
        }
      }
      return {
        targets,
        activeTargets,
        generalGuidelines: res.data?.generalGuidelines || []
      };
    }

    if (raw && typeof raw === 'object' && 'targets' in raw) {
      return raw as TargetsResponse;
    }

    return {
      targets: [],
      activeTargets: {},
      generalGuidelines: []
    };
  },

  async createTarget(
    patientId: string,
    payload: Record<string, unknown>,
  ): Promise<GlucoseTarget> {
    const res = await apiClient.post<{ success: boolean; data: GlucoseTarget }>(
      `/api/patients/${patientId}/glucose-targets`,
      payload,
    );
    return res.data.data;
  },

  async updateTarget(
    patientId: string,
    targetId: string,
    payload: Record<string, unknown>,
  ): Promise<GlucoseTarget> {
    const res = await apiClient.put<{ success: boolean; data: GlucoseTarget }>(
      `/api/patients/${patientId}/glucose-targets/${targetId}`,
      payload,
    );
    return res.data.data;
  },

  async approveTarget(
    patientId: string,
    targetId: string,
    reason?: string,
  ): Promise<GlucoseTarget> {
    const res = await apiClient.post<{ success: boolean; data: GlucoseTarget }>(
      `/api/patients/${patientId}/glucose-targets/${targetId}/approve`,
      { reason },
    );
    return res.data.data;
  },

  async rejectTarget(
    patientId: string,
    targetId: string,
    reason?: string,
  ): Promise<GlucoseTarget> {
    const res = await apiClient.post<{ success: boolean; data: GlucoseTarget }>(
      `/api/patients/${patientId}/glucose-targets/${targetId}/reject`,
      { reason },
    );
    return res.data.data;
  },

  async getTargetHistory(patientId: string): Promise<GlucoseTargetAuditLog[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: GlucoseTargetAuditLog[];
    }>(`/api/patients/${patientId}/glucose-targets/history`);
    return res.data.data;
  },
};
