'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { SettingsView } from '@/components/settings/SettingsView';
import { PatientProfile } from '@/types';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('settings');

  const { data: patient, refetch } = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await axios.get('/api/patient');
      return res.data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h2>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      <SettingsView patient={patient} onRefresh={refetch} />
    </div>
  );
}

