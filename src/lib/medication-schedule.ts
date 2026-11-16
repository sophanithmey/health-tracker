import { Medication, MedicationLog } from '@/types';

export type RoutinePeriod = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'other';

export interface RoutineMetadata {
  id: RoutinePeriod;
  titleEn: string;
  titleKm: string;
  timingHintEn: string;
  timingHintKm: string;
  iconName: string;
  badgeClass: string;
  borderClass: string;
}

export const ROUTINE_METADATA: Record<RoutinePeriod, RoutineMetadata> = {
  morning: {
    id: 'morning',
    titleEn: 'Morning Routine',
    titleKm: 'កាលវិភាគពេលព្រឹក',
    timingHintEn: 'With Breakfast (around 07:00 – 08:30 AM)',
    timingHintKm: 'ជាមួយអាហារពេលព្រឹក (ម៉ោង ៧:០០ – ៨:៣០ ព្រឹក)',
    iconName: 'Sun',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    borderClass: 'border-amber-200/80 bg-amber-50/20'
  },
  afternoon: {
    id: 'afternoon',
    titleEn: 'Afternoon Routine',
    titleKm: 'កាលវិភាគពេលថ្ងៃត្រង់',
    timingHintEn: 'With Lunch (around 11:30 AM – 01:00 PM)',
    timingHintKm: 'ជាមួយអាហារថ្ងៃត្រង់ (ម៉ោង ១១:៣០ – ១:០០ រសៀល)',
    iconName: 'SunMedium',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
    borderClass: 'border-orange-200/80 bg-orange-50/20'
  },
  evening: {
    id: 'evening',
    titleEn: 'Evening Routine',
    titleKm: 'កាលវិភាគពេលល្ងាច',
    timingHintEn: 'After Dinner (around 06:00 – 07:30 PM)',
    timingHintKm: 'ក្រោយអាហារពេលល្ងាច (ម៉ោង ៦:០០ – ៧:៣០ យប់)',
    iconName: 'Moon',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    borderClass: 'border-indigo-200/80 bg-indigo-50/20'
  },
  bedtime: {
    id: 'bedtime',
    titleEn: 'Bedtime Routine',
    titleKm: 'កាលវិភាគមុនចូលគេង',
    timingHintEn: 'Before Sleep (around 09:00 – 10:00 PM)',
    timingHintKm: 'មុនពេលចូលគេង (ម៉ោង ៩:០០ – ១០:០០ យប់)',
    iconName: 'Bed',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    borderClass: 'border-purple-200/80 bg-purple-50/20'
  },
  other: {
    id: 'other',
    titleEn: 'Other Prescriptions',
    titleKm: 'ថ្នាំលេបប្រចាំថ្ងៃផ្សេងទៀត',
    timingHintEn: 'As directed by physician',
    timingHintKm: 'តាមវេជ្ជបញ្ជារបស់គ្រូពេទ្យ',
    iconName: 'Clock',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-200 bg-slate-50/40'
  }
};

export function getMedicationRoutinePeriod(med: Medication): RoutinePeriod {
  const text = `${med.timingInstructions || ''} ${med.frequency || ''} ${med.notes || ''}`.toLowerCase();

  if (
    text.includes('breakfast') ||
    text.includes('morning') ||
    text.includes('am') ||
    text.includes('ព្រឹក') ||
    text.includes('បាយព្រឹក')
  ) {
    return 'morning';
  }

  if (
    text.includes('dinner') ||
    text.includes('evening') ||
    text.includes('pm') ||
    text.includes('ល្ងាច') ||
    text.includes('បាយល្ងាច')
  ) {
    return 'evening';
  }

  if (
    text.includes('lunch') ||
    text.includes('afternoon') ||
    text.includes('midday') ||
    text.includes('ថ្ងៃត្រង់')
  ) {
    return 'afternoon';
  }

  if (
    text.includes('bedtime') ||
    text.includes('bed') ||
    text.includes('sleep') ||
    text.includes('មុនគេង') ||
    text.includes('យប់')
  ) {
    return 'bedtime';
  }

  return 'other';
}

export function getTimingKhmerTranslation(timing?: string): string | null {
  if (!timing) return null;
  const lower = timing.toLowerCase();

  if (lower.includes('take with breakfast')) return 'លេបពេលព្រឹកជាមួយអាហារ';
  if (lower.includes('take after dinner')) return 'លេបពេលល្ងាចក្រោយអាហារ';
  if (lower.includes('take with lunch')) return 'លេបពេលថ្ងៃត្រង់ជាមួយអាហារ';
  if (lower.includes('take with meals') || lower.includes('with meal')) return 'លេបជាមួយអាហារ';
  if (lower.includes('before meal')) return 'លេបមុនពេលទទួលទានអាហារ';
  if (lower.includes('bedtime') || lower.includes('before bed')) return 'លេបមុនពេលចូលគេង';
  if (lower.includes('once daily')) return 'លេប ១ ដងក្នុងមួយថ្ងៃ';
  if (lower.includes('twice daily')) return 'លេប ២ ដងក្នុងមួយថ្ងៃ';

  return null;
}

export function getMedicationTodayLog(
  medicationId: string,
  logs: MedicationLog[]
): { isTakenToday: boolean; takenAtStr?: string; lastLog?: MedicationLog } {
  // Get today's local date string in Asia/Phnom_Penh
  const now = new Date();
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  const matchedLogs = logs.filter((l) => {
    if (l.medicationId !== medicationId) return false;
    const logTime = l.recordedTime || l.scheduledTime || l.createdAt;
    if (!logTime) return false;

    const logDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Phnom_Penh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(logTime));

    return logDateStr === todayStr && l.status === 'taken';
  });

  if (matchedLogs.length === 0) {
    return { isTakenToday: false };
  }

  // Sort latest first
  matchedLogs.sort((a, b) => {
    const tA = new Date(a.recordedTime || a.createdAt).getTime();
    const tB = new Date(b.recordedTime || b.createdAt).getTime();
    return tB - tA;
  });

  const latest = matchedLogs[0];
  const timeFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(latest.recordedTime || latest.createdAt));

  return {
    isTakenToday: true,
    takenAtStr: timeFormatted,
    lastLog: latest
  };
}
