'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { GlucoseHistoryTable } from '@/components/glucose/GlucoseHistoryTable';
import { GlucoseEntryModal } from '@/components/glucose/GlucoseEntryModal';
import { GlucoseRecord, NotificationAlert } from '@/types';
import { Droplet, Plus } from 'lucide-react';

export default function BloodSugarPage() {
  const t = useTranslations('bloodSugar');
  const queryClient = useQueryClient();
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [newAlertNotice, setNewAlertNotice] = useState<NotificationAlert | null>(null);

  const { data: glucoseData, refetch } = useQuery<{ records: GlucoseRecord[]; total: number }>({
    queryKey: ['glucose'],
    queryFn: async () => {
      const res = await axios.get('/api/glucose');
      return res.data.data;
    }
  });

  const records = glucoseData?.records || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h2>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEntryOpen(true)}
          className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center space-x-2 touch-target"
        >
          <Plus className="w-5 h-5" />
          <span>{t('formTitle')}</span>
        </button>
      </div>

      {newAlertNotice && (
        <div className="p-4 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-start justify-between gap-3 text-amber-950 animate-fade-in shadow-md">
          <div>
            <h4 className="font-bold text-sm sm:text-base">
              {newAlertNotice.titleKm || newAlertNotice.title}
            </h4>
            <p className="text-xs sm:text-sm mt-1">
              {newAlertNotice.messageKm || newAlertNotice.message}
            </p>
          </div>
          <button
            onClick={() => setNewAlertNotice(null)}
            className="text-amber-800 font-bold text-xs p-1 hover:bg-amber-200 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* History Table */}
      <GlucoseHistoryTable records={records} onRefresh={refetch} />

      {/* Entry Modal */}
      <GlucoseEntryModal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        onSuccess={(alert) => {
          queryClient.invalidateQueries({ queryKey: ['glucose'] });
          refetch();
          if (alert) setNewAlertNotice(alert);
        }}
      />
    </div>
  );
}

