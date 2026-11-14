// ============================================================================
// Clean Store for Family Diabetes Care (No Mock / Seed Data)
// All records start empty and are populated via Supabase or user entries
// ============================================================================

import {
  PatientProfile,
  UserProfile,
  FamilyMember,
  GlucoseTarget,
  GlucoseRecord,
  Medication,
  MedicationLog,
  MealLog,
  ActivityLog,
  LifestyleJournal,
  ReminderItem,
  NotificationAlert,
  UserRole,
  GlucoseTargetAuditLog
} from '@/types';

export const PATIENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
export const ADMIN_USER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
export const PATIENT_USER_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

// 1. Initial Patient Profile Template (Default placeholder if not yet set in Supabase)
export let initialPatientProfile: PatientProfile = {
  id: PATIENT_ID,
  fullName: 'Sokha Mey',
  fullNameKm: 'ម៉ាក់ សុខា',
  dateOfBirth: '1962-04-15',
  ageGroup: '60-69',
  age: 64,
  diabetesType: 'unknown', // Configurable
  diagnosisStatus: 'under_monitoring',
  currentMedicationsSummary: 'Oral medication',
  allergies: [],
  medicalHistory: '',
  doctorName: '',
  doctorPhone: '',
  doctorClinic: '',
  emergencyContactName: 'Family Caregiver',
  emergencyContactPhone: '',
  emergencyContactRelation: 'Caregiver',
  preferredGlucoseUnit: 'mg/dL',
  timezone: 'Asia/Phnom_Penh',
  telegramChatId: '',
  telegramNotificationsEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function updatePatientProfileInStore(updates: Partial<PatientProfile>): PatientProfile {
  initialPatientProfile = {
    ...initialPatientProfile,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return initialPatientProfile;
}

export const CLINICIAN_USER_ID = 'd4e5f6a7-b8c9-0123-def0-123456789012';

// 2. Active Session Users
export const users: UserProfile[] = [
  {
    id: ADMIN_USER_ID,
    fullName: 'Family Caregiver',
    role: 'family_admin',
    phone: '',
    preferredLanguage: 'km'
  },
  {
    id: PATIENT_USER_ID,
    fullName: 'Mom Sokha',
    role: 'patient',
    phone: '',
    preferredLanguage: 'km'
  },
  {
    id: CLINICIAN_USER_ID,
    fullName: 'Dr. Chea Sambath (Endocrinologist)',
    role: 'clinician',
    phone: '+855 12 345 678',
    preferredLanguage: 'km'
  }
];

export let currentActiveRole: UserRole = 'family_admin';

export function setActiveRole(role: UserRole) {
  currentActiveRole = role;
}

export function getCurrentUser(): UserProfile {
  if (currentActiveRole === 'clinician') return users[2];
  if (currentActiveRole === 'patient') return users[1];
  return users[0];
}

// 3. Family Access Mappings
export const familyMembers: FamilyMember[] = [
  {
    id: 'fam-admin',
    patientId: PATIENT_ID,
    userId: ADMIN_USER_ID,
    userName: 'Caregiver',
    relationship: 'Caregiver (Family Admin)',
    role: 'family_admin',
    accessLevel: 'full'
  },
  {
    id: 'fam-patient',
    patientId: PATIENT_ID,
    userId: PATIENT_USER_ID,
    userName: 'Mom Sokha',
    relationship: 'Self (Patient)',
    role: 'patient',
    accessLevel: 'read_and_record'
  },
  {
    id: 'fam-clinician',
    patientId: PATIENT_ID,
    userId: CLINICIAN_USER_ID,
    userName: 'Dr. Chea Sambath',
    relationship: 'Attending Physician',
    role: 'clinician',
    accessLevel: 'full'
  }
];

// 4. Default Clinical Target Guidelines (Educational unconfirmed reference)
export const targets: GlucoseTarget[] = [
  {
    id: 'tgt-fasting',
    patientId: PATIENT_ID,
    measurementType: 'fasting',
    minValue: 80,
    maxValue: 130,
    targetMin: 80,
    targetMax: 130,
    lowAlertThreshold: 70,
    highAlertThreshold: 140,
    unit: 'mg/dL',
    source: 'general_guideline',
    approvalStatus: 'pending',
    effectiveFrom: new Date().toISOString(),
    effectiveDate: new Date().toISOString(),
    guidelineSource: 'ADA Standards of Care',
    guidelineVersion: '2026',
    configuredByName: 'Clinical Reference',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes: 'Standard educational reference range (80-130 mg/dL). General reference only.',
    isActive: true
  },
  {
    id: 'tgt-postmeal',
    patientId: PATIENT_ID,
    measurementType: '2h_after_meal',
    minValue: 90,
    maxValue: 180,
    targetMin: 90,
    targetMax: 180,
    lowAlertThreshold: 70,
    highAlertThreshold: 180,
    unit: 'mg/dL',
    source: 'general_guideline',
    approvalStatus: 'pending',
    effectiveFrom: new Date().toISOString(),
    effectiveDate: new Date().toISOString(),
    guidelineSource: 'ADA Standards of Care',
    guidelineVersion: '2026',
    configuredByName: 'Clinical Reference',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes: 'Standard post-prandial threshold under 180 mg/dL. General reference only.',
    isActive: true
  }
];

export const targetAuditLogs: GlucoseTargetAuditLog[] = [];

// 5. Raw Data Collections (ALL EMPTY - Loaded from Supabase or added live by user)
export const glucoseRecords: GlucoseRecord[] = [];
export const medications: Medication[] = [];
export const medicationLogs: MedicationLog[] = [];
export const mealLogs: MealLog[] = [];
export const activityLogs: ActivityLog[] = [];
export const lifestyleJournals: LifestyleJournal[] = [];
export const reminders: ReminderItem[] = [];
export const notifications: NotificationAlert[] = [];
