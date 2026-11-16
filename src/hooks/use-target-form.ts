import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { targetService } from '@/services/target-service';
import { GlucoseTarget, MeasurementType } from '@/types';
import { CLINICAL_PRESETS, ClinicalPreset } from '@/constants/clinical-presets.constants';

export function useTargetForm(
  target: GlucoseTarget | null | undefined,
  patientId: string,
  onSuccess: () => void,
  onClose: () => void
) {
  const locale = useLocale();

  const [measurementType, setMeasurementType] = useState<MeasurementType>('fasting');
  const [thresholdMode, setThresholdMode] = useState<'range' | 'upper_only' | 'lower_only'>('range');
  const [minValue, setMinValue] = useState<string>('80');
  const [maxValue, setMaxValue] = useState<string>('130');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [effectiveUntil, setEffectiveUntil] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string | null>('fasting_standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setMeasurementType(target.measurementType);
      const mode =
        target.minValue !== undefined && target.maxValue !== undefined
          ? 'range'
          : target.maxValue !== undefined
          ? 'upper_only'
          : 'lower_only';
      setThresholdMode(mode);
      setMinValue(target.minValue !== undefined ? String(target.minValue) : '');
      setMaxValue(target.maxValue !== undefined ? String(target.maxValue) : '');
      setEffectiveFrom(target.effectiveFrom ? target.effectiveFrom.split('T')[0] : '');
      setEffectiveUntil(target.effectiveUntil ? target.effectiveUntil.split('T')[0] : '');
      setNotes(target.notes || '');
      setActivePreset(null);
    }
  }, [target]);

  const applyPreset = (preset: ClinicalPreset) => {
    setActivePreset(preset.id);
    setMeasurementType(preset.type);
    setThresholdMode(preset.mode);
    setMinValue(preset.min);
    setMaxValue(preset.max);
    setNotes(locale === 'km' ? preset.notesKm : preset.notesEn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const minNum = minValue ? parseFloat(minValue) : undefined;
    const maxNum = maxValue ? parseFloat(maxValue) : undefined;

    if (thresholdMode === 'range' && (minNum === undefined || maxNum === undefined)) {
      setErrorMsg('Both minimum and maximum are required for range targets.');
      return;
    }
    if (minNum !== undefined && maxNum !== undefined && minNum >= maxNum) {
      setErrorMsg('Minimum target must be less than maximum target.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        measurementType,
        minValue: thresholdMode !== 'upper_only' ? minNum : undefined,
        maxValue: thresholdMode !== 'lower_only' ? maxNum : undefined,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : new Date().toISOString(),
        effectiveUntil: effectiveUntil ? new Date(effectiveUntil).toISOString() : undefined,
        notes: notes.trim() || undefined,
        reason: reason.trim() || undefined
      };

      if (target?.id) {
        await targetService.updateTarget(patientId, target.id, payload);
      } else {
        await targetService.createTarget(patientId, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save glucose target.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    measurementType,
    setMeasurementType,
    thresholdMode,
    setThresholdMode,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    effectiveFrom,
    setEffectiveFrom,
    effectiveUntil,
    setEffectiveUntil,
    notes,
    setNotes,
    reason,
    setReason,
    activePreset,
    applyPreset,
    isSubmitting,
    errorMsg,
    handleSubmit
  };
}
