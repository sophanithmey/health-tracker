'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { GlucoseTarget, MeasurementType } from '@/types';
import { Target, CheckCircle2, AlertCircle, ShieldAlert, Edit2, Save } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

interface TargetConfigCardProps {
  targets: GlucoseTarget[];
  onRefresh: () => void;
}

export function TargetConfigCard({ targets, onRefresh }: TargetConfigCardProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');
  const { role } = useRole();

  const [editingType, setEditingType] = useState<MeasurementType | null>(null);
  const [minVal, setMinVal] = useState<number>(80);
  const [maxVal, setMaxVal] = useState<number>(130);
  const [lowAlert, setLowAlert] = useState<number>(70);
  const [highAlert, setHighAlert] = useState<number>(140);
  const [status, setStatus] = useState<'unconfirmed' | 'clinician_approved'>('unconfirmed');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (tgt: GlucoseTarget) => {
    setEditingType(tgt.measurementType);
    setMinVal(tgt.targetMin);
    setMaxVal(tgt.targetMax);
    setLowAlert(tgt.lowAlertThreshold);
    setHighAlert(tgt.highAlertThreshold);
    setStatus(tgt.clinicianApprovalStatus);
    setNotes(tgt.clinicianNotes || '');
  };

  const handleSave = async (type: MeasurementType) => {
    setIsSaving(true);
    try {
      await axios.post('/api/targets', {
        measurementType: type,
        targetMin: Number(minVal),
        targetMax: Number(maxVal),
        lowAlertThreshold: Number(lowAlert),
        highAlertThreshold: Number(highAlert),
        clinicianApprovalStatus: status,
        clinicianNotes: notes.trim() || undefined
      });
      setEditingType(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update target');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-sm">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 mb-1">Educational Reference Notice</h4>
          <p className="leading-relaxed">{t('educationalNotice')}</p>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((tgt) => {
          const isEditing = editingType === tgt.measurementType;
          const isApproved = tgt.clinicianApprovalStatus === 'clinician_approved';

          return (
            <div
              key={tgt.id}
              className={`rounded-3xl p-6 border transition bg-white ${
                isApproved
                  ? 'border-emerald-300 shadow-xs'
                  : 'border-slate-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 capitalize">
                    {tgt.measurementType.replace(/_/g, ' ')}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isApproved ? t('statusApproved') : t('statusUnconfirmed')}
                  </span>

                  {role === 'family_admin' && !isEditing && (
                    <button
                      onClick={() => startEdit(tgt)}
                      className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      title="Edit target"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs text-slate-500 font-semibold">
                      Target Range:
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {tgt.targetMin} – {tgt.targetMax}{' '}
                      <span className="text-xs font-normal text-slate-500">mg/dL</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-semibold">Low Alert:</span>{' '}
                      <span className="font-bold text-red-900">&lt; {tgt.lowAlertThreshold}</span>
                    </div>
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span className="text-amber-700 font-semibold">High Alert:</span>{' '}
                      <span className="font-bold text-amber-900">&gt; {tgt.highAlertThreshold}</span>
                    </div>
                  </div>

                  {tgt.clinicianNotes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Clinician Notes:</strong> {tgt.clinicianNotes}
                    </p>
                  )}
                </div>
              ) : (
                /* Edit Form for Caregiver */
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Min (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={minVal}
                        onChange={(e) => setMinVal(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Max (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={maxVal}
                        onChange={(e) => setMaxVal(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Clinician Approval Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="unconfirmed">Unconfirmed (Proposed)</option>
                      <option value="clinician_approved">Clinician Approved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Clinician Notes / Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Doctor's notes..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingType(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(tgt.measurementType)}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow"
                    >
                      {isSaving ? 'Saving...' : 'Save Target'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

