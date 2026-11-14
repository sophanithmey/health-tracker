// ============================================================================
// Zod Validation Schemas for Family Diabetes Care
// ============================================================================

import { z } from 'zod';

export const GlucoseReadingSchema = z.object({
  patientId: z.string().uuid().optional(),
  valueMgDl: z
    .number()
    .min(20, { message: 'Glucose reading must be at least 20 mg/dL' })
    .max(600, { message: 'Glucose reading must be 600 mg/dL or below' }),
  measurementType: z.enum([
    'fasting',
    'before_meal',
    '1h_after_meal',
    '2h_after_meal',
    'bedtime',
    'other'
  ]),
  measuredAt: z.string().datetime().or(z.string().min(1)),
  mealDescription: z.string().max(500).optional(),
  symptoms: z.array(z.string()).optional().default([]),
  notes: z.string().max(1000).optional(),
  recordedBy: z.string().optional(),
  recordedByName: z.string().optional()
});

export const GlucoseTargetSchema = z.object({
  patientId: z.string().uuid().optional(),
  measurementType: z.enum([
    'fasting',
    'before_meal',
    '1h_after_meal',
    '2h_after_meal',
    'bedtime',
    'other'
  ]),
  targetMin: z.number().min(40).max(250),
  targetMax: z.number().min(60).max(400),
  lowAlertThreshold: z.number().min(40).max(100).default(70),
  highAlertThreshold: z.number().min(120).max(400).default(180),
  clinicianApprovalStatus: z.enum(['unconfirmed', 'clinician_approved']).default('unconfirmed'),
  clinicianNotes: z.string().max(1000).optional()
}).refine((data) => data.targetMax > data.targetMin, {
  message: 'Target maximum must be greater than target minimum',
  path: ['targetMax']
});

export const MedicationSchema = z.object({
  patientId: z.string().uuid().optional(),
  name: z.string().min(1, 'Medication name is required').max(150),
  dosage: z.string().min(1, 'Dosage is required (e.g. 500mg)').max(100),
  frequency: z.string().min(1, 'Frequency is required (e.g. Once daily)').max(100),
  timingInstructions: z.string().max(300).optional(),
  prescribingDoctor: z.string().max(150).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional()
});

export const MedicationLogSchema = z.object({
  medicationId: z.string().min(1),
  patientId: z.string().uuid().optional(),
  status: z.enum(['taken', 'missed', 'skipped_by_doctor']),
  scheduledTime: z.string().min(1),
  recordedTime: z.string().optional(),
  notes: z.string().max(500).optional()
});

export const MealLogSchema = z.object({
  patientId: z.string().uuid().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  loggedAt: z.string().min(1),
  foodDescription: z.string().min(1, 'Food description is required').max(500),
  portionSize: z.string().max(100).optional(),
  carbEstimate: z.enum(['low', 'moderate', 'high']).optional(),
  cambodianDishId: z.string().optional(),
  notes: z.string().max(500).optional()
});

export const ActivityLogSchema = z.object({
  patientId: z.string().uuid().optional(),
  activityType: z.enum(['walking', 'light_stretching', 'gardening', 'household', 'other']),
  durationMinutes: z.number().int().min(1).max(720),
  intensity: z.enum(['light', 'moderate', 'vigorous']).default('light'),
  loggedAt: z.string().min(1),
  notes: z.string().max(500).optional()
});

export const LifestyleJournalSchema = z.object({
  patientId: z.string().uuid().optional(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  waterGlasses: z.number().min(0).max(40).default(0),
  sleepHours: z.number().min(0).max(24).default(0),
  symptoms: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional()
});

export const ReminderSchema = z.object({
  patientId: z.string().uuid().optional(),
  reminderType: z.enum(['glucose', 'medication', 'doctor_visit', 'hba1c_test']),
  title: z.string().min(1).max(200),
  titleKm: z.string().max(200).optional(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Must be HH:mm or HH:mm:ss format'),
  daysOfWeek: z.array(z.number().min(1).max(7)).min(1),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional()
});

export const TelegramConfigSchema = z.object({
  patientId: z.string().uuid().optional(),
  chatId: z.string().min(1, 'Chat ID is required'),
  notificationsEnabled: z.boolean().default(true)
});

export const PatientProfileUpdateSchema = z.object({
  patientId: z.string().optional(),
  fullName: z.string().min(1).max(100).optional(),
  fullNameKm: z.string().max(100).optional(),
  ageGroup: z.string().optional(),
  diabetesType: z.enum(['unknown', 'type_1', 'type_2', 'other']).optional(),
  diagnosisStatus: z.string().optional(),
  currentMedicationsSummary: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  doctorClinic: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  preferredGlucoseUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
  timezone: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramNotificationsEnabled: z.boolean().optional()
});

