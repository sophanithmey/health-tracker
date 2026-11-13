// ============================================================================
// Seeded In-Memory Store for Family Diabetes Care
// High-fidelity patient case: Mom (Age 64, Oral Medication, 148 mg/dL fasting reading)
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
  NotificationAlert
} from '@/types';

export const PATIENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
export const ADMIN_USER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
export const PATIENT_USER_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

// 1. Initial Patient Profile
export let initialPatientProfile: PatientProfile = {
  id: PATIENT_ID,
  fullName: 'Sokha Mey',
  fullNameKm: 'ម៉ាក់ សុខា',
  dateOfBirth: '1962-04-15',
  ageGroup: '60-69',
  age: 64,
  diabetesType: 'unknown', // Must remain configurable
  diagnosisStatus: 'under_monitoring',
  currentMedicationsSummary: 'Metformin 500mg (Oral Medication)',
  allergies: ['Penicillin'],
  medicalHistory:
    'Mild hypertension, elevated fasting glucose monitored by family physician. Regular walking routine.',
  doctorName: 'Dr. Chanthy Keo',
  doctorPhone: '+855 12 345 678',
  doctorClinic: 'Phnom Penh Diabetes & Endocrinology Clinic',
  emergencyContactName: 'Dara Mey (Son)',
  emergencyContactPhone: '+855 17 888 999',
  emergencyContactRelation: 'Son (កូនប្រុស)',
  preferredGlucoseUnit: 'mg/dL',
  timezone: 'Asia/Phnom_Penh',
  telegramChatId: '-100123456789',
  telegramNotificationsEnabled: true,
  createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
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

// 2. Users & Roles
export const users: UserProfile[] = [
  {
    id: ADMIN_USER_ID,
    fullName: 'Dara Mey',
    role: 'family_admin',
    phone: '+855 17 888 999',
    preferredLanguage: 'km'
  },
  {
    id: PATIENT_USER_ID,
    fullName: 'Sokha Mey (Mom)',
    role: 'patient',
    phone: '+855 12 888 777',
    preferredLanguage: 'km'
  }
];

// Current active session role (can be toggled in UI)
export let currentActiveRole: 'family_admin' | 'patient' = 'family_admin';

export function setActiveRole(role: 'family_admin' | 'patient') {
  currentActiveRole = role;
}

export function getCurrentUser(): UserProfile {
  return currentActiveRole === 'family_admin' ? users[0] : users[1];
}

// 3. Family Members
export const familyMembers: FamilyMember[] = [
  {
    id: 'fam-1',
    patientId: PATIENT_ID,
    userId: ADMIN_USER_ID,
    userName: 'Dara Mey',
    relationship: 'Son (Family Admin)',
    role: 'family_admin',
    accessLevel: 'full'
  },
  {
    id: 'fam-2',
    patientId: PATIENT_ID,
    userId: PATIENT_USER_ID,
    userName: 'Sokha Mey',
    relationship: 'Self (Patient)',
    role: 'patient',
    accessLevel: 'read_and_record'
  }
];

// 4. Personalized Glucose Targets (Educational Reference, unconfirmed until clinician signs off)
export const targets: GlucoseTarget[] = [
  {
    id: 'tgt-1',
    patientId: PATIENT_ID,
    measurementType: 'fasting',
    targetMin: 80,
    targetMax: 130, // Reference 80-130
    lowAlertThreshold: 70,
    highAlertThreshold: 140,
    effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    configuredByName: 'Dara Mey',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes:
      'Standard pre-meal/fasting educational range (80-130 mg/dL). Pending personalized target from Dr. Chanthy Keo.',
    isActive: true
  },
  {
    id: 'tgt-2',
    patientId: PATIENT_ID,
    measurementType: 'before_meal',
    targetMin: 80,
    targetMax: 130,
    lowAlertThreshold: 70,
    highAlertThreshold: 140,
    effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    configuredByName: 'Dara Mey',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes: 'Standard pre-meal target range.',
    isActive: true
  },
  {
    id: 'tgt-3',
    patientId: PATIENT_ID,
    measurementType: '2h_after_meal',
    targetMin: 90,
    targetMax: 180, // Guideline < 180 mg/dL
    lowAlertThreshold: 70,
    highAlertThreshold: 180,
    effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    configuredByName: 'Dara Mey',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes: 'Standard 2-hour post-prandial threshold under 180 mg/dL.',
    isActive: true
  },
  {
    id: 'tgt-4',
    patientId: PATIENT_ID,
    measurementType: 'bedtime',
    targetMin: 100,
    targetMax: 140,
    lowAlertThreshold: 75,
    highAlertThreshold: 150,
    effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    configuredByName: 'Dara Mey',
    clinicianApprovalStatus: 'unconfirmed',
    clinicianNotes: 'Bedtime safety target to avoid nocturnal hypoglycemia.',
    isActive: true
  }
];

// Helper to generate past days dates
const now = Date.now();
const oneHour = 3600000;
const oneDay = 86400000;

// 5. Glucose Records
// Notice: Includes the reported example reading: 148 mg/dL (fasting, before breakfast)
export const glucoseRecords: GlucoseRecord[] = [
  // Today's Readings
  {
    id: 'rec-latest-148',
    patientId: PATIENT_ID,
    valueMgDl: 148, // The prompt's example reading!
    measurementType: 'fasting',
    measuredAt: new Date(now - 3 * oneHour).toISOString(), // 3 hours ago this morning
    mealDescription: 'Before breakfast, fasting for 10 hours',
    symptoms: ['Slight morning thirst'],
    notes: 'Reported example reading. Above fasting target (80-130 mg/dL).',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey (Caregiver)',
    recordedByRole: 'family_admin',
    targetStatus: 'high',
    alertTriggered: true,
    alertId: 'alert-148',
    createdAt: new Date(now - 3 * oneHour).toISOString(),
    updatedAt: new Date(now - 3 * oneHour).toISOString()
  },
  // Yesterday
  {
    id: 'rec-yesterday-post',
    patientId: PATIENT_ID,
    valueMgDl: 156,
    measurementType: '2h_after_meal',
    measuredAt: new Date(now - oneDay + 5 * oneHour).toISOString(),
    mealDescription: 'Lunch: Samlor Korko with 1 cup white rice and steamed fish',
    symptoms: [],
    notes: 'Within post-meal target (<180 mg/dL)',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    recordedByRole: 'patient',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - oneDay + 5 * oneHour).toISOString(),
    updatedAt: new Date(now - oneDay + 5 * oneHour).toISOString()
  },
  {
    id: 'rec-yesterday-fasting',
    patientId: PATIENT_ID,
    valueMgDl: 138,
    measurementType: 'fasting',
    measuredAt: new Date(now - oneDay).toISOString(),
    mealDescription: 'Fasting before breakfast',
    symptoms: [],
    notes: 'Above fasting target of 130 mg/dL',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey (Caregiver)',
    recordedByRole: 'family_admin',
    targetStatus: 'high',
    alertTriggered: true,
    alertId: 'alert-138',
    createdAt: new Date(now - oneDay).toISOString(),
    updatedAt: new Date(now - oneDay).toISOString()
  },
  // 2 days ago
  {
    id: 'rec-day2-post',
    patientId: PATIENT_ID,
    valueMgDl: 162,
    measurementType: '2h_after_meal',
    measuredAt: new Date(now - 2 * oneDay + 6 * oneHour).toISOString(),
    mealDescription: 'Dinner: Stir-fried water spinach with tofu and 1 small bowl rice',
    symptoms: [],
    notes: 'Well within post-meal limit',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    recordedByRole: 'patient',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 2 * oneDay + 6 * oneHour).toISOString(),
    updatedAt: new Date(now - 2 * oneDay + 6 * oneHour).toISOString()
  },
  {
    id: 'rec-day2-fasting',
    patientId: PATIENT_ID,
    valueMgDl: 124,
    measurementType: 'fasting',
    measuredAt: new Date(now - 2 * oneDay).toISOString(),
    mealDescription: 'Fasting before breakfast',
    symptoms: [],
    notes: 'Good fasting reading within 80-130 range',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    recordedByRole: 'patient',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 2 * oneDay).toISOString(),
    updatedAt: new Date(now - 2 * oneDay).toISOString()
  },
  // 3 days ago
  {
    id: 'rec-day3-post',
    patientId: PATIENT_ID,
    valueMgDl: 172,
    measurementType: '2h_after_meal',
    measuredAt: new Date(now - 3 * oneDay + 5 * oneHour).toISOString(),
    mealDescription: 'Lunch: Num Banh Chok with abundant fresh herbs and vegetable platter',
    symptoms: [],
    notes: 'Post-meal under 180 mg/dL',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey (Caregiver)',
    recordedByRole: 'family_admin',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 3 * oneDay + 5 * oneHour).toISOString(),
    updatedAt: new Date(now - 3 * oneDay + 5 * oneHour).toISOString()
  },
  {
    id: 'rec-day3-fasting',
    patientId: PATIENT_ID,
    valueMgDl: 129,
    measurementType: 'fasting',
    measuredAt: new Date(now - 3 * oneDay).toISOString(),
    mealDescription: 'Fasting before breakfast',
    symptoms: [],
    notes: 'Normal fasting reading',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    recordedByRole: 'patient',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 3 * oneDay).toISOString(),
    updatedAt: new Date(now - 3 * oneDay).toISOString()
  },
  // 4 days ago
  {
    id: 'rec-day4-fasting',
    patientId: PATIENT_ID,
    valueMgDl: 132,
    measurementType: 'fasting',
    measuredAt: new Date(now - 4 * oneDay).toISOString(),
    mealDescription: 'Fasting morning',
    symptoms: [],
    notes: 'Borderline high',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey (Caregiver)',
    recordedByRole: 'family_admin',
    targetStatus: 'high',
    alertTriggered: false,
    createdAt: new Date(now - 4 * oneDay).toISOString(),
    updatedAt: new Date(now - 4 * oneDay).toISOString()
  },
  // 5 days ago
  {
    id: 'rec-day5-post',
    patientId: PATIENT_ID,
    valueMgDl: 149,
    measurementType: '2h_after_meal',
    measuredAt: new Date(now - 5 * oneDay + 6 * oneHour).toISOString(),
    mealDescription: 'Dinner: Steamed Fish Amok with noni leaves',
    symptoms: [],
    notes: 'Great post-meal reading',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    recordedByRole: 'patient',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 5 * oneDay + 6 * oneHour).toISOString(),
    updatedAt: new Date(now - 5 * oneDay + 6 * oneHour).toISOString()
  },
  {
    id: 'rec-day5-fasting',
    patientId: PATIENT_ID,
    valueMgDl: 118,
    measurementType: 'fasting',
    measuredAt: new Date(now - 5 * oneDay).toISOString(),
    mealDescription: 'Fasting morning reading',
    symptoms: [],
    notes: 'Normal target reading',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey (Caregiver)',
    recordedByRole: 'family_admin',
    targetStatus: 'normal',
    alertTriggered: false,
    createdAt: new Date(now - 5 * oneDay).toISOString(),
    updatedAt: new Date(now - 5 * oneDay).toISOString()
  }
];

// 6. Medications
export const medications: Medication[] = [
  {
    id: 'med-metformin',
    patientId: PATIENT_ID,
    name: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Once daily (ព្រឹក)',
    timingInstructions: 'Take with breakfast and a full glass of water',
    prescribingDoctor: 'Dr. Chanthy Keo',
    startDate: '2026-01-10',
    isActive: true,
    notes: 'Oral medication for blood glucose management. Do not alter dose without doctor review.',
    createdAt: new Date(now - 60 * oneDay).toISOString(),
    updatedAt: new Date(now - 60 * oneDay).toISOString()
  }
];

// 7. Medication Logs (Recent dose history)
export const medicationLogs: MedicationLog[] = [
  {
    id: 'log-med-today',
    medicationId: 'med-metformin',
    medicationName: 'Metformin HCl 500mg',
    patientId: PATIENT_ID,
    status: 'taken',
    scheduledTime: new Date(now - 2 * oneHour).toISOString(),
    recordedTime: new Date(now - 2 * oneHour).toISOString(),
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey',
    notes: 'Taken with breakfast as instructed',
    createdAt: new Date(now - 2 * oneHour).toISOString()
  },
  {
    id: 'log-med-yesterday',
    medicationId: 'med-metformin',
    medicationName: 'Metformin HCl 500mg',
    patientId: PATIENT_ID,
    status: 'taken',
    scheduledTime: new Date(now - oneDay + oneHour).toISOString(),
    recordedTime: new Date(now - oneDay + oneHour).toISOString(),
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    notes: 'Taken on time',
    createdAt: new Date(now - oneDay + oneHour).toISOString()
  }
];

// 8. Reminders
export const reminders: ReminderItem[] = [
  {
    id: 'rem-fasting-glucose',
    patientId: PATIENT_ID,
    reminderType: 'glucose',
    title: 'Fasting Blood Sugar Check',
    titleKm: 'ពិនិត្យជាតិស្ករពេលព្រឹកព្រលឹម (មុនអាហារ)',
    timeOfDay: '06:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isActive: true,
    notes: 'Check blood glucose before breakfast',
    createdAt: new Date(now - 30 * oneDay).toISOString()
  },
  {
    id: 'rem-morning-med',
    patientId: PATIENT_ID,
    reminderType: 'medication',
    title: 'Metformin 500mg Morning Dose',
    titleKm: 'លេបថ្នាំជាតិស្ករពេលព្រឹក (Metformin 500mg)',
    timeOfDay: '07:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isActive: true,
    notes: 'Take with breakfast and plenty of water',
    createdAt: new Date(now - 30 * oneDay).toISOString()
  },
  {
    id: 'rem-post-lunch',
    patientId: PATIENT_ID,
    reminderType: 'glucose',
    title: 'Post-Lunch Glucose Check (2h after meal)',
    titleKm: 'ពិនិត្យជាតិស្ករក្រោយបាយថ្ងៃត្រង់ (២ម៉ោង)',
    timeOfDay: '13:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isActive: true,
    notes: 'Measure glucose 2 hours after lunch',
    createdAt: new Date(now - 30 * oneDay).toISOString()
  },
  {
    id: 'rem-hba1c',
    patientId: PATIENT_ID,
    reminderType: 'hba1c_test',
    title: 'Upcoming 3-Month HbA1c Lab Test',
    titleKm: 'ការណាត់ជួបពិនិត្យឈាមធំ HbA1c នៅគ្លីនិក',
    timeOfDay: '08:30',
    daysOfWeek: [6], // Saturday
    isActive: true,
    notes: 'Clinic appointment with Dr. Chanthy Keo',
    createdAt: new Date(now - 30 * oneDay).toISOString()
  }
];

// 9. Notifications & Alerts
export const notifications: NotificationAlert[] = [
  {
    id: 'alert-148',
    patientId: PATIENT_ID,
    glucoseRecordId: 'rec-latest-148',
    category: 'attention',
    alertType: 'target_exceeded',
    title: 'Blood Sugar Attention: 148 mg/dL',
    titleKm: '⚠️ ការយកចិត្តទុកដាក់ជាតិស្ករ៖ ១៤៨ mg/dL',
    message: "Mom's fasting reading of 148 mg/dL is above the configured target (80-130 mg/dL).",
    messageKm: 'កម្រិតជាតិស្ករមុនអាហាររបស់ម៉ាក់គឺ ១៤៨ mg/dL លើសពីគោលដៅកំណត់ (៨០-១៣០ mg/dL)។',
    guidanceSummary:
      'Please review the reading and continue the prescribed care plan. Ensure adequate hydration with water. Do not take unprescribed extra medication.',
    guidanceSummaryKm:
      'សូមពិនិត្យមើលការវាស់នេះ និងបន្តអនុវត្តផែនការថែទាំ។ ពិសារទឹកស្អាតឱ្យបានគ្រប់គ្រាន់។ សូមកុំលេបថ្នាំលើសវេជ្ជបញ្ជា។',
    channel: 'telegram',
    deliveryStatus: 'sent',
    deliveryAttempts: 1,
    createdAt: new Date(now - 3 * oneHour).toISOString()
  },
  {
    id: 'alert-138',
    patientId: PATIENT_ID,
    glucoseRecordId: 'rec-yesterday-fasting',
    category: 'attention',
    alertType: 'target_exceeded',
    title: 'Blood Sugar Attention: 138 mg/dL',
    titleKm: '⚠️ ការយកចិត្តទុកដាក់ជាតិស្ករ៖ ១៣៨ mg/dL',
    message: "Mom's fasting reading of 138 mg/dL is slightly above the target range.",
    messageKm: 'កម្រិតជាតិស្កររបស់ម៉ាក់ ១៣៨ mg/dL គឺខ្ពស់ជាងកម្រិតគោលដៅបន្តិច។',
    guidanceSummary: 'Monitor during next meal. Maintain active morning routine.',
    guidanceSummaryKm: 'បន្តតាមដានពេលអាហារបន្ទាប់ និងរក្សាសកម្មភាពរាងកាយស្រាលៗ។',
    channel: 'telegram',
    deliveryStatus: 'sent',
    deliveryAttempts: 1,
    createdAt: new Date(now - oneDay).toISOString()
  }
];

// 10. Meal Logs
export const mealLogs: MealLog[] = [
  {
    id: 'meal-today-bk',
    patientId: PATIENT_ID,
    mealType: 'breakfast',
    loggedAt: new Date(now - 2 * oneHour).toISOString(),
    foodDescription: 'Half cup brown rice with steamed egg and sautéed morning glory',
    portionSize: '1 medium plate',
    carbEstimate: 'low',
    cambodianDishId: 'samlor-machu-kroeung',
    notes: 'Good vegetable portion, balanced breakfast',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey',
    createdAt: new Date(now - 2 * oneHour).toISOString()
  },
  {
    id: 'meal-yest-lunch',
    patientId: PATIENT_ID,
    mealType: 'lunch',
    loggedAt: new Date(now - oneDay + 4 * oneHour).toISOString(),
    foodDescription: 'Samlor Korko with fresh fish and plenty of leafy greens, small scoop rice',
    portionSize: '1 bowl stew + 1/2 cup rice',
    carbEstimate: 'low',
    cambodianDishId: 'samlor-korko',
    notes: 'High fiber meal',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    createdAt: new Date(now - oneDay + 4 * oneHour).toISOString()
  }
];

// 11. Activity Logs
export const activityLogs: ActivityLog[] = [
  {
    id: 'act-today-walk',
    patientId: PATIENT_ID,
    activityType: 'walking',
    durationMinutes: 25,
    intensity: 'light',
    loggedAt: new Date(now - 4 * oneHour).toISOString(),
    notes: 'Morning neighborhood garden walk with neighbor',
    recordedBy: PATIENT_USER_ID,
    recordedByName: 'Mom (Self)',
    createdAt: new Date(now - 4 * oneHour).toISOString()
  },
  {
    id: 'act-yest-stretch',
    patientId: PATIENT_ID,
    activityType: 'light_stretching',
    durationMinutes: 20,
    intensity: 'light',
    loggedAt: new Date(now - oneDay + 2 * oneHour).toISOString(),
    notes: 'Gentle arm and leg mobility exercises',
    recordedBy: ADMIN_USER_ID,
    recordedByName: 'Dara Mey',
    createdAt: new Date(now - oneDay + 2 * oneHour).toISOString()
  }
];

// 12. Lifestyle Journals (Daily water, sleep, symptoms)
export const lifestyleJournals: LifestyleJournal[] = [
  {
    id: 'journ-today',
    patientId: PATIENT_ID,
    logDate: new Date().toISOString().split('T')[0],
    waterGlasses: 6,
    sleepHours: 7.5,
    symptoms: ['Slight morning thirst'],
    notes: 'Feeling generally good this morning. Slept well.',
    recordedBy: ADMIN_USER_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'journ-yesterday',
    patientId: PATIENT_ID,
    logDate: new Date(now - oneDay).toISOString().split('T')[0],
    waterGlasses: 8,
    sleepHours: 8.0,
    symptoms: [],
    notes: 'Good energy throughout the day.',
    recordedBy: PATIENT_USER_ID,
    createdAt: new Date(now - oneDay).toISOString(),
    updatedAt: new Date(now - oneDay).toISOString()
  }
];
