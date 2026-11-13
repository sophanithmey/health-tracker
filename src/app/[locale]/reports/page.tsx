'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { ReportSummaryView } from '@/components/reports/ReportSummaryView';
import { HealthReportSummary, PatientProfile, GlucoseRecord, GlucoseTarget } from '@/types';

export default function ReportsPage() {
  const [period, setPeriod] = useState<7 | 30>(7);

  const { data: reportData } = useQuery<{
    summary: HealthReportSummary;
    patient: PatientProfile;
    targets: GlucoseTarget[];
  }>({
    queryKey: ['reports', period],
    queryFn: async () => {
      const res = await axios.get(`/api/reports?days=${period}`);
      return res.data.data;
    }
  });

  const { data: glucoseData } = useQuery<{ records: GlucoseRecord[]; total: number }>({
    queryKey: ['glucose'],
    queryFn: async () => {
      const res = await axios.get('/api/glucose');
      return res.data.data;
    }
  });

  if (!reportData?.summary || !reportData?.patient) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
        Loading health report...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportSummaryView
        summary={reportData.summary}
        patient={reportData.patient}
        records={glucoseData?.records || []}
        targets={reportData.targets || []}
        onPeriodChange={(days) => setPeriod(days)}
      />
    </div>
  );
}

