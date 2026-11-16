import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { glucoseService } from '@/services/glucose-service';
import { MeasurementType, NotificationAlert } from '@/types';

export function useGlucoseEntryForm(onSuccess: (alert?: NotificationAlert) => void, onClose: () => void) {
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [valueMgDl, setValueMgDl] = useState<string>('148');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('fasting');
  const [measuredDate, setMeasuredDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [measuredTime, setMeasuredTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [mealDescription, setMealDescription] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSymptom = (label: string) => {
    setSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueMgDl);
    if (isNaN(val) || val < 20 || val > 600) {
      setErrorMsg(
        locale === 'km'
          ? 'សូមបញ្ចូលកម្រិតជាតិស្ករត្រឹមត្រូវចន្លោះពី ២០ ដល់ ៦០០ mg/dL'
          : 'Please enter a valid glucose reading between 20 and 600 mg/dL'
      );
      return;
    }
    setErrorMsg(null);
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const combinedDateTime = new Date(`${measuredDate}T${measuredTime}:00`).toISOString();

      const result = await glucoseService.createRecord({
        valueMgDl: parseFloat(valueMgDl),
        measurementType,
        measuredAt: combinedDateTime,
        mealDescription: mealDescription.trim() || undefined,
        symptoms,
        notes: notes.trim() || undefined
      });

      queryClient.invalidateQueries({ queryKey: ['glucose'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });

      onSuccess(result.alert);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record reading. Please check your connection.');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    valueMgDl,
    setValueMgDl,
    measurementType,
    setMeasurementType,
    measuredDate,
    setMeasuredDate,
    measuredTime,
    setMeasuredTime,
    mealDescription,
    setMealDescription,
    symptoms,
    toggleSymptom,
    notes,
    setNotes,
    showConfirm,
    setShowConfirm,
    isSubmitting,
    errorMsg,
    handleInitialSubmit,
    handleFinalConfirm
  };
}
