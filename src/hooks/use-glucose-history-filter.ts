import { useState, useMemo } from 'react';
import { glucoseService } from '@/services/glucose-service';
import { GlucoseRecord } from '@/types';

export function useGlucoseHistoryFilter(records: GlucoseRecord[], onRefresh: () => void) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (filterType !== 'all') {
        if (filterType === 'fasting' && r.measurementType !== 'fasting' && r.measurementType !== 'before_meal') {
          return false;
        }
        if (filterType === 'postmeal' && r.measurementType !== '1h_after_meal' && r.measurementType !== '2h_after_meal') {
          return false;
        }
        if (filterType === 'bedtime' && r.measurementType !== 'bedtime') {
          return false;
        }
      }
      if (q) {
        const matchMeal = r.mealDescription?.toLowerCase().includes(q);
        const matchNotes = r.notes?.toLowerCase().includes(q);
        const matchVal = r.valueMgDl.toString().includes(q);
        if (!matchMeal && !matchNotes && !matchVal) return false;
      }
      return true;
    });
  }, [records, filterType, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;
    setIsDeleting(true);
    try {
      await glucoseService.deleteRecord(selectedDeleteId);
      setSelectedDeleteId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    selectedDeleteId,
    setSelectedDeleteId,
    isDeleting,
    filtered,
    handleDeleteConfirm
  };
}
