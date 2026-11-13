'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { TargetConfigCard } from '@/components/targets/TargetConfigCard';
import { GlucoseTarget } from '@/types';
import { Target } from 'lucide-react';

export default function TargetsPage() {
  const t = useTranslations('targets');

  const { data: targets, refetch } = useQuery<GlucoseTarget[]>({
    queryKey: ['targets'],
    queryFn: async () => {
      const res = await axios.get('/api/targets');
      return res.data.data;
    }
  });

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

      <TargetConfigCard targets={targets || []} onRefresh={refetch} />
    </div>
  );
}

