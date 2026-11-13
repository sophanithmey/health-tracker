'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { ActivityLog, ActivityType, ActivityIntensity } from '@/types';
import { Footprints, Dumbbell, Clock, Plus, Flame } from 'lucide-react';

interface ActivityLogSectionProps {
  activities: ActivityLog[];
  onRefresh: () => void;
}

export function ActivityLogSection({ activities, onRefresh }: ActivityLogSectionProps) {
  const t = useTranslations('lifestyle');
  const tCommon = useTranslations('common');

  const [isAdding, setIsAdding] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('walking');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [intensity, setIntensity] = useState<ActivityIntensity>('light');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/lifestyle/activities', {
        activityType,
        durationMinutes: Number(durationMinutes),
        intensity,
        loggedAt: new Date().toISOString(),
        notes: notes.trim() || undefined
      });
      setIsAdding(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('activityTab')}</h3>
            <p className="text-xs text-slate-500">Regular light exercise helps enhance insulin sensitivity</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition touch-target"
        >
          {isAdding ? tCommon('close') : `+ ${t('logActivity')}`}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'walking', label: t('walking') },
              { id: 'light_stretching', label: t('stretching') },
              { id: 'gardening', label: t('gardening') },
              { id: 'other', label: 'Other' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivityType(item.id as ActivityType)}
                className={`p-2.5 rounded-xl font-bold transition text-center ${
                  activityType === item.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 font-semibold"
              >
                <option value="light">Light (Comfortable pace)</option>
                <option value="moderate">Moderate (Brisk walk)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Garden stroll with neighbor, felt energized"
              className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow"
          >
            {isSubmitting ? tCommon('loading') : tCommon('save')}
          </button>
        </form>
      )}

      {/* Activity Logs List */}
      <div className="divide-y divide-slate-100">
        {activities.map((act) => (
          <div key={act.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <span className="font-bold text-slate-800 capitalize">
                  {act.activityType.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-500 text-xs block">
                  {act.notes || 'Routine physical activity'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-black rounded-lg text-xs">
                {act.durationMinutes} {t('minutesUnit')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

