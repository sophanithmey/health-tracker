import React from 'react';
import { GlucoseTarget, UserRole } from '@/types';
import { Target, CheckCircle2, AlertCircle, Edit2, UserCheck, XCircle } from 'lucide-react';

interface TargetItemCardProps {
  target: GlucoseTarget;
  role: UserRole;
  isProcessing: boolean;
  onEdit: (tgt: GlucoseTarget) => void;
  onApprove: (tgt: GlucoseTarget) => void;
  onReject: (tgt: GlucoseTarget) => void;
}

export function TargetItemCard({
  target,
  role,
  isProcessing,
  onEdit,
  onApprove,
  onReject
}: TargetItemCardProps) {
  const isApproved =
    target.approvalStatus === 'approved' ||
    target.clinicianApprovalStatus === 'clinician_approved';
  const isPending =
    target.approvalStatus === 'pending' ||
    target.clinicianApprovalStatus === 'unconfirmed';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isApproved
          ? 'bg-emerald-50/40 border-emerald-200/90'
          : isPending
          ? 'bg-amber-50/40 border-amber-200/90'
          : 'bg-slate-50/60 border-slate-200/80 opacity-75'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isApproved
                ? 'bg-emerald-100 text-emerald-800'
                : isPending
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Target className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 text-sm capitalize">
                {target.measurementType.replace(/_/g, ' ')}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isPending
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Clinician Approved
                  </>
                ) : isPending ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending Clinician Review
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Target Range:
              <strong className="text-slate-800 ml-1">
                {target.minValue ?? target.targetMin ?? 80} – {target.maxValue ?? target.targetMax ?? 130} mg/dL
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          {role === 'clinician' && isPending ? (
            <>
              <button
                onClick={() => onApprove(target)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => onReject(target)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          ) : null}

          {(role === 'family_admin' || role === 'clinician') ? (
            <button
              onClick={() => onEdit(target)}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded-lg transition border border-slate-200/60"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {target.notes ? (
        <p className="text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-200/50 italic">
          &ldquo;{target.notes}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
