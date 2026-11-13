'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { PatientHeaderCard } from '@/components/dashboard/PatientHeaderCard';
import { LatestGlucoseCard } from '@/components/dashboard/LatestGlucoseCard';
import { SummaryMetricsCards } from '@/components/dashboard/SummaryMetricsCards';
import { GlucoseTrendChart } from '@/components/dashboard/GlucoseTrendChart';
import { RecentAlertsWidget } from '@/components/dashboard/RecentAlertsWidget';
import { UpcomingRemindersWidget } from '@/components/dashboard/UpcomingRemindersWidget';
import { GlucoseEntryModal } from '@/components/glucose/GlucoseEntryModal';
import { PatientProfile, GlucoseRecord, HealthReportSummary, NotificationAlert } from '@/types';
import { Sparkles, Utensils, HeartHandshake, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [newAlertNotice, setNewAlertNotice] = useState<NotificationAlert | null>(null);

  // Queries
  const { data: patient, refetch: refetchPatient } = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await axios.get('/api/patient');
      return res.data.data;
    }
  });

  const { data: glucoseData, refetch: refetchGlucose } = useQuery<{ records: GlucoseRecord[]; total: number }>({
    queryKey: ['glucose'],
    queryFn: async () => {
      const res = await axios.get('/api/glucose');
      return res.data.data;
    }
  });

  const { data: reportData, refetch: refetchReport } = useQuery<{ summary: HealthReportSummary }>({
    queryKey: ['reports', 7],
    queryFn: async () => {
      const res = await axios.get('/api/reports?days=7');
      return res.data.data;
    }
  });

  const { data: alertsData, refetch: refetchAlerts } = useQuery<NotificationAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await axios.get('/api/alerts');
      return res.data.data;
    }
  });

  const { data: remindersData, refetch: refetchReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const res = await axios.get('/api/reminders');
      return res.data.data;
    }
  });

  const refreshAll = () => {
    refetchGlucose();
    refetchReport();
    refetchAlerts();
    refetchPatient();
  };

  const handleEntrySuccess = (alert?: NotificationAlert) => {
    refreshAll();
    if (alert) {
      setNewAlertNotice(alert);
    }
  };

  const records = glucoseData?.records || [];
  const latestRecord = records[0];

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      {patient && <PatientHeaderCard patient={patient} />}

      {/* New Alert Notification Toast if generated */}
      {newAlertNotice && (
        <div className="p-4 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-start justify-between gap-3 text-amber-950 animate-fade-in shadow-md">
          <div>
            <h4 className="font-bold text-sm sm:text-base">
              {newAlertNotice.titleKm || newAlertNotice.title}
            </h4>
            <p className="text-xs sm:text-sm mt-1">
              {newAlertNotice.messageKm || newAlertNotice.message}
            </p>
            {newAlertNotice.guidanceSummary && (
              <p className="text-xs mt-1.5 font-semibold text-teal-900 bg-white/60 p-2 rounded-lg">
                💡 {newAlertNotice.guidanceSummary}
              </p>
            )}
          </div>
          <button
            onClick={() => setNewAlertNotice(null)}
            className="text-amber-800 font-bold text-xs p-1 hover:bg-amber-200 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Latest Glucose Reading Card */}
      <LatestGlucoseCard
        record={latestRecord}
        onRecordClick={() => setIsEntryOpen(true)}
      />

      {/* Summary Metrics Cards */}
      {reportData?.summary && (
        <SummaryMetricsCards
          summary={reportData.summary}
          todayCount={records.length > 0 ? 1 : 0}
        />
      )}

      {/* Glucose Trend Chart */}
      <GlucoseTrendChart records={records} />

      {/* Quick Action Navigation Cards for Seniors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/lifestyle"
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                មគ្គុទ្ទេសក៍អាហារូបត្ថម្ភខ្មែរ
              </h4>
              <p className="text-xs text-slate-600">
                Cambodian Food Guide &amp; Portion Balance
              </p>
            </div>
          </div>
          <span className="text-teal-700 font-bold text-sm group-hover:translate-x-1 transition">
            →
          </span>
        </Link>

        <Link
          href="/medications"
          className="p-5 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-emerald-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                កាលវិភាគថ្នាំលេបប្រចាំថ្ងៃ
              </h4>
              <p className="text-xs text-slate-600">
                Daily Oral Medications &amp; Adherence Log
              </p>
            </div>
          </div>
          <span className="text-emerald-700 font-bold text-sm group-hover:translate-x-1 transition">
            →
          </span>
        </Link>
      </div>

      {/* Additional Widgets: Alerts & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAlertsWidget
          alerts={alertsData || []}
          onAlertAcknowledged={refetchAlerts}
        />
        <UpcomingRemindersWidget reminders={remindersData || []} />
      </div>

      {/* Glucose Entry Modal */}
      <GlucoseEntryModal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        onSuccess={handleEntrySuccess}
      />
    </div>
  );
}

