'use client';

import dynamic from 'next/dynamic';
import { PatientHeaderCard } from '@/components/dashboard/PatientHeaderCard';
import { LatestGlucoseCard } from '@/components/dashboard/LatestGlucoseCard';
import { SummaryMetricsCards } from '@/components/dashboard/SummaryMetricsCards';
import { DailyWellnessRoutineCard } from '@/components/dashboard/DailyWellnessRoutineCard';
import { RecentAlertsWidget } from '@/components/dashboard/RecentAlertsWidget';
import { UpcomingRemindersWidget } from '@/components/dashboard/UpcomingRemindersWidget';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Pill, Utensils, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDashboardData } from '@/hooks/use-dashboard-data';

// Dynamically import heavy Recharts component and modal (Rules bundle-dynamic-imports & bundle-preload)
const GlucoseTrendChart = dynamic(
  () => import('@/components/dashboard/GlucoseTrendChart').then((m) => m.GlucoseTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs h-[380px] animate-pulse flex flex-col justify-between">
        <div className="h-6 w-48 bg-slate-100 rounded-lg" />
        <div className="h-56 w-full bg-slate-50 rounded-2xl" />
        <div className="h-4 w-32 bg-slate-100 rounded-lg" />
      </div>
    )
  }
);

const GlucoseEntryModal = dynamic(
  () => import('@/components/glucose/GlucoseEntryModal').then((m) => m.GlucoseEntryModal),
  { ssr: false }
);

export default function DashboardPage() {
  const {
    patient,
    records,
    latestRecord,
    activeTarget,
    reportData,
    alertsData,
    remindersData,
    isEntryOpen,
    setIsEntryOpen,
    newAlertNotice,
    setNewAlertNotice,
    handleEntrySuccess,
    refetchAlerts,
    isLoading
  } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Patient Header Hero */}
      {patient ? (
        <PatientHeaderCard
          patient={patient}
          onRecordClick={() => setIsEntryOpen(true)}
        />
      ) : null}

      {/* New Alert Notification Toast if generated */}
      {newAlertNotice ? (
        <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-3xl flex items-start justify-between gap-4 text-amber-950 shadow-md">
          <div>
            <h4 className="font-black text-base sm:text-lg">
              {newAlertNotice.titleKm || newAlertNotice.title}
            </h4>
            <p className="text-xs sm:text-sm mt-1 text-slate-800">
              {newAlertNotice.messageKm || newAlertNotice.message}
            </p>
            {newAlertNotice.guidanceSummary ? (
              <p className="text-xs mt-2 font-bold text-teal-950 bg-white/80 p-3 rounded-2xl border border-teal-200">
                💡 {newAlertNotice.guidanceSummary}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => setNewAlertNotice(null)}
            className="text-amber-800 font-black text-sm p-2 hover:bg-amber-200 rounded-xl"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* 2. Latest Blood Sugar Reading Card */}
      <LatestGlucoseCard
        record={latestRecord}
        target={activeTarget}
        onRecordClick={() => setIsEntryOpen(true)}
      />

      {/* 3. Summary Metrics Cards (Separate Fasting & Post-Meal Averages) */}
      {reportData?.summary ? (
        <SummaryMetricsCards
          summary={reportData.summary}
          todayCount={records.length > 0 ? 1 : 0}
        />
      ) : null}

      {/* 4. Daily Wellness & Lifestyle Routine (Exercise, Water, Smart Diabetic Meal) */}
      <DailyWellnessRoutineCard />

      {/* 5. Glucose Trend Chart */}
      <GlucoseTrendChart records={records} target={activeTarget} />

      {/* 5. Quick Health Action Spotlight Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/lifestyle"
          className="p-6 rounded-3xl bg-linear-to-br from-emerald-50/80 via-white to-teal-50/50 border border-teal-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg">
                មគ្គុទ្ទេសក៍អាហារូបត្ថម្ភខ្មែរ
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Cambodian Food Guide, Portion Pacing &amp; Carb Awareness
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-teal-700 font-bold group-hover:translate-x-1 transition shadow-2xs">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/medications"
          className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 border border-emerald-200/90 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg">
                កាលវិភាគថ្នាំលេបប្រចាំថ្ងៃ
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {patient?.currentMedicationsSummary || 'Oral Medications'} &amp; Adherence Log
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold group-hover:translate-x-1 transition shadow-2xs">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* 6. Lower Row: Recent Alerts & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlertsWidget
          alerts={alertsData || []}
          onAlertAcknowledged={refetchAlerts}
        />
        <UpcomingRemindersWidget reminders={remindersData || []} />
      </div>

      {/* Entry Modal */}
      <GlucoseEntryModal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        onSuccess={handleEntrySuccess}
      />
    </div>
  );
}
