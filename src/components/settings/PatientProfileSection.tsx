import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { patientService } from '@/services/patient-service';
import { User, PhoneCall, Save } from 'lucide-react';
import { PatientProfile, DiabetesType } from '@/types';

interface PatientProfileSectionProps {
  patient: PatientProfile;
  onRefresh: () => void;
}

export function PatientProfileSection({ patient, onRefresh }: PatientProfileSectionProps) {
  const t = useTranslations('settings');
  const tPatient = useTranslations('patient');

  const [fullName, setFullName] = useState(patient.fullName || '');
  const [fullNameKm, setFullNameKm] = useState(patient.fullNameKm || '');
  const [ageGroup, setAgeGroup] = useState(patient.ageGroup || '60-69');
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(patient.diabetesType || 'unknown');
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContactPhone || '');
  const [emergencyRel, setEmergencyRel] = useState(patient.emergencyContactRelation || 'Daughter');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await patientService.updatePatient({
        fullName: fullName.trim(),
        fullNameKm: fullNameKm.trim() || undefined,
        ageGroup,
        diabetesType,
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        emergencyContactRelation: emergencyRel.trim()
      });
      onRefresh();
      alert(t('saveSuccess') || 'Patient profile updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update patient profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-khmer">
            {t('patientProfile') || 'Patient Profile & Personalization'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Clinical identification and emergency contact info
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('fullName')}</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('fullNameKm')}</label>
          <input
            type="text"
            value={fullNameKm}
            onChange={(e) => setFullNameKm(e.target.value)}
            placeholder="ឈ្មោះជាភាសាខ្មែរ"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none font-khmer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('ageGroup')}</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="40-49">40-49</option>
            <option value="50-59">50-59</option>
            <option value="60-69">60-69</option>
            <option value="70-79">70-79</option>
            <option value="80+">80+</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('diabetesType')}</label>
          <select
            value={diabetesType}
            onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="type_2">{tPatient('type2') || 'Type 2 Diabetes'}</option>
            <option value="type_1">{tPatient('type1') || 'Type 1 Diabetes'}</option>
            <option value="prediabetes">{tPatient('prediabetes') || 'Prediabetes'}</option>
            <option value="gestational">{tPatient('gestational') || 'Gestational'}</option>
            <option value="other">{tPatient('otherType') || 'Other'}</option>
            <option value="unknown">{tPatient('unknown') || 'Unknown / Not specified'}</option>
          </select>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
          <PhoneCall className="w-4 h-4 mr-2 text-teal-600" />
          {t('emergencyContact') || 'Emergency Contact'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Name</label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Sokha"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Relationship</label>
            <input
              type="text"
              value={emergencyRel}
              onChange={(e) => setEmergencyRel(e.target.value)}
              placeholder="e.g. Daughter"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+855 12 345 678"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-2xl shadow-xs transition flex items-center space-x-1.5"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? 'Saving...' : t('saveChanges') || 'Save Profile Changes'}</span>
      </button>
    </form>
  );
}
