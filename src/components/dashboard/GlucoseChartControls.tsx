import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LineChart as LineChartIcon, BarChart3, Calendar } from 'lucide-react';
import { RangeOption, MonthGroup } from '@/hooks/use-glucose-trend-data';

interface GlucoseChartControlsProps {
  viewMode: 'monthly' | 'trend';
  setViewMode: (mode: 'monthly' | 'trend') => void;
  daysRange: RangeOption;
  setDaysRange: (range: RangeOption) => void;
  selectedMonth?: string;
  setSelectedMonth?: (month: string) => void;
  monthGroups?: MonthGroup[];
}

export function GlucoseChartControls({
  viewMode,
  setViewMode,
  daysRange,
  setDaysRange,
  selectedMonth = 'all',
  setSelectedMonth,
  monthGroups = []
}: GlucoseChartControlsProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* View Mode Switcher */}
      <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setViewMode('monthly')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition ${
            viewMode === 'monthly'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{locale === 'km' ? 'តាមខែ & ថ្ងៃ' : 'By Month & Day'}</span>
        </button>
        <button
          onClick={() => setViewMode('trend')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition ${
            viewMode === 'trend'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LineChartIcon className="w-3.5 h-3.5" />
          <span>{locale === 'km' ? 'បន្ទាត់និន្នាការ' : 'Timeline Curve'}</span>
        </button>
      </div>

      {/* Month Dropdown / Filter (In monthly mode) */}
      {viewMode === 'monthly' && setSelectedMonth && monthGroups.length > 0 ? (
        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-teal-700" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="all">
              {locale === 'km' ? 'គ្រប់ខែទាំងអស់ (All Months)' : 'All Months (All Readings)'}
            </option>
            {monthGroups.map((m) => (
              <option key={m.monthKey} value={m.monthKey}>
                {m.monthLabel} ({m.measurements.length} {locale === 'km' ? 'លើក' : 'readings'})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Days Range Selector (Only in timeline mode) */}
      {viewMode === 'trend' ? (
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-xs font-medium">
          {([7, 30, 90, 0] as RangeOption[]).map((days) => (
            <button
              key={days}
              onClick={() => setDaysRange(days)}
              className={`px-2.5 py-1 rounded-lg transition ${
                daysRange === days
                  ? 'bg-white text-teal-800 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {days === 0 ? (locale === 'km' ? 'ទាំងអស់' : 'All') : `${days}d`}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
