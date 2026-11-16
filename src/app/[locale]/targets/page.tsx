'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { targetService, TargetsResponse } from '@/services/target-service';
import { TargetConfigCard } from '@/components/targets/TargetConfigCard';
import { Target } from 'lucide-react';

const PATIENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export default function TargetsPage() {
  const t = useTranslations('targets');

  const { data, refetch } = useQuery<TargetsResponse>({
    queryKey: ['targets'],
    queryFn: () => targetService.getTargets(PATIENT_ID),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const targets = data?.targets || [];
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
        patientId={PATIENT_ID}
        onRefresh={refetch}
      />
    </div>
  );
}

