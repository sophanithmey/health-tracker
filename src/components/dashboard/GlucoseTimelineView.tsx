import React from 'react';
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
import { GlucoseTarget } from '@/types';
import { MeasurementPoint } from '@/hooks/use-glucose-trend-data';

interface GlucoseTimelineViewProps {
  data: MeasurementPoint[];
  target?: GlucoseTarget;
}

export function GlucoseTimelineView({ data, target }: GlucoseTimelineViewProps) {
  const isTargetApproved = Boolean(
    target &&
      (target.approvalStatus === 'approved' ||
        target.clinicianApprovalStatus === 'clinician_approved')
  );

  const targetMin = target?.minValue ?? target?.targetMin ?? 80;
  const targetMax = target?.maxValue ?? target?.targetMax ?? 130;

  return (
    <div className="w-full">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[50, 'dataMax + 40']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-slate-200/90 text-xs">
                    <p className="font-bold text-slate-800 mb-1.5">{label}</p>
                    {payload.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 py-0.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-500 font-medium">{item.name}:</span>
                        <span className="font-black text-slate-900">{item.value} mg/dL</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontWeight: 600 }}
            />

            {isTargetApproved ? (
              <>
                <ReferenceLine
                  y={targetMin}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: `Target Min (${targetMin})`, fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  y={targetMax}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: `Target Max (${targetMax})`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
                />
              </>
            ) : null}

            <ReferenceLine
              y={70}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: 'Low Alert (70)', fill: '#ef4444', fontSize: 9, position: 'insideBottomLeft' }}
            />

            <Line
              type="monotone"
              dataKey="fasting"
              name="Fasting / Pre-meal"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="postMeal"
              name="Post-meal"
              stroke="#0f766e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="bedtime"
              name="Bedtime"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Fasting Reference: 80–130 mg/dL</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
          <span>Post-meal Reference: &lt; 180 mg/dL</span>
        </div>
      </div>
    </div>
  );
}
