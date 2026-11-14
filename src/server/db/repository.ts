// ============================================================================
// Repository Layer for Family Diabetes Care
// Direct server-side access to Supabase 'health_*' tables
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
  public static async getPatientProfile(patientId?: string): Promise<PatientProfile> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        let data = null;
        let error = null;

        if (patientId) {
          const res = await supabaseServer
            .from('health_patient_profiles')
            .select('*')
            .eq('id', patientId)
            .maybeSingle();
          data = res.data;
          error = res.error;
        }

        // If not found by patientId (or no patientId provided), grab the first available row in health_patient_profiles
        if (!data) {
          const fallback = await supabaseServer
            .from('health_patient_profiles')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }

        if (data && !error) {
          const profile: PatientProfile = {
            id: data.id,
            fullName: data.full_name || 'Patient',
            fullNameKm: data.full_name_km || '',
            dateOfBirth: data.date_of_birth,
            ageGroup: data.age_group || '60-69',
            age: 64,
            diabetesType: data.diabetes_type || 'unknown',
            diagnosisStatus: data.diagnosis_status || 'under_monitoring',
            currentMedicationsSummary: data.current_medications_summary || 'Oral medication',
            allergies: data.allergies || [],
            medicalHistory: data.medical_history || '',
            doctorName: data.doctor_name || '',
            doctorPhone: data.doctor_phone || '',
            doctorClinic: data.doctor_clinic || '',
            emergencyContactName: data.emergency_contact_name || '',
            emergencyContactPhone: data.emergency_contact_phone || '',
            emergencyContactRelation: data.emergency_contact_relation || '',
            preferredGlucoseUnit: data.preferred_glucose_unit || 'mg/dL',
            timezone: data.timezone || 'Asia/Phnom_Penh',
            telegramChatId: data.telegram_chat_id || '',
            telegramNotificationsEnabled: data.telegram_notifications_enabled ?? true,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          store.updatePatientProfileInStore(profile);
          return profile;
        }
      } catch (err) {
        console.warn('Error fetching health_patient_profiles from Supabase:', err);
      }
    }
    return store.initialPatientProfile;
  }

  public static async updatePatientProfile(
    patientId: string | undefined,
    updates: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    let targetPatientId = patientId;

    if (isSupabaseConfigured && supabaseServer) {
      try {
        // Resolve patient id if not provided
        if (!targetPatientId) {
          const { data: firstRow } = await supabaseServer
            .from('health_patient_profiles')
            .select('id')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
          targetPatientId = firstRow?.id || store.PATIENT_ID;
        }

        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (updates.fullName !== undefined) payload.full_name = updates.fullName;
        if (updates.fullNameKm !== undefined) payload.full_name_km = updates.fullNameKm;
        if (updates.ageGroup !== undefined) payload.age_group = updates.ageGroup;
        if (updates.diabetesType !== undefined) payload.diabetes_type = updates.diabetesType;
        if (updates.diagnosisStatus !== undefined) payload.diagnosis_status = updates.diagnosisStatus;
        if (updates.currentMedicationsSummary !== undefined)
          payload.current_medications_summary = updates.currentMedicationsSummary;
        if (updates.allergies !== undefined) payload.allergies = updates.allergies;
        if (updates.medicalHistory !== undefined) payload.medical_history = updates.medicalHistory;
        if (updates.doctorName !== undefined) payload.doctor_name = updates.doctorName;
        if (updates.doctorPhone !== undefined) payload.doctor_phone = updates.doctorPhone;
        if (updates.doctorClinic !== undefined) payload.doctor_clinic = updates.doctorClinic;
        if (updates.emergencyContactName !== undefined)
          payload.emergency_contact_name = updates.emergencyContactName;
        if (updates.emergencyContactPhone !== undefined)
          payload.emergency_contact_phone = updates.emergencyContactPhone;
        if (updates.emergencyContactRelation !== undefined)
          payload.emergency_contact_relation = updates.emergencyContactRelation;
        if (updates.preferredGlucoseUnit !== undefined)
          payload.preferred_glucose_unit = updates.preferredGlucoseUnit;
        if (updates.timezone !== undefined) payload.timezone = updates.timezone;
        if (updates.telegramChatId !== undefined) payload.telegram_chat_id = updates.telegramChatId;
        if (updates.telegramNotificationsEnabled !== undefined)
          payload.telegram_notifications_enabled = updates.telegramNotificationsEnabled;

        const { error: updateError } = await supabaseServer
          .from('health_patient_profiles')
          .update(payload)
          .eq('id', targetPatientId);

        if (updateError) {
          console.error('Error updating health_patient_profiles in Supabase:', updateError);
        } else {
          // Re-fetch the freshly updated record directly from Supabase
          const fresh = await this.getPatientProfile(targetPatientId);
          return fresh;
        }
      } catch (err) {
        console.warn('Error updating health_patient_profiles in Supabase:', err);
      }
    }

    return store.updatePatientProfileInStore(updates);
  }

  // --------------------------------------------------------------------------
  // Glucose Targets
  // --------------------------------------------------------------------------
  public static async getGlucoseTargets(patientId = store.PATIENT_ID): Promise<GlucoseTarget[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_glucose_targets')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_active', true);

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            measurementType: d.measurement_type,
            targetMin: Number(d.target_min),
            targetMax: Number(d.target_max),
            lowAlertThreshold: Number(d.low_alert_threshold),
            highAlertThreshold: Number(d.high_alert_threshold),
            effectiveDate: d.effective_date,
            configuredBy: d.configured_by,
            clinicianApprovalStatus: d.clinician_approval_status,
            clinicianNotes: d.clinician_notes,
            isActive: d.is_active
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_glucose_targets from Supabase:', err);
      }
    }
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

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_glucose_targets').upsert({
          id: newTarget.id,
          patient_id: newTarget.patientId,
          measurement_type: newTarget.measurementType,
          target_min: newTarget.targetMin,
          target_max: newTarget.targetMax,
          low_alert_threshold: newTarget.lowAlertThreshold,
          high_alert_threshold: newTarget.highAlertThreshold,
          effective_date: newTarget.effectiveDate,
          configured_by: newTarget.configuredBy,
          clinician_approval_status: newTarget.clinicianApprovalStatus,
          clinician_notes: newTarget.clinicianNotes,
          is_active: true
        });
      } catch (err) {
        console.warn('Error saving health_glucose_targets to Supabase:', err);
      }
    }

    const existingIndex = store.targets.findIndex(
      (t) => t.patientId === targetData.patientId && t.measurementType === targetData.measurementType
    );
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
    const patientId = filters?.patientId || store.PATIENT_ID;

    if (isSupabaseConfigured && supabaseServer) {
      try {
        let query = supabaseServer
          .from('health_glucose_records')
          .select('*', { count: 'exact' })
          .eq('patient_id', patientId);

        if (filters?.measurementType && filters.measurementType !== 'all') {
          query = query.eq('measurement_type', filters.measurementType);
        }
        if (filters?.startDate) {
          query = query.gte('measured_at', filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte('measured_at', filters.endDate);
        }

        query = query.order('measured_at', { ascending: false });

        if (filters?.limit) {
          const from = filters.offset || 0;
          query = query.range(from, from + filters.limit - 1);
        }

        const { data, count, error } = await query;

        if (data && !error) {
          const mappedRecords: GlucoseRecord[] = data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            valueMgDl: Number(d.value_mgdl),
            measurementType: d.measurement_type,
            measuredAt: d.measured_at,
            mealDescription: d.meal_description,
            symptoms: d.symptoms || [],
            notes: d.notes,
            recordedBy: d.recorded_by,
            recordedByName: 'Caregiver',
            targetStatus: d.target_status || 'normal',
            alertTriggered: Boolean(d.alert_triggered),
            alertId: d.alert_id,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));

          return { records: mappedRecords, total: count ?? mappedRecords.length };
        }
      } catch (err) {
        console.warn('Error fetching health_glucose_records from Supabase:', err);
      }
    }

    let list = [...store.glucoseRecords];
    if (filters?.patientId) list = list.filter((r) => r.patientId === filters.patientId);
    if (filters?.measurementType && filters.measurementType !== 'all') {
      list = list.filter((r) => r.measurementType === filters.measurementType);
    }
    if (filters?.startDate) list = list.filter((r) => r.measuredAt >= filters.startDate!);
    if (filters?.endDate) list = list.filter((r) => r.measuredAt <= filters.endDate!);

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

    // Fetch previous records for trend detection
    const { records: recent } = await this.getGlucoseRecords({
      patientId: input.patientId,
      limit: 10
    });

    // 1. Evaluate safety alert deterministically
    const evalResult = SafeAlertEngine.evaluateReading({
      valueMgDl: input.valueMgDl,
      measurementType: input.measurementType,
      symptoms: input.symptoms,
      patientTarget: applicableTarget,
      recentRecords: recent
    });

    const recordId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
    let alertRecord: NotificationAlert | undefined;

    // 2. Alert generation & deduplication
    if (evalResult.triggerAlert) {
      const isDuplicate = SafeAlertEngine.shouldDeduplicate(evalResult, store.notifications, 60);

      if (!isDuplicate || evalResult.category === 'critical') {
        alertRecord = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `alert-${Date.now()}`,
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

        if (isSupabaseConfigured && supabaseServer) {
          try {
            await supabaseServer.from('health_notifications').insert({
              id: alertRecord.id,
              patient_id: alertRecord.patientId,
              glucose_record_id: alertRecord.glucoseRecordId,
              category: alertRecord.category,
              alert_type: alertRecord.alertType,
              title: alertRecord.title,
              title_km: alertRecord.titleKm,
              message: alertRecord.message,
              message_km: alertRecord.messageKm,
              guidance_summary: alertRecord.guidanceSummary,
              guidance_summary_km: alertRecord.guidanceSummaryKm,
              channel: alertRecord.channel,
              delivery_status: alertRecord.deliveryStatus,
              delivery_attempts: alertRecord.deliveryAttempts
            });
          } catch (err) {
            console.warn('Error saving health_notifications to Supabase:', err);
          }
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

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_glucose_records').insert({
          id: newRecord.id,
          patient_id: newRecord.patientId,
          value_mgdl: newRecord.valueMgDl,
          measurement_type: newRecord.measurementType,
          measured_at: newRecord.measuredAt,
          meal_description: newRecord.mealDescription || null,
          symptoms: newRecord.symptoms || [],
          notes: newRecord.notes || null,
          recorded_by: currentUser.id,
          target_status: newRecord.targetStatus,
          alert_triggered: newRecord.alertTriggered,
          alert_id: newRecord.alertId || null
        });
      } catch (err) {
        console.warn('Error inserting health_glucose_records into Supabase:', err);
      }
    }

    store.glucoseRecords.unshift(newRecord);
    return { record: newRecord, alert: alertRecord };
  }

  public static async updateGlucoseRecord(
    id: string,
    updates: Partial<GlucoseRecord>
  ): Promise<GlucoseRecord | null> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.valueMgDl !== undefined) payload.value_mgdl = updates.valueMgDl;
        if (updates.measurementType !== undefined) payload.measurement_type = updates.measurementType;
        if (updates.mealDescription !== undefined) payload.meal_description = updates.mealDescription;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        await supabaseServer.from('health_glucose_records').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Error updating health_glucose_records in Supabase:', err);
      }
    }

    const idx = store.glucoseRecords.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.glucoseRecords[idx] = {
        ...store.glucoseRecords[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return store.glucoseRecords[idx];
    }
    return null;
  }

  public static async deleteGlucoseRecord(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_glucose_records').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting health_glucose_records from Supabase:', err);
      }
    }

    const filtered = store.glucoseRecords.filter((r) => r.id !== id);
    store.glucoseRecords.splice(0, store.glucoseRecords.length, ...filtered);
    return true;
  }

  // --------------------------------------------------------------------------
  // Medications & Logs
  // --------------------------------------------------------------------------
  public static async getMedications(patientId = store.PATIENT_ID): Promise<Medication[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_medications')
          .select('*')
          .eq('patient_id', patientId);

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            name: d.name,
            dosage: d.dosage,
            frequency: d.frequency,
            timingInstructions: d.timing_instructions,
            prescribingDoctor: d.prescribing_doctor,
            startDate: d.start_date,
            endDate: d.end_date,
            isActive: d.is_active,
            notes: d.notes,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_medications from Supabase:', err);
      }
    }
    return store.medications.filter((m) => m.patientId === patientId);
  }

  public static async createMedication(
    medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Medication> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `med-${Date.now()}`;
    const newMed: Medication = {
      ...medData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        // Ensure patient exists in health_patient_profiles to satisfy foreign key
        const { data: patientExists } = await supabaseServer
          .from('health_patient_profiles')
          .select('id')
          .eq('id', newMed.patientId)
          .maybeSingle();

        if (!patientExists) {
          await supabaseServer.from('health_patient_profiles').insert({
            id: newMed.patientId,
            full_name: 'Mom Sokha',
            full_name_km: 'ម៉ាក់ សុខា',
            emergency_contact_name: 'Family Caregiver',
            emergency_contact_phone: '',
            emergency_contact_relation: 'Caregiver'
          });
        }

        await supabaseServer.from('health_medications').insert({
          id: newMed.id,
          patient_id: newMed.patientId,
          name: newMed.name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          timing_instructions: newMed.timingInstructions,
          prescribing_doctor: newMed.prescribingDoctor,
          start_date: newMed.startDate,
          end_date: newMed.endDate || null,
          is_active: newMed.isActive,
          notes: newMed.notes || null
        });
      } catch (err) {
        console.warn('Error creating health_medications in Supabase:', err);
      }
    }

    store.medications.push(newMed);
    return newMed;
  }

  public static async updateMedication(
    id: string,
    updates: Partial<Medication>
  ): Promise<Medication | null> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.dosage !== undefined) payload.dosage = updates.dosage;
        if (updates.frequency !== undefined) payload.frequency = updates.frequency;
        if (updates.timingInstructions !== undefined) payload.timing_instructions = updates.timingInstructions;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        await supabaseServer.from('health_medications').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Error updating health_medications in Supabase:', err);
      }
    }

    const idx = store.medications.findIndex((m) => m.id === id);
    if (idx >= 0) {
      store.medications[idx] = {
        ...store.medications[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return store.medications[idx];
    }
    return null;
  }

  public static async deleteMedication(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_medications').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting health_medications from Supabase:', err);
      }
    }

    const filtered = store.medications.filter((m) => m.id !== id);
    store.medications.splice(0, store.medications.length, ...filtered);
    return true;
  }

  public static async getMedicationLogs(patientId = store.PATIENT_ID): Promise<MedicationLog[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_medication_logs')
          .select('*')
          .eq('patient_id', patientId)
          .order('recorded_time', { ascending: false });

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            medicationId: d.medication_id,
            medicationName: d.medication_name || 'Oral Medication',
            patientId: d.patient_id,
            status: d.status,
            scheduledTime: d.scheduled_time,
            recordedTime: d.recorded_time,
            recordedBy: d.recorded_by,
            recordedByName: 'Caregiver',
            notes: d.notes,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_medication_logs from Supabase:', err);
      }
    }
    return store.medicationLogs.filter((l) => l.patientId === patientId);
  }

  public static async recordMedicationLog(
    logData: Omit<MedicationLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<MedicationLog> {
    const currentUser = this.getCurrentUser();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`;
    const newLog: MedicationLog = {
      ...logData,
      id,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_medication_logs').insert({
          id: newLog.id,
          medication_id: newLog.medicationId,
          patient_id: newLog.patientId,
          status: newLog.status,
          scheduled_time: newLog.scheduledTime,
          recorded_time: newLog.recordedTime,
          recorded_by: newLog.recordedBy,
          notes: newLog.notes || null
        });
      } catch (err) {
        console.warn('Error inserting health_medication_logs into Supabase:', err);
      }
    }

    store.medicationLogs.unshift(newLog);
    return newLog;
  }

  // --------------------------------------------------------------------------
  // Lifestyle Tracking (Meals, Activities, Journals)
  // --------------------------------------------------------------------------
  public static async getMealLogs(patientId = store.PATIENT_ID): Promise<MealLog[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_meal_logs')
          .select('*')
          .eq('patient_id', patientId)
          .order('logged_at', { ascending: false });

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            mealType: d.meal_type,
            loggedAt: d.logged_at,
            foodDescription: d.food_description,
            portionSize: d.portion_size,
            carbEstimate: d.carb_estimate,
            cambodianDishId: d.cambodian_dish_id,
            notes: d.notes,
            recordedBy: d.recorded_by,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_meal_logs from Supabase:', err);
      }
    }
    return store.mealLogs.filter((m) => m.patientId === patientId);
  }

  public static async createMealLog(
    mealData: Omit<MealLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<MealLog> {
    const currentUser = this.getCurrentUser();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`;
    const newMeal: MealLog = {
      ...mealData,
      id,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_meal_logs').insert({
          id: newMeal.id,
          patient_id: newMeal.patientId,
          meal_type: newMeal.mealType,
          logged_at: newMeal.loggedAt,
          food_description: newMeal.foodDescription,
          portion_size: newMeal.portionSize || null,
          carb_estimate: newMeal.carbEstimate || null,
          cambodian_dish_id: newMeal.cambodianDishId || null,
          notes: newMeal.notes || null,
          recorded_by: newMeal.recordedBy
        });
      } catch (err) {
        console.warn('Error inserting health_meal_logs into Supabase:', err);
      }
    }

    store.mealLogs.unshift(newMeal);
    return newMeal;
  }

  public static async getActivityLogs(patientId = store.PATIENT_ID): Promise<ActivityLog[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_activity_logs')
          .select('*')
          .eq('patient_id', patientId)
          .order('logged_at', { ascending: false });

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            activityType: d.activity_type,
            durationMinutes: d.duration_minutes,
            intensity: d.intensity,
            loggedAt: d.logged_at,
            notes: d.notes,
            recordedBy: d.recorded_by,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_activity_logs from Supabase:', err);
      }
    }
    return store.activityLogs.filter((a) => a.patientId === patientId);
  }

  public static async createActivityLog(
    actData: Omit<ActivityLog, 'id' | 'createdAt' | 'recordedBy' | 'recordedByName'>
  ): Promise<ActivityLog> {
    const currentUser = this.getCurrentUser();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}`;
    const newAct: ActivityLog = {
      ...actData,
      id,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_activity_logs').insert({
          id: newAct.id,
          patient_id: newAct.patientId,
          activity_type: newAct.activityType,
          duration_minutes: newAct.durationMinutes,
          intensity: newAct.intensity,
          logged_at: newAct.loggedAt,
          notes: newAct.notes || null,
          recorded_by: newAct.recordedBy
        });
      } catch (err) {
        console.warn('Error inserting health_activity_logs into Supabase:', err);
      }
    }

    store.activityLogs.unshift(newAct);
    return newAct;
  }

  public static async getLifestyleJournals(
    patientId = store.PATIENT_ID
  ): Promise<LifestyleJournal[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_lifestyle_journals')
          .select('*')
          .eq('patient_id', patientId)
          .order('log_date', { ascending: false });

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            logDate: d.log_date,
            waterGlasses: d.water_glasses,
            sleepHours: Number(d.sleep_hours),
            symptoms: d.symptoms || [],
            notes: d.notes,
            recordedBy: d.recorded_by,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_lifestyle_journals from Supabase:', err);
      }
    }
    return store.lifestyleJournals.filter((j) => j.patientId === patientId);
  }

  public static async saveLifestyleJournal(
    journalData: Omit<LifestyleJournal, 'id' | 'createdAt' | 'updatedAt' | 'recordedBy'>
  ): Promise<LifestyleJournal> {
    const currentUser = this.getCurrentUser();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `journ-${Date.now()}`;
    const newJournal: LifestyleJournal = {
      ...journalData,
      id,
      recordedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_lifestyle_journals').upsert({
          patient_id: newJournal.patientId,
          log_date: newJournal.logDate,
          water_glasses: newJournal.waterGlasses,
          sleep_hours: newJournal.sleepHours,
          symptoms: newJournal.symptoms || [],
          notes: newJournal.notes || null,
          recorded_by: newJournal.recordedBy,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Error saving health_lifestyle_journals to Supabase:', err);
      }
    }

    const existingIndex = store.lifestyleJournals.findIndex(
      (j) => j.patientId === journalData.patientId && j.logDate === journalData.logDate
    );
    if (existingIndex >= 0) {
      store.lifestyleJournals[existingIndex] = newJournal;
    } else {
      store.lifestyleJournals.unshift(newJournal);
    }

    return newJournal;
  }

  // --------------------------------------------------------------------------
  // Reminders
  // --------------------------------------------------------------------------
  public static async getReminders(patientId = store.PATIENT_ID): Promise<ReminderItem[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_reminders')
          .select('*')
          .eq('patient_id', patientId);

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            reminderType: d.reminder_type,
            title: d.title,
            titleKm: d.title_km,
            timeOfDay: d.time_of_day,
            daysOfWeek: d.days_of_week || [1, 2, 3, 4, 5, 6, 7],
            isActive: d.is_active,
            lastTriggeredAt: d.last_triggered_at,
            notes: d.notes,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_reminders from Supabase:', err);
      }
    }
    return store.reminders.filter((r) => r.patientId === patientId);
  }

  public static async saveReminder(
    remData: Omit<ReminderItem, 'id' | 'createdAt'> & { id?: string }
  ): Promise<ReminderItem> {
    const id = remData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rem-${Date.now()}`);
    const newRem: ReminderItem = {
      ...remData,
      id,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_reminders').upsert({
          id: newRem.id,
          patient_id: newRem.patientId,
          reminder_type: newRem.reminderType,
          title: newRem.title,
          title_km: newRem.titleKm,
          time_of_day: newRem.timeOfDay,
          days_of_week: newRem.daysOfWeek,
          is_active: newRem.isActive,
          notes: newRem.notes || null
        });
      } catch (err) {
        console.warn('Error saving health_reminders to Supabase:', err);
      }
    }

    const idx = store.reminders.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.reminders[idx] = newRem;
    } else {
      store.reminders.push(newRem);
    }
    return newRem;
  }

  // --------------------------------------------------------------------------
  // Notifications & Alerts
  // --------------------------------------------------------------------------
  public static async getNotifications(patientId = store.PATIENT_ID): Promise<NotificationAlert[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_notifications')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            patientId: d.patient_id,
            glucoseRecordId: d.glucose_record_id,
            category: d.category,
            alertType: d.alert_type,
            title: d.title,
            titleKm: d.title_km,
            message: d.message,
            messageKm: d.message_km,
            guidanceSummary: d.guidance_summary,
            guidanceSummaryKm: d.guidance_summary_km,
            channel: d.channel,
            deliveryStatus: d.delivery_status,
            deliveryAttempts: d.delivery_attempts,
            acknowledgedAt: d.acknowledged_at,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching health_notifications from Supabase:', err);
      }
    }
    return store.notifications.filter((n) => n.patientId === patientId);
  }

  public static async acknowledgeNotification(id: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer
          .from('health_notifications')
          .update({
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: currentUser.id
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Error acknowledging health_notifications in Supabase:', err);
      }
    }

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
    const { records } = await this.getGlucoseRecords({
      patientId,
      startDate: cutoff
    });

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

    const journals = await this.getLifestyleJournals(patientId);
    const activities = await this.getActivityLogs(patientId);
    const medLogs = await this.getMedicationLogs(patientId);

    const avgWater =
      journals.length > 0
        ? Math.round(
            (journals.reduce((acc, j) => acc + (j.waterGlasses || 0), 0) / journals.length) * 10
          ) / 10
        : null;

    const avgSleep =
      journals.length > 0
        ? Math.round(
            (journals.reduce((acc, j) => acc + (j.sleepHours || 0), 0) / journals.length) * 10
          ) / 10
        : null;

    const totalActMins = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);

    const takenCount = medLogs.filter((m) => m.status === 'taken').length;
    const adherenceRate = medLogs.length > 0 ? Math.round((takenCount / medLogs.length) * 100) : 0;

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
      dosesScheduled: medLogs.length,
      lifestyleInsights: {
        avgWaterGlasses: avgWater || 0,
        avgSleepHours: avgSleep || 0,
        totalActivityMinutes: totalActMins,
        reportedSymptoms: []
      }
    };
  }
}
