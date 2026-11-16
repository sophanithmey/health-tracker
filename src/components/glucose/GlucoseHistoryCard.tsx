import React from 'react';
import { GlucoseRecord } from '@/types';
import { Trash2, AlertTriangle, CheckCircle2, ShieldAlert, Clock, User } from 'lucide-react';

interface GlucoseHistoryCardProps {
  record: GlucoseRecord;
  canDelete: boolean;
  onDeleteClick: (id: string) => void;
}

export function GlucoseHistoryCard({ record, canDelete, onDeleteClick }: GlucoseHistoryCardProps) {
  const d = new Date(record.measuredAt);
  const timeStr = d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    hour: '2-digit',
    minute: '2-digit'
  });
  const dateStr = d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    month: 'short',
    day: 'numeric'
  });

  const isSevere = record.valueMgDl < 54;
  const isHypo = record.valueMgDl < 70 && !isSevere;
  const isHyper = record.valueMgDl >= 180;

  return (
    <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 capitalize">
          {record.measurementType.replace(/_/g, ' ')}
        </span>
        <div className="flex items-center space-x-2">
          {isSevere ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-600 text-white">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Critical
            </span>
          ) : isHypo ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-white">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low
            </span>
          ) : isHyper ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Elevated
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Target Safe
            </span>
          )}

          {canDelete ? (
            <button
              onClick={() => onDeleteClick(record.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-black text-slate-900">{record.valueMgDl}</span>
        <span className="text-sm font-bold text-slate-400">mg/dL</span>
      </div>

      {record.mealDescription || record.notes ? (
        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
          {record.mealDescription || record.notes}
        </p>
      ) : null}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1 text-teal-600" />
          {dateStr}, {timeStr}
        </span>
        <span className="flex items-center">
          <User className="w-3 h-3 mr-1 text-teal-600" />
          {record.recordedByName || 'Caregiver'}
        </span>
      </div>
    </div>
  );
}
