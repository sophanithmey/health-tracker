// ============================================================================
// Repository Layer for Family Diabetes Care
// Clean server-side data access layer supporting Supabase & In-Memory Fallback
// ============================================================================

import {
  PatientProfile,
  UserProfile,
  GlucoseRecord,
  GlucoseTarget,
  Medication,
  MedicationLog,
  MealLog,
  ActivityLog,
  LifestyleJournal,
  ReminderItem,
  NotificationAlert,
  HealthReportSummary,
  UserRole
} from '@/types';
import * as store from './inMemoryStore';
import { supabaseServer, isSupabaseConfigured } from './supabaseClient';
import { SafeAlertEngine } from '../services/alertEngine';
import { TelegramService } from '../services/telegramService';

export class HealthRepository {
  // --------------------------------------------------------------------------
  // User Session & Permissions
  // --------------------------------------------------------------------------
  public static getCurrentUser(): UserProfile {
    return store.getCurrentUser();
  }

  public static setActiveRole(role: UserRole) {
    store.setActiveRole(role);
  }

  // --------------------------------------------------------------------------
  // Patient Profile
  // --------------------------------------------------------------------------
  public static async getPatientProfile(patientId = store.PATIENT_ID): Promise<PatientProfile> {
    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('patient_profiles')
        .select('*')
        .eq('id', patientId)
        .single();
      if (data && !error) {
        return {
          id: data.id,
          fullName: data.full_name,
          fullNameKm: data.full_name_km,
          dateOfBirth: data.date_of_birth,
          ageGroup: data.age_group,
          age: 64,
          diabetesType: data.diabetes_type,
          diagnosisStatus: data.diagnosis_status,
          currentMedicationsSummary: data.current_medications_summary,
          allergies: data.allergies || [],
          medicalHistory: data.medical_history,
          doctorName: data.doctor_name,
          doctorPhone: data.doctor_phone,
          doctorClinic: data.doctor_clinic,
          emergencyContactName: data.emergency_contact_name,
          emergencyContactPhone: data.emergency_contact_phone,
          emergencyContactRelation: data.emergency_contact_relation,
          preferredGlucoseUnit: data.preferred_glucose_unit,
          timezone: data.timezone,
          telegramChatId: data.telegram_chat_id,
          telegramNotificationsEnabled: data.telegram_notifications_enabled,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    }
    return store.initialPatientProfile;
  }

  public static async updatePatientProfile(
    patientId: string,
    updates: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    if (isSupabaseConfigured && supabaseServer) {
      await supabaseServer
        .from('patient_profiles')
        .update({
          full_name: updates.fullName,
          full_name_km: updates.fullNameKm,
          diabetes_type: updates.diabetesType,
          diagnosis_status: updates.diagnosisStatus,
          current_medications_summary: updates.currentMedicationsSummary,
          allergies: updates.allergies,
          medical_history: updates.medicalHistory,
          doctor_name: updates.doctorName,
          doctor_phone: updates.doctorPhone,
          doctor_clinic: updates.doctorClinic,
          emergency_contact_name: updates.emergencyContactName,
          emergency_contact_phone: updates.emergencyContactPhone,
          emergency_contact_relation: updates.emergencyContactRelation,
          preferred_glucose_unit: updates.preferredGlucoseUnit,
          telegram_chat_id: updates.telegramChatId,
          telegram_notifications_enabled: updates.telegramNotificationsEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);
    }

    return store.updatePatientProfileInStore(updates);
  }

  // --------------------------------------------------------------------------
  // Glucose Targets
  // --------------------------------------------------------------------------
  public static async getGlucoseTargets(patientId = store.PATIENT_ID): Promise<GlucoseTarget[]> {
    return store.targets.filter((t) => t.patientId === patientId);
  }

  public static async getTargetForType(
    measurementType: GlucoseRecord['measurementType'],
    patientId = store.PATIENT_ID
  ): Promise<GlucoseTarget | undefined> {
    const list = await this.getGlucoseTargets(patientId);
    return list.find((t) => t.measurementType === measurementType && t.isActive);
  }

  public static async saveGlucoseTarget(
    targetData: Omit<GlucoseTarget, 'id' | 'effectiveDate' | 'isActive'> & { id?: string }
  ): Promise<GlucoseTarget> {
    const currentUser = this.getCurrentUser();
    const existingIndex = store.targets.findIndex(
      (t) => t.patientId === targetData.patientId && t.measurementType === targetData.measurementType
    );

    const newTarget: GlucoseTarget = {
      id: targetData.id || `tgt-${Date.now()}`,
      patientId: targetData.patientId,
      measurementType: targetData.measurementType,
      targetMin: targetData.targetMin,
      targetMax: targetData.targetMax,
      lowAlertThreshold: targetData.lowAlertThreshold,
      highAlertThreshold: targetData.highAlertThreshold,
      effectiveDate: new Date().toISOString(),
      configuredBy: currentUser.id,
      configuredByName: currentUser.fullName,
      clinicianApprovalStatus: targetData.clinicianApprovalStatus || 'unconfirmed',
      clinicianNotes: targetData.clinicianNotes,
      isActive: true
    };

    if (existingIndex >= 0) {
      store.targets[existingIndex] = newTarget;
    } else {
      store.targets.push(newTarget);
    }

    return newTarget;
  }

  // --------------------------------------------------------------------------
  // Glucose Records
  // --------------------------------------------------------------------------
  public static async getGlucoseRecords(filters?: {
    patientId?: string;
    measurementType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ records: GlucoseRecord[]; total: number }> {
    let list = [...store.glucoseRecords];

    if (filters?.patientId) {
      list = list.filter((r) => r.patientId === filters.patientId);
    }
    if (filters?.measurementType && filters.measurementType !== 'all') {
      list = list.filter((r) => r.measurementType === filters.measurementType);
    }
    if (filters?.startDate) {
      list = list.filter((r) => r.measuredAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.measuredAt <= filters.endDate!);
    }

    // Sort descending by measuredAt
    list.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;

    return {
      records: list.slice(offset, offset + limit),
      total
    };
  }

  public static async createGlucoseRecord(
    input: Omit<
      GlucoseRecord,
      'id' | 'createdAt' | 'updatedAt' | 'targetStatus' | 'alertTriggered' | 'alertId'
    >
  ): Promise<{ record: GlucoseRecord; alert?: NotificationAlert }> {
    const currentUser = this.getCurrentUser();
    const patientProfile = await this.getPatientProfile(input.patientId);
    const applicableTarget = await this.getTargetForType(input.measurementType, input.patientId);
    const recent = store.glucoseRecords.slice(0, 10);

    // 1. Evaluate safety alert deterministically
    const evalResult = SafeAlertEngine.evaluateReading({
      valueMgDl: input.valueMgDl,
      measurementType: input.measurementType,
      symptoms: input.symptoms,
      patientTarget: applicableTarget,
      recentRecords: recent
    });

    const recordId = `rec-${Date.now()}`;
    let alertRecord: NotificationAlert | undefined;

    // 2. If alert triggered, check deduplication & dispatch
    if (evalResult.triggerAlert) {
      const isDuplicate = SafeAlertEngine.shouldDeduplicate(evalResult, store.notifications, 60);

      if (!isDuplicate || evalResult.category === 'critical') {
        alertRecord = {
          id: `alert-${Date.now()}`,
          patientId: input.patientId,
          glucoseRecordId: recordId,
          category: evalResult.category,
          alertType: evalResult.alertType,
          title: evalResult.titleEn,
          titleKm: evalResult.titleKm,
          message: evalResult.messageEn,
          messageKm: evalResult.messageKm,
          guidanceSummary: evalResult.guidanceEn,
          guidanceSummaryKm: evalResult.guidanceKm,
          channel: 'telegram',
          deliveryStatus: 'pending',
          deliveryAttempts: 0,
          createdAt: new Date().toISOString()
        };

        // Dispatch to Telegram if configured
        if (patientProfile.telegramChatId && patientProfile.telegramNotificationsEnabled) {
          const telegramRes = await TelegramService.sendNotification({
            chatId: patientProfile.telegramChatId,
            category: evalResult.category,
            title: evalResult.titleEn,
            body: `${evalResult.messageEn}\n\n${evalResult.messageKm}`,
            guidance: `${evalResult.guidanceEn}\n\n${evalResult.guidanceKm}`
          });
          alertRecord.deliveryStatus = telegramRes.deliveryStatus;
          alertRecord.deliveryAttempts = telegramRes.attempts;
        }

        store.notifications.unshift(alertRecord);
      }
    }

    const newRecord: GlucoseRecord = {
      ...input,
      id: recordId,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      recordedByRole: currentUser.role,
      targetStatus: evalResult.targetStatus,
      alertTriggered: Boolean(alertRecord),
      alertId: alertRecord?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.glucoseRecords.unshift(newRecord);
    return { record: newRecord, alert: alertRecord };
  }

  public static async updateGlucoseRecord(
    id: string,
    updates: Partial<GlucoseRecord>
  ): Promise<GlucoseRecord | null> {
    const idx = store.glucoseRecords.findIndex((r) => r.id === id);
    if (idx < 0) return null;

    store.glucoseRecords[idx] = {
      ...store.glucoseRecords[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return store.glucoseRecords[idx];
  }

  public static async deleteGlucoseRecord(id: string): Promise<boolean> {
    const initialLen = store.glucoseRecords.length;
    const filtered = store.glucoseRecords.filter((r) => r.id !== id);
    if (filtered.length !== initialLen) {
      // Re-assign array
      store.glucoseRecords.splice(0, store.glucoseRecords.length, ...filtered);
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // Medications & Logs
  // --------------------------------------------------------------------------
  public static async getMedications(patientId = store.PATIENT_ID): Promise<Medication[]> {
    return store.medications.filter((m) => m.patientId === patientId);
  }

  public static async createMedication(
    medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Medication> {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.medications.push(newMed);
    return newMed;
  }

  public static async updateMedication(
    id: string,
    updates: Partial<Medication>
  ): Promise<Medication | null> {
    const idx = store.medications.findIndex((m) => m.id === id);
    if (idx < 0) return null;
    store.medications[idx] = {
      ...store.medications[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return store.medications[idx];
  }

  public static async getMedicationLogs(patientId = store.PATIENT_ID): Promise<MedicationLog[]> {
    return store.medicationLogs
      .filter((l) => l.patientId === patientId)
      .sort((a, b) => new Date(b.recordedTime).getTime() - new Date(a.recordedTime).getTime());
  }

  public static async recordMedicationLog(
    logData: Omit<MedicationLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<MedicationLog> {
    const currentUser = this.getCurrentUser();
    const newLog: MedicationLog = {
      ...logData,
      id: `log-${Date.now()}`,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };
    store.medicationLogs.unshift(newLog);
    return newLog;
  }

  // --------------------------------------------------------------------------
  // Lifestyle Tracking (Meals, Activities, Journals)
  // --------------------------------------------------------------------------
  public static async getMealLogs(patientId = store.PATIENT_ID): Promise<MealLog[]> {
    return store.mealLogs
      .filter((m) => m.patientId === patientId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  }

  public static async createMealLog(
    mealData: Omit<MealLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<MealLog> {
    const currentUser = this.getCurrentUser();
    const newMeal: MealLog = {
      ...mealData,
      id: `meal-${Date.now()}`,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };
    store.mealLogs.unshift(newMeal);
    return newMeal;
  }

  public static async getActivityLogs(patientId = store.PATIENT_ID): Promise<ActivityLog[]> {
    return store.activityLogs
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  }

  public static async createActivityLog(
    actData: Omit<ActivityLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<ActivityLog> {
    const currentUser = this.getCurrentUser();
    const newAct: ActivityLog = {
      ...actData,
      id: `act-${Date.now()}`,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };
    store.activityLogs.unshift(newAct);
    return newAct;
  }

  public static async getLifestyleJournals(
    patientId = store.PATIENT_ID
  ): Promise<LifestyleJournal[]> {
    return store.lifestyleJournals
      .filter((j) => j.patientId === patientId)
      .sort((a, b) => b.logDate.localeCompare(a.logDate));
  }

  public static async saveLifestyleJournal(
    journalData: Omit<LifestyleJournal, 'id' | 'createdAt' | 'updatedAt' | 'recordedBy'>
  ): Promise<LifestyleJournal> {
    const currentUser = this.getCurrentUser();
    const existingIndex = store.lifestyleJournals.findIndex(
      (j) => j.patientId === journalData.patientId && j.logDate === journalData.logDate
    );

    if (existingIndex >= 0) {
      store.lifestyleJournals[existingIndex] = {
        ...store.lifestyleJournals[existingIndex],
        ...journalData,
        updatedAt: new Date().toISOString()
      };
      return store.lifestyleJournals[existingIndex];
    } else {
      const newJournal: LifestyleJournal = {
        ...journalData,
        id: `journ-${Date.now()}`,
        recordedBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.lifestyleJournals.unshift(newJournal);
      return newJournal;
    }
  }

  // --------------------------------------------------------------------------
  // Reminders
  // --------------------------------------------------------------------------
  public static async getReminders(patientId = store.PATIENT_ID): Promise<ReminderItem[]> {
    return store.reminders.filter((r) => r.patientId === patientId);
  }

  public static async saveReminder(
    remData: Omit<ReminderItem, 'id' | 'createdAt'> & { id?: string }
  ): Promise<ReminderItem> {
    if (remData.id) {
      const idx = store.reminders.findIndex((r) => r.id === remData.id);
      if (idx >= 0) {
        store.reminders[idx] = { ...store.reminders[idx], ...remData };
        return store.reminders[idx];
      }
    }
    const newRem: ReminderItem = {
      ...remData,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    store.reminders.push(newRem);
    return newRem;
  }

  // --------------------------------------------------------------------------
  // Notifications & Alerts
  // --------------------------------------------------------------------------
  public static async getNotifications(patientId = store.PATIENT_ID): Promise<NotificationAlert[]> {
    return store.notifications.filter((n) => n.patientId === patientId);
  }

  public static async acknowledgeNotification(id: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    const idx = store.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) {
      store.notifications[idx].acknowledgedAt = new Date().toISOString();
      store.notifications[idx].acknowledgedBy = currentUser.id;
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // Health Reports & Aggregated Analytics
  // (NEVER COMBINE FASTING AND POST-MEAL READINGS INTO ONE AVERAGE)
  // --------------------------------------------------------------------------
  public static async getHealthReportSummary(
    days = 7,
    patientId = store.PATIENT_ID
  ): Promise<HealthReportSummary> {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const records = store.glucoseRecords.filter(
      (r) => r.patientId === patientId && r.measuredAt >= cutoff
    );

    // Strictly separate fasting from post-meal!
    const fastingRecords = records.filter(
      (r) => r.measurementType === 'fasting' || r.measurementType === 'before_meal'
    );
    const postMealRecords = records.filter(
      (r) => r.measurementType === '1h_after_meal' || r.measurementType === '2h_after_meal'
    );

    const fastingAvg =
      fastingRecords.length > 0
        ? Math.round(
            (fastingRecords.reduce((acc, curr) => acc + curr.valueMgDl, 0) /
              fastingRecords.length) *
              10
          ) / 10
        : null;

    const postMealAvg =
      postMealRecords.length > 0
        ? Math.round(
            (postMealRecords.reduce((acc, curr) => acc + curr.valueMgDl, 0) /
              postMealRecords.length) *
              10
          ) / 10
        : null;

    const values = records.map((r) => r.valueMgDl);
    const lowest = values.length > 0 ? Math.min(...values) : null;
    const highest = values.length > 0 ? Math.max(...values) : null;

    const belowTargetCount = records.filter(
      (r) => r.targetStatus === 'low' || r.targetStatus === 'critical_low'
    ).length;
    const aboveTargetCount = records.filter(
      (r) => r.targetStatus === 'high' || r.targetStatus === 'critical_high'
    ).length;
    const inTargetCount = records.filter((r) => r.targetStatus === 'normal').length;

    const inTargetPercentage =
      records.length > 0 ? Math.round((inTargetCount / records.length) * 100) : 0;

    // Lifestyle aggregation
    const journals = store.lifestyleJournals.filter((j) => j.patientId === patientId);
    const activities = store.activityLogs.filter((a) => a.patientId === patientId);
    const medLogs = store.medicationLogs.filter((m) => m.patientId === patientId);

    const avgWater =
      journals.length > 0
        ? Math.round(
            (journals.reduce((acc, j) => acc + (j.waterGlasses || 0), 0) / journals.length) * 10
          ) / 10
        : 6.5;

    const avgSleep =
      journals.length > 0
        ? Math.round(
            (journals.reduce((acc, j) => acc + (j.sleepHours || 0), 0) / journals.length) * 10
          ) / 10
        : 7.5;

    const totalActMins = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);

    const takenCount = medLogs.filter((m) => m.status === 'taken').length;
    const adherenceRate = medLogs.length > 0 ? Math.round((takenCount / medLogs.length) * 100) : 95;

    return {
      periodDays: days,
      startDate: cutoff,
      endDate: new Date().toISOString(),
      totalMeasurements: records.length,
      fastingAverage: fastingAvg,
      postMealAverage: postMealAvg,
      overallLowest: lowest,
      overallHighest: highest,
      belowTargetCount,
      aboveTargetCount,
      inTargetCount,
      inTargetPercentage,
      trend: 'stable',
      medicationAdherenceRate: adherenceRate,
      dosesTaken: takenCount,
      dosesScheduled: Math.max(medLogs.length, 7),
      lifestyleInsights: {
        avgWaterGlasses: avgWater,
        avgSleepHours: avgSleep,
        totalActivityMinutes: totalActMins,
        reportedSymptoms: [
          { symptom: 'Slight morning thirst', count: 2 },
          { symptom: 'Fatigue', count: 1 }
        ]
      }
    };
  }
}
