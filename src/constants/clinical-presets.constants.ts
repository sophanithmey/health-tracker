import { MeasurementType } from '@/types';

export interface ClinicalPreset {
  id: string;
  labelKm: string;
  labelEn: string;
  type: MeasurementType;
  mode: 'range' | 'upper_only' | 'lower_only';
  min: string;
  max: string;
  notesKm: string;
  notesEn: string;
}

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: 'fasting_standard',
    labelKm: 'Fasting ៨០–១៣០ (ADA)',
    labelEn: 'Fasting 80–130 (ADA)',
    type: 'fasting',
    mode: 'range',
    min: '80',
    max: '130',
    notesKm: 'គោលការណ៍ណែនាំស្តង់ដារ ADA សម្រាប់ពេលព្រឹកព្រលឹម (អត់អាហារ ៨-១០ ម៉ោង)',
    notesEn: 'Standard ADA recommendation for fasting (8–10h without food)'
  },
  {
    id: 'postmeal_standard',
    labelKm: 'ក្រោយអាហារ ≤ ១៨០',
    labelEn: 'Post-Meal ≤ 180 (ADA)',
    type: '2h_after_meal',
    mode: 'upper_only',
    min: '',
    max: '180',
    notesKm: 'កម្រិតពិដានក្រោយអាហារ ២ ម៉ោង តិចជាង ១៨០ mg/dL',
    notesEn: 'ADA peak 2-hour postprandial goal: under 180 mg/dL'
  },
  {
    id: 'bedtime_safe',
    labelKm: 'មុនចូលគេង ១០០–១៤០',
    labelEn: 'Bedtime 100–140 (Safe)',
    type: 'bedtime',
    mode: 'range',
    min: '100',
    max: '140',
    notesKm: 'កម្រិតសុវត្ថិភាពពេលយប់ការពារការធ្លាក់ជាតិស្ករ',
    notesEn: 'Overnight glycemic safety target to prevent nocturnal hypoglycemia'
  },
  {
    id: 'fasting_tight',
    labelKm: 'Fasting ៧០–១១០ (Strict)',
    labelEn: 'Fasting 70–110 (Strict)',
    type: 'fasting',
    mode: 'range',
    min: '70',
    max: '110',
    notesKm: 'គោលដៅតឹងរ៉ឹងសម្រាប់អ្នកជំងឺវ័យក្មេង ឬស្ថិតក្នុងដំណាក់កាលដំបូង',
    notesEn: 'Stringent glycemic target for early-stage management'
  }
];
