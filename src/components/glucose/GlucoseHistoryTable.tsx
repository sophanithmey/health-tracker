'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { GlucoseRecord } from '@/types';
import { Droplet, Search } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { useGlucoseHistoryFilter } from '@/hooks/use-glucose-history-filter';
import { GlucoseHistoryRow } from './GlucoseHistoryRow';
import { GlucoseHistoryCard } from './GlucoseHistoryCard';

const DeleteReadingDialog = dynamic(
  () => import('./DeleteReadingDialog').then((m) => m.DeleteReadingDialog),
  { ssr: false },
);

interface GlucoseHistoryTableProps {
  records: GlucoseRecord[];
  onRefresh: () => void;
}

export function GlucoseHistoryTable({
  records,
  onRefresh,
}: GlucoseHistoryTableProps) {
  const t = useTranslations('bloodSugar');
  const locale = useLocale();
  const { role } = useRole();
  const canDelete = role === 'family_admin' || role === 'clinician';

  const {
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    selectedDeleteId,
    setSelectedDeleteId,
    isDeleting,
    filtered,
    handleDeleteConfirm,
  } = useGlucoseHistoryFilter(records, onRefresh);

  return (
    <div className='bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs'>
      {/* Top Filter and Search Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h3 className='text-lg font-bold text-slate-900 font-khmer'>
            {t('history')}
          </h3>
          <p className='text-xs text-slate-500'>
            {filtered.length}{' '}
            {locale === 'km' ? 'កំណត់ត្រាវាស់សរុប' : 'total readings recorded'}
          </p>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center gap-2.5'>
          {/* Search Box */}
          <div className='relative w-full sm:w-48'>
            <Search className='w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2' />
            <input
              type='text'
              placeholder={
                locale === 'km' ? 'ស្វែងរកកំណត់ត្រា...' : 'Search readings...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none'
            />
          </div>

          {/* Type Filter */}
          <div className='flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0'>
            {['all', 'fasting', 'postmeal', 'bedtime'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterType === type
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all'
                  ? locale === 'km'
                    ? 'ទាំងអស់'
                    : 'All'
                  : type === 'fasting'
                    ? locale === 'km'
                      ? 'អត់អាហារ'
                      : 'Fasting'
                    : type === 'postmeal'
                      ? locale === 'km'
                        ? 'ក្រោយបាយ'
                        : 'Post-Meal'
                      : locale === 'km'
                        ? 'មុនគេង'
                        : 'Bedtime'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className='text-center py-12 text-slate-400 text-sm'>
          <Droplet className='w-8 h-8 mx-auto mb-2 text-slate-300' />
          No readings match your filter criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider'>
                  <th className='py-3 px-4'>Date &amp; Time</th>
                  <th className='py-3 px-4'>Context</th>
                  <th className='py-3 px-4'>Value</th>
                  <th className='py-3 px-4'>Status</th>
                  <th className='py-3 px-4'>Notes / Meal</th>
                  <th className='py-3 px-4'>Logged By</th>
                  {canDelete ? (
                    <th className='py-3 px-4 text-right'>Action</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <GlucoseHistoryRow
                    key={record.id}
                    record={record}
                    canDelete={canDelete}
                    onDeleteClick={(id) => setSelectedDeleteId(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-3'>
            {filtered.map((record) => (
              <GlucoseHistoryCard
                key={record.id}
                record={record}
                canDelete={canDelete}
                onDeleteClick={(id) => setSelectedDeleteId(id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Dialog */}
      {selectedDeleteId ? (
        <DeleteReadingDialog
          isOpen={Boolean(selectedDeleteId)}
          isDeleting={isDeleting}
          onClose={() => setSelectedDeleteId(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  );
}
