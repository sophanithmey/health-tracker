'use client';

import React from 'react';
import { PatientProfile } from '@/types';
import { PatientProfileSection } from './PatientProfileSection';
import { TelegramSettingsSection } from './TelegramSettingsSection';
import { RoleAndLanguageSection } from './RoleAndLanguageSection';

interface SettingsViewProps {
  patient: PatientProfile;
  onRefresh: () => void;
}

export function SettingsView({ patient, onRefresh }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Patient Profile & Personalization */}
      <PatientProfileSection patient={patient} onRefresh={onRefresh} />

      {/* 2. Telegram Two-Way Bot Setup */}
      <TelegramSettingsSection patient={patient} onRefresh={onRefresh} />

      {/* 3. Role & Language Switching */}
      <RoleAndLanguageSection />
    </div>
  );
}
