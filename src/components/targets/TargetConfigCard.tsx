'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { targetService } from '@/services/target-service';
import { Target, Plus, History } from 'lucide-react';
import { GlucoseTarget, GeneralGuidelineReference } from '@/types';
import { useRole } from '@/context/RoleContext';
import { GeneralGuidelinesCard } from './GeneralGuidelinesCard';
import { TargetItemCard } from './TargetItemCard';

const TargetModal = dynamic(
  () => import('./TargetModal').then((m) => m.TargetModal),
  { ssr: false }
);

const TargetAuditHistoryModal = dynamic(
  () => import('./TargetAuditHistoryModal').then((m) => m.TargetAuditHistoryModal),
  { ssr: false }
);

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
  const { role } = useRole();
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<GlucoseTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const invalidateTargetQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['targets'] });
    queryClient.invalidateQueries({ queryKey: ['glucose-targets'] });
    queryClient.invalidateQueries({ queryKey: ['glucose'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

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
      await targetService.approveTarget(tgt.patientId || patientId, tgt.id, reason);
      invalidateTargetQueries();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve target');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tgt: GlucoseTarget) => {
    const reason = prompt('Enter reason for rejection:', 'Target values inappropriate for patient clinical condition');
    if (reason === null) return;

    setProcessingId(tgt.id);
    try {
      await targetService.rejectTarget(tgt.patientId || patientId, tgt.id, reason);
      invalidateTargetQueries();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reject target');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-khmer">
              {t('title')}
            </h3>
            <p className="text-xs text-slate-500">
              Personalized glycemic goals tailored to Mom&apos;s condition
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit Trail</span>
            </button>

            {(role === 'family_admin' || role === 'clinician') ? (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Target</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* List of targets */}
        <div className="space-y-3">
          {filteredTargets.map((tgt) => (
            <TargetItemCard
              key={tgt.id}
              target={tgt}
              role={role}
              isProcessing={processingId === tgt.id}
              onEdit={handleOpenEdit}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>

      {/* General ADA Guidelines card */}
      <GeneralGuidelinesCard guidelines={generalGuidelines} />

      {/* Modals */}
      {isModalOpen ? (
        <TargetModal
          isOpen={isModalOpen}
          target={selectedTarget}
          patientId={patientId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            invalidateTargetQueries();
            onRefresh();
          }}
        />
      ) : null}

      {isHistoryOpen ? (
        <TargetAuditHistoryModal
          isOpen={isHistoryOpen}
          patientId={patientId}
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </div>
  );
}
