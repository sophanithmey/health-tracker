import { useState } from 'react';
import { useLocale } from 'next-intl';
import { medicationService } from '@/services/medication-service';
import { MEDICATION_PRESETS, MedicationPreset } from '@/constants/medication-presets.constants';

export interface InitialMedicationData {
  rxcui?: string;
  name?: string;
  dosage?: string;
  genericName?: string;
  brandName?: string;
  activeIngredients?: string[];
  dosageForm?: string;
}

export function useAddMedicationForm(
  initialData: InitialMedicationData | null | undefined,
  onSuccess: () => void,
  onClose: () => void
) {
  const locale = useLocale();

  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '500 mg');
  const [frequency, setFrequency] = useState('Once daily');
  const [timingInstructions, setTimingInstructions] = useState('Take with breakfast');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [rxcui] = useState<string | undefined>(initialData?.rxcui);
  const [genericName] = useState<string | undefined>(initialData?.genericName);
  const [brandName] = useState<string | undefined>(initialData?.brandName);
  const [activeIngredients] = useState<string[]>(initialData?.activeIngredients || []);
  const [dosageForm] = useState<string | undefined>(initialData?.dosageForm);
  const [activePreset, setActivePreset] = useState<string | null>(
    initialData ? null : 'Metformin HCl 500 mg'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyPreset = (preset: MedicationPreset) => {
    setActivePreset(preset.label);
    setName(preset.name);
    setDosage(preset.dosage);
    setFrequency(preset.frequency);
    setTimingInstructions(locale === 'km' ? preset.timingKm : preset.timingEn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Medication name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await medicationService.createMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        timingInstructions: timingInstructions.trim(),
        prescribingDoctor: prescribingDoctor.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
        rxcui,
        genericName,
        brandName,
        activeIngredients,
        dosageForm
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    dosage,
    setDosage,
    frequency,
    setFrequency,
    timingInstructions,
    setTimingInstructions,
    prescribingDoctor,
    setPrescribingDoctor,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    rxcui,
    genericName,
    brandName,
    activePreset,
    applyPreset,
    isSubmitting,
    errorMsg,
    handleSubmit
  };
}
