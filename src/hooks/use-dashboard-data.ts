import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient-service';
import { glucoseService } from '@/services/glucose-service';
import { reportService } from '@/services/report-service';
import { targetService } from '@/services/target-service';
import apiClient from '@/lib/api-client';
import {
  PatientProfile,
  GlucoseRecord,
  HealthReportSummary,
  NotificationAlert,
  GlucoseTarget
} from '@/types';

export function useDashboardData() {
  const queryClient = useQueryClient();
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [newAlertNotice, setNewAlertNotice] = useState<NotificationAlert | null>(null);

  const { data: patient, isLoading: isPatientLoading } = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: () => patientService.getPatient(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const { data: glucoseData, isLoading: isGlucoseLoading } = useQuery<{
    records: GlucoseRecord[];
    total: number;
  }>({
    queryKey: ['glucose'],
    queryFn: () => glucoseService.getRecords()
  });

  const { data: reportData, isLoading: isReportLoading } = useQuery<{
    summary: HealthReportSummary;
  }>({
    queryKey: ['reports', 7],
    queryFn: () => reportService.getSummary(7)
  });

  const { data: alertsData, isLoading: isAlertsLoading, refetch: refetchAlerts } = useQuery<NotificationAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: NotificationAlert[] }>('/api/alerts');
      return res.data.data;
    }
  });

  const { data: remindersData, isLoading: isRemindersLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: any }>('/api/reminders');
      return res.data.data;
    }
  });

  const { data: targetsData, isLoading: isTargetsLoading } = useQuery<{
    targets: GlucoseTarget[];
    activeTargets?: Record<string, GlucoseTarget>;
    generalGuidelines?: any[];
  } | GlucoseTarget[]>({
    queryKey: ['targets'],
    queryFn: () => targetService.getTargets(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['glucose'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['patient'] });
    queryClient.invalidateQueries({ queryKey: ['targets'] });
    queryClient.invalidateQueries({ queryKey: ['glucose-targets'] });
  };

  const handleEntrySuccess = (alert?: NotificationAlert) => {
    refreshAll();
    if (alert) {
      setNewAlertNotice(alert);
    }
  };

  const records = glucoseData?.records || [];
  const latestRecord = records[0];

  const targetsList: GlucoseTarget[] = Array.isArray(targetsData)
    ? targetsData
    : targetsData?.targets || [];

  const readingType = latestRecord?.measurementType || 'fasting';

  // 1. Exact match on measurement type & approved & active
  let activeTarget = targetsList.find(
    (t) =>
      t.measurementType === readingType &&
      (t.approvalStatus === 'approved' ||
        t.clinicianApprovalStatus === 'clinician_approved') &&
      t.isActive
  );

  // 2. Pre-meal / Fasting cross-fallback
  if (!activeTarget && (readingType === 'fasting' || readingType === 'before_meal')) {
    activeTarget = targetsList.find(
      (t) =>
        (t.measurementType === 'fasting' || t.measurementType === 'before_meal') &&
        (t.approvalStatus === 'approved' ||
          t.clinicianApprovalStatus === 'clinician_approved') &&
        t.isActive
    );
  }

  // 3. Post-meal cross-fallback
  if (!activeTarget && (readingType === '1h_after_meal' || readingType === '2h_after_meal')) {
    activeTarget = targetsList.find(
      (t) =>
        (t.measurementType === '2h_after_meal' || t.measurementType === '1h_after_meal') &&
        (t.approvalStatus === 'approved' ||
          t.clinicianApprovalStatus === 'clinician_approved') &&
        t.isActive
    );
  }

  // 4. Any approved active target fallback
  if (!activeTarget) {
    activeTarget = targetsList.find(
      (t) =>
        (t.approvalStatus === 'approved' ||
          t.clinicianApprovalStatus === 'clinician_approved') &&
        t.isActive
    );
  }

  // Determine if core dashboard data is loading during initial fetch
  const isLoading =
    (isPatientLoading && !patient) ||
    (isGlucoseLoading && !glucoseData) ||
    (isTargetsLoading && !targetsData);

  return {
    patient,
    records,
    latestRecord,
    activeTarget,
    reportData,
    alertsData,
    remindersData,
    isEntryOpen,
    setIsEntryOpen,
    newAlertNotice,
    setNewAlertNotice,
    refreshAll,
    handleEntrySuccess,
    refetchAlerts,
    isLoading,
    isPatientLoading,
    isGlucoseLoading,
    isReportLoading,
    isAlertsLoading,
    isRemindersLoading,
    isTargetsLoading
  };
}
