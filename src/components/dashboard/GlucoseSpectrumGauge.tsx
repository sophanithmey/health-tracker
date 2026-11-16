import React from 'react';

interface GlucoseSpectrumGaugeProps {
  valueMgDl: number;
  targetMin: number;
  targetMax: number;
  isTargetApproved: boolean;
  isCritical: boolean;
  isHigh: boolean;
  isLow: boolean;
}

export function GlucoseSpectrumGauge({
  valueMgDl,
  targetMin,
  targetMax,
  isTargetApproved,
  isCritical,
  isHigh,
  isLow
}: GlucoseSpectrumGaugeProps) {
  // Percentage progress across a scale of 60 to 220 mg/dL for visual gauge
  const progressPercent = Math.min(
    100,
    Math.max(0, ((valueMgDl - 60) / (220 - 60)) * 100)
  );

  return (
    <div className="mt-5 max-w-lg bg-white/90 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
        <span className="text-slate-400">Low (&lt; 70)</span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            isTargetApproved
              ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
              : 'text-slate-600 bg-slate-100 border-slate-300'
          }`}
        >
          {isTargetApproved
            ? `Target (${targetMin}–${targetMax} mg/dL)`
            : `General Ref (${targetMin}–${targetMax} mg/dL)`}
        </span>
        <span className="text-slate-400">High (&ge; 180)</span>
      </div>

      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        {/* Target zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-400"
          style={{
            left: `${((targetMin - 60) / 160) * 100}%`,
            width: `${((targetMax - targetMin) / 160) * 100}%`
          }}
        />
        {/* Elevated zone */}
        <div
          className="absolute top-0 bottom-0 bg-amber-300"
          style={{
            left: `${((targetMax - 60) / 160) * 100}%`,
            width: `${((180 - targetMax) / 160) * 100}%`
          }}
        />
        {/* High zone */}
        <div
          className="absolute right-0 top-0 bottom-0 bg-rose-300"
          style={{
            left: `${((180 - 60) / 160) * 100}%`,
            right: 0
          }}
        />
      </div>

      {/* Scale Marker Pointer */}
      <div className="relative w-full h-5 mt-1.5">
        <div
          className="absolute -top-1 flex flex-col items-center -translate-x-1/2 transition-all"
          style={{ left: `${progressPercent}%` }}
        >
          <div
            className={`w-2.5 h-2.5 rotate-45 shadow-xs ${
              isCritical ? 'bg-red-600' : isHigh ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          />
          <span
            className={`text-[10px] font-black whitespace-nowrap mt-0.5 ${
              isCritical
                ? 'text-red-700'
                : isHigh
                ? 'text-amber-800'
                : 'text-emerald-800'
            }`}
          >
            {valueMgDl} mg/dL
          </span>
        </div>
      </div>

      {/* Target Explanation Box */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
        {isHigh ? (
          <p>
            <strong className="text-amber-900 font-bold">Observation:</strong> This reading is above the configured target (+{Number((valueMgDl - targetMax).toFixed(1))} mg/dL). Record the result and monitor the trend. Follow the care plan provided by the healthcare professional.
          </p>
        ) : isLow ? (
          <p>
            <strong className="text-amber-900 font-bold">Observation:</strong> This reading is below the configured target (-{Number((targetMin - valueMgDl).toFixed(1))} mg/dL). Rest, stay hydrated, and monitor the next reading.
          </p>
        ) : !isTargetApproved ? (
          <p>
            <strong className="text-slate-700 font-bold">Reference:</strong> General reference range shown ({targetMin}–{targetMax} mg/dL). Personalized targets should be confirmed by a healthcare professional.
          </p>
        ) : (
          <p>
            <strong className="text-emerald-900 font-bold">Status:</strong> Reading is within Mom&apos;s approved personalized target ({targetMin}–{targetMax} mg/dL).
          </p>
        )}
      </div>
    </div>
  );
}
