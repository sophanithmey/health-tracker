'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { MedicationList } from '@/components/medications/MedicationList';
import { Medication, MedicationLog } from '@/types';
import { Pill } from 'lucide-react';

export default function MedicationsPage() {
  const t = useTranslations('medications');

  const { data: medications, refetch: refetchMeds } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await axios.get('/api/medications');
      return res.data.data;
    }
  });

  const { data: logs, refetch: refetchLogs } = useQuery<MedicationLog[]>({
    queryKey: ['medication-logs'],
    queryFn: async () => {
      const res = await axios.get('/api/medications/logs');
      return res.data.data;
    }
  });

  const refresh = () => {
    refetchMeds();
    refetchLogs();
  };

  return (
    <div className="space-y-6">
      <MedicationList
        medications={medications || []}
        logs={logs || []}
        onRefresh={refresh}
      />
    </div>
  );
}

