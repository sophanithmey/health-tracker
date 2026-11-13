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
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t('chartTitle')}</h3>
          <p className="text-xs text-slate-500">
            Fasting vs Post-meal readings tracked separately (Asia/Phnom_Penh)
          </p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setDaysRange(7)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              daysRange === 7
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('chartDays7')}
          </button>
          <button
            onClick={() => setDaysRange(30)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              daysRange === 30
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('chartDays30')}
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
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
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-bold text-slate-700">{value}</span>
                )}
              />

              {/* Safe Target Thresholds */}
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

              {/* Fasting Line */}
              <Line
                type="monotone"
                dataKey="fasting"
                name={t('fastingLine')}
                stroke="#d97706"
                strokeWidth={3}
                dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
                connectNulls
              />

              {/* Post-Meal Line */}
              <Line
                type="monotone"
                dataKey="postMeal"
                name={t('postMealLine')}
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
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

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span>Fasting target: 80–130 mg/dL (Educational reference)</span>
        <span>Post-meal target: &lt; 180 mg/dL (1-2 hours)</span>
      </div>
    </div>
  );
}
