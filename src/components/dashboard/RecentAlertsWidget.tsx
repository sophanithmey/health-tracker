'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { NotificationAlert } from '@/types';
import { AlertTriangle, Check, ShieldAlert, Clock, Bell } from 'lucide-react';

interface RecentAlertsWidgetProps {
  alerts: NotificationAlert[];
  onAlertAcknowledged?: () => void;
}

export function RecentAlertsWidget({ alerts, onAlertAcknowledged }: RecentAlertsWidgetProps) {
  const t = useTranslations('dashboard');
  const tAlerts = useTranslations('alerts');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAck = async (id: string) => {
    setLoadingId(id);
    try {
      await axios.post(`/api/alerts/${id}/ack`);
      onAlertAcknowledged?.();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t('recentAlerts')}</h3>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
          {alerts.length} total
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No current attention alerts. All readings stable.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => {
            const isCritical = alert.category === 'critical';
            const isAck = Boolean(alert.acknowledgedAt);

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isCritical
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight">
                        {alert.titleKm || alert.title}
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                        {alert.messageKm || alert.message}
                      </p>
                      {alert.guidanceSummary && (
                        <p className="text-[11px] text-teal-900 bg-white/70 p-1.5 rounded-lg mt-1.5 border border-slate-200/50">
                          <strong>Guidance:</strong> {alert.guidanceSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isAck ? (
                    <button
                      onClick={() => handleAck(alert.id)}
                      disabled={loadingId === alert.id}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-[11px] transition shadow-xs flex-shrink-0"
                    >
                      {tAlerts('acknowledge')}
                    </button>
                  ) : (
                    <span className="flex items-center text-[11px] text-emerald-700 font-semibold flex-shrink-0">
                      <Check className="w-3.5 h-3.5 mr-0.5" />
                      {tAlerts('acknowledged')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

