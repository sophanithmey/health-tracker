'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Edit2,
  Plus,
  History,
  XCircle,
  Calendar,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { GlucoseTarget, GeneralGuidelineReference, MeasurementType } from '@/types';
import { useRole } from '@/context/RoleContext';
import { TargetModal } from './TargetModal';
import { TargetAuditHistoryModal } from './TargetAuditHistoryModal';
import { GeneralGuidelinesCard } from './GeneralGuidelinesCard';

interface TargetConfigCardProps {
  targets: GlucoseTarget[];
  generalGuidelines?: GeneralGuidelineReference[];
  patientId?: string;
  onRefresh: () => void;
}

export function TargetConfigCard({
  targets,
  generalGuidelines = [],
  patientId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  onRefresh
}: TargetConfigCardProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');
  const { role } = useRole();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<GlucoseTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter targets
  const filteredTargets = targets.filter((tgt) => {
    if (filterType === 'all') return true;
    if (filterType === 'fasting') return tgt.measurementType === 'fasting';
    if (filterType === 'postmeal')
      return tgt.measurementType === '1h_after_meal' || tgt.measurementType === '2h_after_meal';
    if (filterType === 'bedtime') return tgt.measurementType === 'bedtime';
    return true;
  });

  const handleOpenCreate = () => {
    setSelectedTarget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tgt: GlucoseTarget) => {
    setSelectedTarget(tgt);
    setIsModalOpen(true);
  };

  const handleApprove = async (tgt: GlucoseTarget) => {
    const reason = prompt('Enter clinician approval notes (optional):', 'Clinically reviewed and approved');
    if (reason === null) return;

    setProcessingId(tgt.id);
    try {
      await axios.post(`/api/patients/${tgt.patientId || patientId}/glucose-targets/${tgt.id}/approve`, {
        reason
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve target');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tgt: GlucoseTarget) => {
    const reason = prompt('Enter reason for rejection:', 'Target values inappropriate for patient clinical condition');
    if (reason === null) return;

    setProcessingId(tgt.id);
    try {
      await axios.post(`/api/patients/${tgt.patientId || patientId}/glucose-targets/${tgt.id}/reject`, {
        reason
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject target');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions & Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Targets' },
            { id: 'fasting', label: 'Fasting' },
            { id: 'postmeal', label: 'Post-Meal' },
            { id: 'bedtime', label: 'Bedtime' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>{t('targetHistoryBtn')}</span>
          </button>

          {(role === 'family_admin' || role === 'clinician') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newTargetBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-900 font-bold mb-0.5">
            {t('educationalNoticeTitle')}
          </strong>
          {t('educationalNotice')}
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTargets.map((tgt) => {
          const isApproved =
            tgt.approvalStatus === 'approved' || tgt.clinicianApprovalStatus === 'clinician_approved';
          const isPending = tgt.approvalStatus === 'pending';
          const isRejected = tgt.approvalStatus === 'rejected';

          const min = tgt.minValue ?? tgt.targetMin;
          const max = tgt.maxValue ?? tgt.targetMax;

          const dateStr = tgt.effectiveFrom
            ? new Date(tgt.effectiveFrom).toLocaleDateString('en-US', {
                timeZone: 'Asia/Phnom_Penh',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : new Date(tgt.effectiveDate).toLocaleDateString('en-US', {
                timeZone: 'Asia/Phnom_Penh',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

          return (
            <div
              key={tgt.id}
              className={`rounded-3xl p-6 border transition bg-white flex flex-col justify-between ${
                isApproved
                  ? 'border-emerald-300 shadow-xs'
                  : isPending
                  ? 'border-amber-300/80 shadow-xs'
                  : 'border-slate-200 shadow-xs opacity-80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 capitalize">
                        {tgt.measurementType.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {tgt.source === 'general_guideline'
                          ? 'General Guideline'
                          : 'Clinician Configured'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Edit */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {isApproved
                        ? t('statusApproved')
                        : isPending
                        ? t('statusPending')
                        : t('statusRejected')}
                    </span>

                    {(role === 'family_admin' || role === 'clinician') && (
                      <button
                        onClick={() => handleOpenEdit(tgt)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        title="Edit target"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Range Display */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      {t('targetRange')}:
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {min && max ? (
                        <>
                          {min} – {max}{' '}
                          <span className="text-xs font-normal text-slate-500">mg/dL</span>
                        </>
                      ) : min ? (
                        <>
                          ≥ {min}{' '}
                          <span className="text-xs font-normal text-slate-500">mg/dL</span>
                        </>
                      ) : (
                        <>
                          ≤ {max}{' '}
                          <span className="text-xs font-normal text-slate-500">mg/dL</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Effective Dates & Notes */}
                <div className="space-y-2 text-xs text-slate-500 mb-4">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Effective from: {dateStr}</span>
                    {tgt.approvedByName && (
                      <span className="ml-2 font-medium text-emerald-700">
                        • Approved by {tgt.approvedByName}
                      </span>
                    )}
                  </div>

                  {tgt.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      <strong>Notes:</strong> {tgt.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Clinician Review Action Buttons (Visible for Clinicians and Admins on Pending Targets) */}
              {isPending && (role === 'clinician' || role === 'family_admin') && (
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => handleReject(tgt)}
                    disabled={processingId === tgt.id}
                    className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(tgt)}
                    disabled={processingId === tgt.id}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Target</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* General ADA Guidelines Card */}
      <GeneralGuidelinesCard guidelines={generalGuidelines} />

      {/* Modals */}
      <TargetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        target={selectedTarget}
      />

      <TargetAuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        patientId={patientId}
      />
    </div>
  );
}
