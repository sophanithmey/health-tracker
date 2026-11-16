import React from 'react';
import { useLocale } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';
import { MedicationLog } from '@/types';

interface MedicationDoseLogsListProps {
  logs: MedicationLog[];
}

export function MedicationDoseLogsList({ logs }: MedicationDoseLogsListProps) {
  const locale = useLocale();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-4 font-khmer">
        {locale === 'km' ? 'កំណត់ត្រាការលេបថ្នាំថ្មីៗ' : 'Recent Medication Dose Logs'}
      </h3>
      {logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          {locale === 'km'
            ? 'មិនទាន់មានកំណត់ត្រាការលេបថ្នាំនៅឡើយទេ ចុច «+ កត់ត្រាការលេប» នៅលើថ្នាំដែលត្រូវលេប'
            : 'No medication doses recorded yet. Click "+ Log Dose" to record a scheduled dose.'}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const d = new Date(log.recordedTime);
            const formatted = d.toLocaleDateString('en-US', {
              timeZone: 'Asia/Phnom_Penh',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 font-khmer">{log.medicationName}</h5>
                    <p className="text-[11px] text-slate-500">
                      Status: <strong className="text-emerald-700 capitalize">{log.status}</strong>
                      {log.notes ? ` • ${log.notes}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{formatted}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
