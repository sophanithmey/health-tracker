'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { GlucoseRecord } from '@/types';
import { TrendingUp, Calendar } from 'lucide-react';

interface GlucoseTrendChartProps {
  records: GlucoseRecord[];
}

export function GlucoseTrendChart({ records }: GlucoseTrendChartProps) {
  const t = useTranslations('dashboard');
  const [daysRange, setDaysRange] = useState<7 | 30>(7);

  const chartData = React.useMemo(() => {
    const cutoffMs = Date.now() - daysRange * 86400000;
    const cutoff = new Date(cutoffMs).toISOString();
    const filtered = records
      .filter((r) => r.measuredAt >= cutoff)
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());

    const groupedData: Record<string, { date: string; fasting?: number; postMeal?: number }> = {};

    filtered.forEach((r) => {
      const d = new Date(r.measuredAt);
      const dateStr = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        day: 'numeric'
      });

      if (!groupedData[dateStr]) {
        groupedData[dateStr] = { date: dateStr };
      }

      if (r.measurementType === 'fasting' || r.measurementType === 'before_meal') {
        groupedData[dateStr].fasting = r.valueMgDl;
      } else if (r.measurementType === '1h_after_meal' || r.measurementType === '2h_after_meal') {
        groupedData[dateStr].postMeal = r.valueMgDl;
      }
    });

    return Object.values(groupedData);
  }, [records, daysRange]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t('chartTitle')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fasting &amp; post-meal readings tracked as separate clinical trajectories (Asia/Phnom_Penh)
          </p>
        </div>

        {/* Range switcher pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200/80">
          <button
            onClick={() => setDaysRange(7)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition ${
              daysRange === 7
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('chartDays7')}
          </button>
          <button
            onClick={() => setDaysRange(30)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition ${
              daysRange === 30
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('chartDays30')}
          </button>
        </div>
      </div>

      <div className="h-80 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[60, 220]}
                unit=" "
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  padding: '10px 14px'
                }}
              />
              <Legend
                verticalAlign="top"
                height={40}
                formatter={(value) => (
                  <span className="text-xs font-bold text-slate-700 ml-1">{value}</span>
                )}
              />

              {/* High target limit */}
              <ReferenceLine
                y={130}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Fasting Target Max (130)',
                  fill: '#d97706',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />
              {/* Low alert threshold */}
              <ReferenceLine
                y={70}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'Low Alert (70)',
                  fill: '#dc2626',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />

              {/* Fasting Series */}
              <Line
                type="monotone"
                dataKey="fasting"
                name={t('fastingLine')}
                stroke="#d97706"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8 }}
                connectNulls
              />

              {/* Post-Meal Series */}
              <Line
                type="monotone"
                dataKey="postMeal"
                name={t('postMealLine')}
                stroke="#0d9488"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            {t('noReadings')}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-medium text-slate-500">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Fasting Reference: 80–130 mg/dL</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Post-meal Reference: &lt; 180 mg/dL</span>
        </span>
      </div>
    </div>
  );
}
