'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ReminderItem } from '@/types';
import { Clock, Calendar, Droplet, Pill, Hospital, CheckCircle2 } from 'lucide-react';

interface UpcomingRemindersWidgetProps {
  reminders: ReminderItem[];
}

export function UpcomingRemindersWidget({ reminders }: UpcomingRemindersWidgetProps) {
  const t = useTranslations('dashboard');

  const getIcon = (type: ReminderItem['reminderType']) => {
    switch (type) {
      case 'glucose':
        return <Droplet className="w-4 h-4 text-teal-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'hba1c_test':
      case 'doctor_visit':
        return <Hospital className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t('upcomingReminders')}</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Asia/Phnom_Penh</span>
      </div>

      <div className="space-y-2.5">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                {getIcon(rem.reminderType)}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {rem.titleKm || rem.title}
                </h4>
                <p className="text-[11px] text-slate-500">{rem.notes}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-900 font-black rounded-lg text-xs">
                {rem.timeOfDay}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

