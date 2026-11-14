// ============================================================================
// Family Diabetes Care - TypeScript Core Domain Definitions
// ============================================================================

export type UserRole = 'family_admin' | 'patient' | 'clinician';

export type DiabetesType = 'unknown' | 'type_1' | 'type_2' | 'other';

export type MeasurementType =
  | 'fasting'
  | 'before_meal'
  | '1h_after_meal'
  | '2h_after_meal'
  | 'bedtime'
  | 'random'
  | 'other';

export type TargetStatus =
  | 'critical_low'
  | 'low'
  | 'normal'
  | 'high'
  | 'critical_high';

export type GlucoseStatus =
  | 'below_target'
  | 'within_target'
  | 'above_target'
  | 'target_not_configured';

export type TargetSource = 'general_guideline' | 'clinician_configured';

export type TargetApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type AlertCategory = 'critical' | 'attention' | 'info';

export type AlertType =
  | 'critical_low'
  | 'attention_low'
  | 'target_exceeded'
  | 'repeated_high'
  | 'severe_symptoms'
  | 'reminder'
  | 'daily_summary';

export type ClinicianApprovalStatus = 'unconfirmed' | 'clinician_approved';

export type MedicationDoseStatus = 'taken' | 'missed' | 'skipped_by_doctor';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ActivityType = 'walking' | 'light_stretching' | 'gardening' | 'household' | 'other';

export type ActivityIntensity = 'light' | 'moderate' | 'vigorous';

export type ReminderType = 'glucose' | 'medication' | 'doctor_visit' | 'hba1c_test';

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  preferredLanguage: 'km' | 'en';
}

export interface PatientProfile {
  id: string;
  fullName: string;
  fullNameKm?: string;
  dateOfBirth?: string;
  ageGroup: string; // e.g. "60-69"
  age: number;
  diabetesType: DiabetesType;
  diagnosisStatus: string;
  currentMedicationsSummary: string;
  allergies: string[];
  medicalHistory?: string;
  doctorName?: string;
  doctorPhone?: string;
  doctorClinic?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  preferredGlucoseUnit: 'mg/dL' | 'mmol/L';
  timezone: string;
  telegramChatId?: string;
  telegramNotificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  userId: string;
  userName: string;
  relationship: string;
  role: UserRole;
  accessLevel: 'full' | 'read_and_record' | 'read_only';
}

export interface GlucoseTarget {
  id: string;
  patientId: string;
  measurementType: MeasurementType;
  minValue?: number;
  maxValue?: number;
  targetMin: number;
  targetMax: number;
  lowAlertThreshold?: number;
  highAlertThreshold?: number;
  unit?: 'mg/dL';
  source?: TargetSource;
  approvalStatus?: TargetApprovalStatus;
  effectiveFrom?: string;
  effectiveUntil?: string;
  effectiveDate: string;
  notes?: string;
  guidelineSource?: string;
  guidelineVersion?: string;
  createdBy?: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  configuredBy?: string;
  configuredByName?: string;
  clinicianApprovalStatus: ClinicianApprovalStatus;
  clinicianNotes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlucoseTargetAuditLog {
  id: string;
  targetId?: string;
  patientId: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'expired';
  oldValues?: Partial<GlucoseTarget>;
  newValues?: Partial<GlucoseTarget>;
  changedBy?: string;
  changedByName?: string;
  reason?: string;
  createdAt: string;
}

export interface GeneralGuidelineReference {
  measurementType: MeasurementType;
  minMgDl?: number;
  maxMgDl?: number;
  labelEn: string;
  labelKm: string;
  notesEn: string;
  notesKm: string;
  guidelineSource: string;
  guidelineVersion: string;
}

export interface GlucoseEvaluationResult {
  status: GlucoseStatus;
  valueMgDl: number;
  measurementType: MeasurementType;
  measuredAt: string;
  activeTarget?: GlucoseTarget;
  generalReference?: GeneralGuidelineReference;
  differenceFromMin?: number;
  differenceFromMax?: number;
  explanationEn: string;
  explanationKm: string;
  isEducationalReferenceOnly: boolean;
}

export interface GlucoseRecord {
  id: string;
  patientId: string;
  valueMgDl: number;
  measurementType: MeasurementType;
  measuredAt: string; // ISO 8601 UTC
  mealDescription?: string;
  symptoms?: string[];
  notes?: string;
  recordedBy: string;
  recordedByName?: string;
  recordedByRole?: UserRole;
  targetStatus: TargetStatus;
  alertTriggered: boolean;
  alertId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  timingInstructions?: string;
  prescribingDoctor?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  status: MedicationDoseStatus;
  scheduledTime: string;
  recordedTime: string;
  recordedBy: string;
  recordedByName?: string;
  notes?: string;
  createdAt: string;
}

export interface MealLog {
  id: string;
  patientId: string;
  mealType: MealType;
  loggedAt: string;
  foodDescription: string;
  portionSize?: string;
  carbEstimate?: 'low' | 'moderate' | 'high';
  cambodianDishId?: string;
  notes?: string;
  recordedBy: string;
  recordedByName?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  patientId: string;
  activityType: ActivityType;
  durationMinutes: number;
  intensity: ActivityIntensity;
  loggedAt: string;
  notes?: string;
  recordedBy: string;
  recordedByName?: string;
  createdAt: string;
}

export interface LifestyleJournal {
  id: string;
  patientId: string;
  logDate: string; // YYYY-MM-DD
  waterGlasses: number;
  sleepHours: number;
  symptoms: string[];
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  patientId: string;
  reminderType: ReminderType;
  title: string;
  titleKm?: string;
  timeOfDay: string; // HH:mm
  daysOfWeek: number[]; // 1=Mon, 7=Sun
  isActive: boolean;
  lastTriggeredAt?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationAlert {
  id: string;
  patientId: string;
  glucoseRecordId?: string;
  category: AlertCategory;
  alertType: AlertType;
  title: string;
  titleKm?: string;
  message: string;
  messageKm?: string;
  guidanceSummary?: string;
  guidanceSummaryKm?: string;
  channel: 'telegram' | 'in_app' | 'both';
  deliveryStatus: 'pending' | 'sent' | 'failed' | 'retrying';
  deliveryAttempts: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface HealthReportSummary {
  periodDays: number;
  startDate: string;
  endDate: string;
  totalMeasurements: number;
  fastingAverage: number | null;
  postMealAverage: number | null;
  overallLowest: number | null;
  overallHighest: number | null;
  belowTargetCount: number;
  aboveTargetCount: number;
  inTargetCount: number;
  inTargetPercentage: number;
  trend: 'stable' | 'increasing' | 'decreasing' | 'variable';
  medicationAdherenceRate: number; // percentage
  dosesTaken: number;
  dosesScheduled: number;
  lifestyleInsights: {
    avgWaterGlasses: number;
    avgSleepHours: number;
    totalActivityMinutes: number;
    reportedSymptoms: { symptom: string; count: number }[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --------------------------------------------------------------------------
// Knowledge & Health Information Types
// --------------------------------------------------------------------------

export type KnowledgeCategory =
  | 'understanding'
  | 'testing_guide'
  | 'glucose_hba1c'
  | 'hypo_hyper'
  | 'medications'
  | 'nutrition';

export interface HealthKnowledgeArticle {
  id: string;
  category: KnowledgeCategory;
  title: string;
  titleKm: string;
  summary: string;
  summaryKm: string;
  contentHtml?: string;
  contentKm?: string;
  sourceName: string;
  sourceUrl: string;
  lastReviewed?: string;
  clinicalCode?: string;
  tags?: string[];
  isCurated?: boolean;
}

export interface FoodNutrientValues {
  caloriesKcal?: number;
  carbohydratesG?: number;
  totalSugarsG?: number;
  dietaryFiberG?: number;
  proteinG?: number;
  totalFatG?: number;
}

export interface FoodNutritionItem {
  fdcId: number;
  description: string;
  descriptionKm?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingText?: string;
  per100g: FoodNutrientValues;
  perServing?: FoodNutrientValues;
  foodCategory?: string;
  sourceUrl?: string;
}

