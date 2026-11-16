import React from 'react';
import { GlucoseRecord } from '@/types';
import { Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GlucoseHistoryRowProps {
  record: GlucoseRecord;
  canDelete: boolean;
  onDeleteClick: (id: string) => void;
}

export function GlucoseHistoryRow({ record, canDelete, onDeleteClick }: GlucoseHistoryRowProps) {
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
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
        {dateStr}, {timeStr}
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 capitalize">
          {record.measurementType.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="text-base font-black text-slate-900">{record.valueMgDl}</span>
        <span className="text-xs font-bold text-slate-400 ml-1">mg/dL</span>
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        {isSevere ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black bg-red-600 text-white">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Critical Low
          </span>
        ) : isHypo ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low (&lt; 70)
          </span>
        ) : isHyper ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Elevated
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Target Safe
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
        {record.mealDescription || record.notes || '—'}
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
        {record.recordedByName || 'Caregiver'}
      </td>
      {canDelete ? (
        <td className="py-3.5 px-4 text-right whitespace-nowrap">
          <button
            onClick={() => onDeleteClick(record.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      ) : null}
    </tr>
  );
}
