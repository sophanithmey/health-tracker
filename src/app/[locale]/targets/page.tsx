'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { TargetConfigCard } from '@/components/targets/TargetConfigCard';
import { GlucoseTarget, GeneralGuidelineReference } from '@/types';
import { Target } from 'lucide-react';

export default function TargetsPage() {
  const t = useTranslations('targets');

  const { data, refetch } = useQuery<{
    data: GlucoseTarget[];
    generalGuidelines: GeneralGuidelineReference[];
  }>({
    queryKey: ['glucose-targets'],
    queryFn: async () => {
      const res = await axios.get(
        '/api/patients/a1b2c3d4-e5f6-7890-abcd-ef1234567890/glucose-targets'
      );
      return res.data;
    }
  });

  const targets = data?.data || [];
  const guidelines = data?.generalGuidelines || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h2>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      <TargetConfigCard
        targets={targets}
        generalGuidelines={guidelines}
        patientId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        onRefresh={refetch}
      />
    </div>
  );
}

