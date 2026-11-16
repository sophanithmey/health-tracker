import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ReferenceLine
} from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { MonthGroup, MeasurementPoint } from '@/hooks/use-glucose-trend-data';
import { GlucoseTarget } from '@/types';

interface GlucoseMonthlyViewProps {
  monthGroups: MonthGroup[];
  activeMeasurements: MeasurementPoint[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  locale: string;
  target?: GlucoseTarget;
}

export function GlucoseMonthlyView({
  monthGroups,
  activeMeasurements,
  selectedMonth,
  onSelectMonth,
  locale,
  target
}: GlucoseMonthlyViewProps) {
  if (monthGroups.length === 0 || activeMeasurements.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        {locale === 'km'
          ? 'មិនទាន់មានទិន្នន័យវាស់ជាតិស្ករនៅឡើយទេ'
          : 'No blood sugar readings recorded yet.'}
      </div>
    );
  }

  const targetMin = target?.minValue ?? target?.targetMin ?? 80;
  const targetMax = target?.maxValue ?? target?.targetMax ?? 130;

  return (
    <div className="space-y-6">
      {/* Month Selection Cards: Shows measurements by day of that month (No averaging) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {monthGroups.slice(-3).map((m) => {
          const isSelected = selectedMonth === m.monthKey;
          return (
            <div
              key={m.monthKey}
              onClick={() => onSelectMonth(isSelected ? 'all' : m.monthKey)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-50/90 via-white to-teal-50/50 border-teal-500 ring-2 ring-teal-500/25 shadow-xs'
                  : m.isCurrent
                  ? 'bg-gradient-to-br from-teal-50/40 via-white to-white border-teal-200/90 hover:border-teal-400 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                  {m.monthLabel}
                </span>
                <div className="flex items-center space-x-1.5">
                  {m.isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-700 text-white shadow-2xs">
                      {locale === 'km' ? 'បច្ចុប្បន្ន' : 'Current'}
                    </span>
                  ) : null}
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700">
                    {m.measurements.length} {locale === 'km' ? 'លើក' : m.measurements.length === 1 ? 'reading' : 'readings'}
                  </span>
                </div>
              </div>

              {/* Individual Daily Measurements - No Merged Average */}
              <div className="space-y-1.5 mt-2.5">
                {m.measurements.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white/95 border border-slate-200/70 shadow-2xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{r.dayLabel}</span>
                      <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {r.typeLabel}
                      </span>
                    </div>
                    <span className="font-black text-slate-900 text-sm">
                      {r.valueMgDl}{' '}
                      <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Filter Indicator & Reset */}
      {selectedMonth !== 'all' ? (
        <div className="flex items-center justify-between px-3 py-2 bg-teal-50/70 rounded-xl border border-teal-200/80 text-xs font-semibold text-teal-900">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {locale === 'km'
                ? `បង្ហាញទិន្នន័យសម្រាប់ខែ៖ ${monthGroups.find((g) => g.monthKey === selectedMonth)?.monthLabel || selectedMonth}`
                : `Showing daily measurements for: ${monthGroups.find((g) => g.monthKey === selectedMonth)?.monthLabel || selectedMonth}`}
            </span>
          </div>
          <button
            onClick={() => onSelectMonth('all')}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline px-2 py-0.5 bg-white rounded-lg border border-teal-200"
          >
            {locale === 'km' ? 'បង្ហាញគ្រប់ខែទាំងអស់' : 'Show All Months'}
          </button>
        </div>
      ) : null}

      {/* Bar Chart: Display every measurement by day of that month */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeMeasurements} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 'dataMax + 35']} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as MeasurementPoint;
                return (
                  <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-slate-200/90 text-xs">
                    <p className="font-bold text-slate-800 mb-1">{point.dayLabel} ({point.timeStr})</p>
                    <p className="text-slate-500 capitalize">{point.typeLabel}</p>
                    <p className="text-base font-black text-slate-900 mt-1">{point.valueMgDl} mg/dL</p>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }} />
            {targetMax ? (
              <ReferenceLine y={targetMax} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Max (${targetMax})`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
            ) : null}
            {targetMin ? (
              <ReferenceLine y={targetMin} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Min (${targetMin})`, fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} />
            ) : null}
            <Bar dataKey="fasting" name={locale === 'km' ? 'ពេលព្រឹក/មុនបាយ' : 'Fasting / Pre-meal'} fill="#d97706" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="fasting" position="top" fill="#78350f" fontSize={11} fontWeight={800} />
            </Bar>
            <Bar dataKey="postMeal" name={locale === 'km' ? 'ក្រោយបាយ' : 'Post-meal'} fill="#0f766e" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="postMeal" position="top" fill="#115e59" fontSize={11} fontWeight={800} />
            </Bar>
            <Bar dataKey="bedtime" name={locale === 'km' ? 'មុនចូលគេង' : 'Bedtime'} fill="#6366f1" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="bedtime" position="top" fill="#4338ca" fontSize={11} fontWeight={800} />
            </Bar>
            <Bar dataKey="other" name={locale === 'km' ? 'ផ្សេងទៀត' : 'Other'} fill="#64748b" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="other" position="top" fill="#334155" fontSize={11} fontWeight={800} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
