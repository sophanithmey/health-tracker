export interface MedicationPreset {
  id: string;
  label: string;
  name: string;
  dosage: string;
  frequency: string;
  timingKm: string;
  timingEn: string;
}

export const MEDICATION_PRESETS: MedicationPreset[] = [
  {
    id: 'met-500',
    label: 'Metformin HCl 500 mg',
    name: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Once daily',
    timingKm: 'លេបជាមួយបាយព្រឹក',
    timingEn: 'Take with breakfast'
  },
  {
    id: 'met-850',
    label: 'Metformin HCl 850 mg',
    name: 'Metformin HCl',
    dosage: '850 mg',
    frequency: 'Twice daily',
    timingKm: 'លេបជាមួយបាយព្រឹក និងល្ងាច',
    timingEn: 'Take with breakfast & dinner'
  },
  {
    id: 'glic-30',
    label: 'Diamicron MR 30 mg',
    name: 'Diamicron MR (Gliclazide)',
    dosage: '30 mg',
    frequency: 'Once daily',
    timingKm: 'លេបមុនបាយព្រឹក ៣០ នាទី',
    timingEn: 'Take 30 min before breakfast'
  },
  {
    id: 'sita-met',
    label: 'Janumet 50/1000 mg',
    name: 'Janumet (Sitagliptin/Metformin)',
    dosage: '50/1000 mg',
    frequency: 'Twice daily',
    timingKm: 'លេបជាមួយបាយព្រឹក និងល្ងាច',
    timingEn: 'Take with meals (breakfast & dinner)'
  }
];
