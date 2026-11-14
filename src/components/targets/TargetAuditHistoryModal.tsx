'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { X, History, CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { GlucoseTargetAuditLog } from '@/types';

interface TargetAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export function TargetAuditHistoryModal({
  isOpen,
  onClose,
  patientId
}: TargetAuditHistoryModalProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');

  const { data: auditLogs = [], isLoading } = useQuery<GlucoseTargetAuditLog[]>({
    queryKey: ['target-audit-logs', patientId],
    queryFn: async () => {
      const res = await axios.get(`/api/patients/${patientId}/glucose-targets/history`);
      return res.data.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  const getActionBadge = (action: GlucoseTargetAuditLog['action']) => {
    switch (action) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Rejected
          </span>
        );
      case 'created':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            Created
          </span>
        );
      case 'updated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            Updated
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
            Expired
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <History className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-khmer tracking-tight">
                {t('targetHistoryTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('targetHistorySubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Log Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Loading target history...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No Target Changes Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Any future target modifications, approvals, and doctor reviews will be audited here.
              </p>
            </div>
          ) : (
            auditLogs.map((log) => {
              const dateStr = new Date(log.createdAt).toLocaleString('en-US', {
                timeZone: 'Asia/Phnom_Penh',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const oldMin = log.oldValues?.minValue ?? log.oldValues?.targetMin;
              const oldMax = log.oldValues?.maxValue ?? log.oldValues?.targetMax;
              const newMin = log.newValues?.minValue ?? log.newValues?.targetMin;
              const newMax = log.newValues?.maxValue ?? log.newValues?.targetMax;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      {getActionBadge(log.action)}
                      {log.newValues?.measurementType && (
                        <span className="font-bold text-slate-800 capitalize">
                          {log.newValues.measurementType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {dateStr}
                    </span>
                  </div>

                  {/* Value Changes */}
                  <div className="flex items-center space-x-4 pt-1">
                    {oldMin !== undefined && oldMax !== undefined && (
                      <div className="text-slate-500 line-through">
                        Previous: {oldMin}–{oldMax} mg/dL
                      </div>
                    )}
                    {newMin !== undefined && (
                      <div className="font-bold text-teal-800">
                        Target: {newMin}
                        {newMax ? `–${newMax}` : '+'} mg/dL
                      </div>
                    )}
                  </div>

                  {/* Reason & Changed By */}
                  {log.reason && (
                    <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <strong>Reason:</strong> {log.reason}
                    </p>
                  )}

                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Changed by: {log.changedByName || 'Attending Staff'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex justify-end flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition"
          >
            {tCommon('close')}
          </button>
        </div>
      </div>
    </div>
  );
}

