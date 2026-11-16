import { useMemo } from 'react';
import { GlucoseRecord } from '@/types';

export type RangeOption = 7 | 30 | 90 | 180 | 0;

export interface MeasurementPoint {
  id: string;
  date: string; // for chart x-axis e.g. "Nov 12"
  dayLabel: string; // "Nov 12"
  dayNumber: number; // 12
  timeStr: string; // "06:28 AM"
  monthKey: string; // "2026-11"
  monthLabel: string; // "Nov 2026"
  valueMgDl: number;
  measurementType: string;
  typeLabel: string;
  measuredAt: string;
  fasting?: number;
  postMeal?: number;
  bedtime?: number;
  other?: number;
}

export interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  isCurrent: boolean;
  measurements: MeasurementPoint[];
  readingsCount: number;
}

export function useGlucoseTrendData(
  records: GlucoseRecord[],
  locale: string,
  daysRange: RangeOption = 0
) {
  // 1. All individual measurements sorted chronologically - NO AVERAGING
  const allMeasurements = useMemo<MeasurementPoint[]>(() => {
    if (!records || records.length === 0) return [];

    let filtered = [...records];
    if (daysRange > 0) {
      const cutoffMs = Date.now() - daysRange * 86400000;
      const cutoff = new Date(cutoffMs).toISOString();
      filtered = filtered.filter((r) => r.measuredAt >= cutoff);
    }

    filtered.sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    return filtered.map((r) => {
      const d = new Date(r.measuredAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const dayNumber = d.getDate();

      const dayLabel = d.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        day: 'numeric'
      });

      const monthLabel = d.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        year: 'numeric'
      });

      const timeStr = d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const isFasting = r.measurementType === 'fasting' || r.measurementType === 'before_meal';
      const isPostMeal =
        r.measurementType === '1h_after_meal' || r.measurementType === '2h_after_meal';
      const isBedtime = r.measurementType === 'bedtime';

      const typeLabel = isFasting
        ? locale === 'km'
          ? 'ពេលព្រឹក/មុនបាយ'
          : 'Fasting'
        : isPostMeal
        ? locale === 'km'
          ? 'ក្រោយបាយ'
          : 'Post-meal'
        : isBedtime
        ? locale === 'km'
          ? 'មុនចូលគេង'
          : 'Bedtime'
        : locale === 'km'
        ? 'ផ្សេងទៀត'
        : 'Other';

      return {
        id: r.id,
        date: dayLabel,
        dayLabel,
        dayNumber,
        timeStr,
        monthKey,
        monthLabel,
        valueMgDl: r.valueMgDl,
        measurementType: r.measurementType,
        typeLabel,
        measuredAt: r.measuredAt,
        fasting: isFasting ? r.valueMgDl : undefined,
        postMeal: isPostMeal ? r.valueMgDl : undefined,
        bedtime: isBedtime ? r.valueMgDl : undefined,
        other: !isFasting && !isPostMeal && !isBedtime ? r.valueMgDl : undefined
      };
    });
  }, [records, daysRange, locale]);

  // 2. Group measurements by month preserving each day's actual reading
  const monthGroups = useMemo<MonthGroup[]>(() => {
    if (!allMeasurements || allMeasurements.length === 0) return [];

    const monthMap: Record<string, MonthGroup> = {};
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    allMeasurements.forEach((pt) => {
      if (!monthMap[pt.monthKey]) {
        monthMap[pt.monthKey] = {
          monthKey: pt.monthKey,
          monthLabel: pt.monthLabel,
          isCurrent: pt.monthKey === currentMonthKey,
          measurements: [],
          readingsCount: 0
        };
      }
      monthMap[pt.monthKey].measurements.push(pt);
      monthMap[pt.monthKey].readingsCount += 1;
    });

    return Object.keys(monthMap)
      .sort()
      .map((key) => monthMap[key]);
  }, [allMeasurements]);

  return { allMeasurements, monthGroups };
}
