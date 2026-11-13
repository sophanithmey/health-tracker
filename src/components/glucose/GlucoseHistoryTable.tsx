'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { GlucoseRecord, MeasurementType } from '@/types';
import {
  Droplet,
  Trash2,
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { DeleteReadingDialog } from './DeleteReadingDialog';

interface GlucoseHistoryTableProps {
  records: GlucoseRecord[];
  onRefresh: () => void;
}

export function GlucoseHistoryTable({ records, onRefresh }: GlucoseHistoryTableProps) {
  const t = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');
  const { role } = useRole();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter records
  const filtered = records.filter((r) => {
    if (filterType !== 'all' && r.measurementType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMeal = r.mealDescription?.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);
      const matchVal = r.valueMgDl.toString().includes(q);
      if (!matchMeal && !matchNotes && !matchVal) return false;
    }
    return true;
  });

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/glucose/${selectedDeleteId}`);
      setSelectedDeleteId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t('history')}</h3>
          <p className="text-xs text-slate-500">
            {filtered.length} total readings recorded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search readings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="fasting">{t('fasting')}</option>
              <option value="before_meal">{t('before_meal')}</option>
              <option value="1h_after_meal">{t('1h_after_meal')}</option>
              <option value="2h_after_meal">{t('2h_after_meal')}</option>
              <option value="bedtime">{t('bedtime')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Readings Table / List */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No blood sugar readings match the selected filter.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Date & Time (Phnom Penh)</th>
                <th className="py-3 px-3">Context</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Recorded By</th>
                {role === 'family_admin' && <th className="py-3 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((record) => {
                const dateObj = new Date(record.measuredAt);
                const timeStr = dateObj.toLocaleTimeString('en-US', {
                  timeZone: 'Asia/Phnom_Penh',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                const dateStr = dateObj.toLocaleDateString('en-US', {
                  timeZone: 'Asia/Phnom_Penh',
                  month: 'short',
                  day: 'numeric'
                });

                const isCritical = record.targetStatus === 'critical_low' || record.valueMgDl < 54;
                const isHigh = record.targetStatus === 'high' || record.valueMgDl > 140;
                const isLow = record.targetStatus === 'low' || (record.valueMgDl < 70 && !isCritical);

                return (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{dateStr}</div>
                      <div className="text-xs text-slate-500">{timeStr}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                        {record.measurementType.replace(/_/g, ' ')}
                      </span>
                      {record.mealDescription && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
                          {record.mealDescription}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-lg font-black text-slate-900">
                        {record.valueMgDl}
                      </span>{' '}
                      <span className="text-xs font-semibold text-slate-400">mg/dL</span>
                    </td>

                    <td className="py-3 px-3">
                      {isCritical ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
                          Critical Low
                        </span>
                      ) : isHigh ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Above Target
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Below Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Within Target
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-600">
                      {record.recordedByName || 'Caregiver'}
                    </td>

                    {role === 'family_admin' && (
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedDeleteId(record.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Reading"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Dialog */}
      <DeleteReadingDialog
        isOpen={Boolean(selectedDeleteId)}
        onClose={() => setSelectedDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}

