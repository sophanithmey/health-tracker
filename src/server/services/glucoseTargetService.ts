// ============================================================================
// Personalized Glucose Target & Evaluation Service
// Centralized server-side clinical guidelines, target evaluation,
// approval workflows, and audit logging.
// ============================================================================

import {
  MeasurementType,
  GlucoseTarget,
  GlucoseTargetAuditLog,
  GeneralGuidelineReference,
  GlucoseEvaluationResult,
  UserProfile
} from '@/types';
import * as store from '../db/inMemoryStore';
import { supabaseServer, isSupabaseConfigured } from '../db/supabaseClient';

// ----------------------------------------------------------------------------
// 1. ADA Standards of Care (2026) Medical Reference Guidelines
// Reference: ADA Standards of Care in Diabetes (Glycemic Goals)
// ----------------------------------------------------------------------------

export const ADA_GUIDELINE_TARGETS: Record<MeasurementType, GeneralGuidelineReference> = {
  fasting: {
    measurementType: 'fasting',
    minMgDl: 80,
    maxMgDl: 130,
    labelEn: 'Fasting (8–10h without food)',
    labelKm: 'ជាតិស្ករពេលព្រឹកព្រលឹម (អត់អាហារ ៨-១០ ម៉ោង)',
    notesEn: 'ADA recommendation for nonpregnant adults: 80–130 mg/dL.',
    notesKm: 'គោលការណ៍ណែនាំទូទៅ ADA សម្រាប់មនុស្សពេញវ័យ៖ ៨០–១៣០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  before_meal: {
    measurementType: 'before_meal',
    minMgDl: 80,
    maxMgDl: 130,
    labelEn: 'Before Meal (Preprandial)',
    labelKm: 'មុនពេលអាហារ',
    notesEn: 'ADA recommendation before meals: 80–130 mg/dL.',
    notesKm: 'គោលការណ៍ណែនាំទូទៅមុនពេលអាហារ៖ ៨០–១៣០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  '1h_after_meal': {
    measurementType: '1h_after_meal',
    maxMgDl: 180,
    labelEn: '1 Hour After Meal',
    labelKm: '១ ម៉ោងក្រោយអាហារ',
    notesEn: 'Peak postprandial goal: under 180 mg/dL.',
    notesKm: 'គោលដៅក្រោយអាហារ៖ តិចជាង ១៨០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  '2h_after_meal': {
    measurementType: '2h_after_meal',
    maxMgDl: 180,
    labelEn: '2 Hours After Meal (Postprandial)',
    labelKm: '២ ម៉ោងក្រោយអាហារ',
    notesEn: 'ADA postprandial goal: below 180 mg/dL for nonpregnant adults.',
    notesKm: 'គោលការណ៍ណែនាំទូទៅ ADA ២ ម៉ោងក្រោយអាហារ៖ តិចជាង ១៨០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  bedtime: {
    measurementType: 'bedtime',
    minMgDl: 100,
    maxMgDl: 140,
    labelEn: 'Bedtime',
    labelKm: 'មុនពេលចូលគេង',
    notesEn: 'General overnight safety recommendation: 100–140 mg/dL.',
    notesKm: 'គោលការណ៍ណែនាំទូទៅមុនចូលគេង៖ ១០០–១៤០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  random: {
    measurementType: 'random',
    maxMgDl: 180,
    labelEn: 'Random / Casual Reading',
    labelKm: 'វាស់ចៃដន្យទូទៅ',
    notesEn: 'General casual reading threshold: below 180 mg/dL.',
    notesKm: 'កម្រិតវាស់ចៃដន្យទូទៅ៖ តិចជាង ១៨០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  },
  other: {
    measurementType: 'other',
    minMgDl: 80,
    maxMgDl: 180,
    labelEn: 'Other Reading Time',
    labelKm: 'ពេលផ្សេងទៀត',
    notesEn: 'General glycemic target range: 80–180 mg/dL.',
    notesKm: 'កម្រិតគោលដៅទូទៅ៖ ៨០–១៨០ mg/dL',
    guidelineSource: 'ADA Standards of Care in Diabetes',
    guidelineVersion: '2026'
  }
};

export class GlucoseTargetService {
  private static async resolveProfileId(preferredId?: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabaseServer) return preferredId || null;
    try {
      if (preferredId) {
        const { data } = await supabaseServer
          .from('health_profiles')
          .select('id')
          .eq('id', preferredId)
          .maybeSingle();
        if (data?.id) return data.id;
      }
      const { data: firstProfile } = await supabaseServer
        .from('health_profiles')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      return firstProfile?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Return general educational guidelines for reference display
   */
  public static getGeneralGuidelines(): GeneralGuidelineReference[] {
    return Object.values(ADA_GUIDELINE_TARGETS);
  }

  /**
   * Get all targets for a patient (including pending, approved, and inactive)
   */
  public static async getPatientTargets(patientId = store.PATIENT_ID): Promise<GlucoseTarget[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_glucose_targets')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d: any) => this.mapFromDb(d));
        }
      } catch (err) {
        console.warn('Error fetching health_glucose_targets from Supabase:', err);
      }
    }

    return store.targets.filter((t) => t.patientId === patientId);
  }

  /**
   * Find the active approved target for a patient and measurement type
   * that was effective at a specific measurement timestamp.
   */
  public static async findActiveApprovedTarget(
    patientId: string,
    measurementType: MeasurementType,
    measuredAt: Date = new Date()
  ): Promise<GlucoseTarget | undefined> {
    const targets = await this.getPatientTargets(patientId);
    const measuredTime = measuredAt.getTime();

    // Filter for approved, active targets matching measurement type
    const matching = targets.filter((t) => {
      if (t.patientId !== patientId) return false;
      if (t.measurementType !== measurementType) return false;
      if (!t.isActive) return false;

      const isApproved =
        t.approvalStatus === 'approved' || t.clinicianApprovalStatus === 'clinician_approved';
      if (!isApproved) return false;

      // Check if target is not expired
      if (t.effectiveUntil) {
        const effectiveUntil = new Date(t.effectiveUntil).getTime();
        if (measuredTime > effectiveUntil) return false;
      }

      return true;
    });

    if (matching.length === 0) return undefined;

    // Prefer target that was already effective at measuredTime
    const effectiveAtTime = matching.filter((t) => {
      const effectiveFrom = t.effectiveFrom
        ? new Date(t.effectiveFrom).getTime()
        : new Date(t.effectiveDate).getTime();
      return measuredTime >= effectiveFrom;
    });

    const candidates = effectiveAtTime.length > 0 ? effectiveAtTime : matching;

    // Return most recently effective target
    candidates.sort((a, b) => {
      const timeA = new Date(a.effectiveFrom || a.effectiveDate).getTime();
      const timeB = new Date(b.effectiveFrom || b.effectiveDate).getTime();
      return timeB - timeA;
    });

    return candidates[0];
  }

  /**
   * Evaluate a glucose reading against personalized active targets or general guidelines.
   */
  public static async evaluateReading(params: {
    valueMgDl: number;
    measurementType: MeasurementType;
    measuredAt?: string;
    patientId?: string;
  }): Promise<GlucoseEvaluationResult> {
    const {
      valueMgDl,
      measurementType,
      measuredAt = new Date().toISOString(),
      patientId = store.PATIENT_ID
    } = params;

    const atDate = new Date(measuredAt);
    const activeTarget = await this.findActiveApprovedTarget(patientId, measurementType, atDate);
    const generalRef = ADA_GUIDELINE_TARGETS[measurementType] || ADA_GUIDELINE_TARGETS.other;

    // CASE 1: No approved personalized target exists
    if (!activeTarget) {
      return {
        status: 'target_not_configured',
        valueMgDl,
        measurementType,
        measuredAt,
        generalReference: generalRef,
        explanationEn:
          'Personal target not configured for this measurement time. Reference values are educational only and not personalized.',
        explanationKm:
          'មិនទាន់មានការកំណត់គោលដៅផ្ទាល់ខ្លួនសម្រាប់ពេលវាស់នេះឡើយ តម្លៃយោងគឺសម្រាប់ជាការអប់រំទូទៅប៉ុណ្ណោះ',
        isEducationalReferenceOnly: true
      };
    }

    // CASE 2: Approved personalized target exists
    const min = activeTarget.minValue ?? activeTarget.targetMin;
    const max = activeTarget.maxValue ?? activeTarget.targetMax;

    // Evaluate based on provided boundaries
    if (min !== undefined && min !== null && (max === undefined || max === null)) {
      // Lower threshold only
      if (valueMgDl < min) {
        const diff = Number((min - valueMgDl).toFixed(1));
        return {
          status: 'below_target',
          valueMgDl,
          measurementType,
          measuredAt,
          activeTarget,
          differenceFromMin: diff,
          explanationEn: `Reading is ${diff} mg/dL below the configured minimum target of ${min} mg/dL.`,
          explanationKm: `កម្រិតជាតិស្ករគឺទាបជាងគោលដៅអប្បបរមា (${min} mg/dL) ចំនួន ${diff} mg/dL`,
          isEducationalReferenceOnly: false
        };
      }
      return {
        status: 'within_target',
        valueMgDl,
        measurementType,
        measuredAt,
        activeTarget,
        explanationEn: `Reading meets the configured threshold (≥ ${min} mg/dL).`,
        explanationKm: `កម្រិតជាតិស្ករស្របតាមគោលដៅកំណត់ (≥ ${min} mg/dL)`,
        isEducationalReferenceOnly: false
      };
    }

    if (max !== undefined && max !== null && (min === undefined || min === null)) {
      // Upper threshold only
      if (valueMgDl > max) {
        const diff = Number((valueMgDl - max).toFixed(1));
        return {
          status: 'above_target',
          valueMgDl,
          measurementType,
          measuredAt,
          activeTarget,
          differenceFromMax: diff,
          explanationEn: `This reading is ${diff} mg/dL above the configured target (${max} mg/dL). Record the result and monitor the trend. Follow the care plan provided by the healthcare professional.`,
          explanationKm: `កម្រិតជាតិស្ករលើសពីគោលដៅកំណត់ (${max} mg/dL) ចំនួន ${diff} mg/dL សូមកត់ត្រាលទ្ធផល និងតាមដានបន្តតាមការណែនាំរបស់គ្រូពេទ្យ`,
          isEducationalReferenceOnly: false
        };
      }
      return {
        status: 'within_target',
        valueMgDl,
        measurementType,
        measuredAt,
        activeTarget,
        explanationEn: `Reading meets the configured target (≤ ${max} mg/dL).`,
        explanationKm: `កម្រិតជាតិស្ករស្ថិតក្នុងកម្រិតគោលដៅល្អ (≤ ${max} mg/dL)`,
        isEducationalReferenceOnly: false
      };
    }

    // Two-sided boundaries (min and max)
    const effectiveMin = min!;
    const effectiveMax = max!;

    if (valueMgDl < effectiveMin) {
      const diff = Number((effectiveMin - valueMgDl).toFixed(1));
      return {
        status: 'below_target',
        valueMgDl,
        measurementType,
        measuredAt,
        activeTarget,
        differenceFromMin: diff,
        explanationEn: `Reading is ${diff} mg/dL below the configured target range (${effectiveMin}–${effectiveMax} mg/dL).`,
        explanationKm: `កម្រិតជាតិស្ករទាបជាងកម្រិតគោលដៅកំណត់ (${effectiveMin}–${effectiveMax} mg/dL) ចំនួន ${diff} mg/dL`,
        isEducationalReferenceOnly: false
      };
    }

    if (valueMgDl > effectiveMax) {
      const diff = Number((valueMgDl - effectiveMax).toFixed(1));
      return {
        status: 'above_target',
        valueMgDl,
        measurementType,
        measuredAt,
        activeTarget,
        differenceFromMax: diff,
        explanationEn: `This reading is above the configured target. Record the result and monitor the trend. Follow the care plan provided by the healthcare professional.`,
        explanationKm: `កម្រិតជាតិស្ករនេះលើសពីកម្រិតគោលដៅកំណត់ សូមកត់ត្រាលទ្ធផល និងតាមដាននិន្នាការជាបន្តបន្ទាប់ អនុវត្តតាមផែនការថែទាំរបស់វេជ្ជបណ្ឌិត`,
        isEducationalReferenceOnly: false
      };
    }

    return {
      status: 'within_target',
      valueMgDl,
      measurementType,
      measuredAt,
      activeTarget,
      explanationEn: `Reading is within the configured target range (${effectiveMin}–${effectiveMax} mg/dL).`,
      explanationKm: `កម្រិតជាតិស្ករស្ថិតក្នុងកម្រិតគោលដៅកំណត់ (${effectiveMin}–${effectiveMax} mg/dL)`,
      isEducationalReferenceOnly: false
    };
  }

  /**
   * Create a new target (starts as 'pending' approval unless clinician explicitly enters it)
   */
  public static async createTarget(
    data: {
      patientId?: string;
      measurementType: MeasurementType;
      minValue?: number | null;
      maxValue?: number | null;
      unit?: 'mg/dL';
      notes?: string;
      effectiveFrom?: string;
      effectiveUntil?: string | null;
      guidelineSource?: string;
      guidelineVersion?: string;
      source?: 'general_guideline' | 'clinician_configured';
    },
    currentUser: UserProfile
  ): Promise<GlucoseTarget> {
    const patientId = data.patientId || store.PATIENT_ID;
    const isClinician = currentUser.role === 'clinician';

    const min = data.minValue ?? undefined;
    const max = data.maxValue ?? undefined;
    const targetMin = min ?? (max ? Math.max(40, max - 50) : 80);
    const targetMax = max ?? (min ? min + 50 : 130);

    const targetId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tgt-${Date.now()}`;

    const effectiveFrom = data.effectiveFrom || new Date().toISOString();

    const resolvedProfileId = await this.resolveProfileId(currentUser.id);

    const newTarget: GlucoseTarget = {
      id: targetId,
      patientId,
      measurementType: data.measurementType,
      minValue: min,
      maxValue: max,
      targetMin,
      targetMax,
      lowAlertThreshold: min ? Math.min(min, 70) : 70,
      highAlertThreshold: max ? Math.max(max, 180) : 180,
      unit: 'mg/dL',
      source: data.source || 'clinician_configured',
      approvalStatus: isClinician ? 'approved' : 'pending',
      effectiveFrom,
      effectiveUntil: data.effectiveUntil || undefined,
      effectiveDate: effectiveFrom,
      notes: data.notes,
      guidelineSource: data.guidelineSource || 'ADA Standards of Care',
      guidelineVersion: data.guidelineVersion || '2026',
      createdBy: resolvedProfileId || currentUser.id,
      createdByName: currentUser.fullName,
      approvedBy: isClinician ? (resolvedProfileId || currentUser.id) : undefined,
      approvedByName: isClinician ? currentUser.fullName : undefined,
      approvedAt: isClinician ? new Date().toISOString() : undefined,
      configuredBy: resolvedProfileId || currentUser.id,
      configuredByName: currentUser.fullName,
      clinicianApprovalStatus: isClinician ? 'clinician_approved' : 'unconfirmed',
      clinicianNotes: data.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If clinician automatically approved, inactivate any previous active target
    if (newTarget.approvalStatus === 'approved') {
      await this.supersedePreviousTargets(patientId, data.measurementType, targetId);
    }

    // Persist to Supabase or in-memory
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('health_glucose_targets').insert(this.mapToDb(newTarget));
      } catch (err) {
        console.warn('Error creating target in Supabase:', err);
      }
    }

    store.targets.unshift(newTarget);

    // Record audit log
    await this.recordAuditLog({
      targetId: newTarget.id,
      patientId,
      action: 'created',
      newValues: newTarget,
      changedBy: currentUser.id,
      changedByName: currentUser.fullName,
      reason: `Target created (${newTarget.approvalStatus})`
    });

    return newTarget;
  }

  /**
   * Find a specific target by its ID
   */
  public static async findTargetById(targetId: string): Promise<GlucoseTarget | null> {
    const resolvedId =
      targetId === 'tgt-fasting'
        ? store.FASTING_TARGET_UUID
        : targetId === 'tgt-postmeal'
        ? store.POSTMEAL_TARGET_UUID
        : targetId;

    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_glucose_targets')
          .select('*')
          .eq('id', resolvedId)
          .maybeSingle();
        if (data && !error) return this.mapFromDb(data);
      } catch (err) {
        console.warn('Error fetching target by id from Supabase:', err);
      }
    }
    return (
      store.targets.find((t) => t.id === targetId || t.id === resolvedId) || null
    );
  }

  /**
   * Update an existing target
   */
  public static async updateTarget(
    targetId: string,
    updates: {
      minValue?: number | null;
      maxValue?: number | null;
      notes?: string;
      effectiveFrom?: string;
      effectiveUntil?: string | null;
      reason?: string;
    },
    currentUser: UserProfile
  ): Promise<GlucoseTarget | null> {
    const existing = await this.findTargetById(targetId);
    if (!existing) return null;

    const oldValues = { ...existing };

    const min = updates.minValue !== undefined ? (updates.minValue ?? undefined) : existing.minValue;
    const max = updates.maxValue !== undefined ? (updates.maxValue ?? undefined) : existing.maxValue;

    const updatedTarget: GlucoseTarget = {
      ...existing,
      minValue: min,
      maxValue: max,
      targetMin: min ?? existing.targetMin,
      targetMax: max ?? existing.targetMax,
      notes: updates.notes !== undefined ? updates.notes : existing.notes,
      effectiveFrom: updates.effectiveFrom || existing.effectiveFrom,
      effectiveUntil: updates.effectiveUntil !== undefined ? (updates.effectiveUntil ?? undefined) : existing.effectiveUntil,
      // Any change requires re-approval unless modified by clinician
      approvalStatus: currentUser.role === 'clinician' ? existing.approvalStatus : 'pending',
      clinicianApprovalStatus: currentUser.role === 'clinician' ? existing.clinicianApprovalStatus : 'unconfirmed',
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer
          .from('health_glucose_targets')
          .upsert(this.mapToDb(updatedTarget));
      } catch (err) {
        console.warn('Error updating target in Supabase:', err);
      }
    }

    const idx = store.targets.findIndex((t) => t.id === existing.id || t.id === targetId);
    if (idx >= 0) {
      store.targets[idx] = updatedTarget;
    } else {
      store.targets.unshift(updatedTarget);
    }

    await this.recordAuditLog({
      targetId: existing.id,
      patientId: existing.patientId,
      action: 'updated',
      oldValues,
      newValues: updatedTarget,
      changedBy: currentUser.id,
      changedByName: currentUser.fullName,
      reason: updates.reason || 'Target parameters modified'
    });

    return updatedTarget;
  }

  /**
   * Approve a target (Healthcare professional or authorized reviewer)
   */
  public static async approveTarget(
    targetId: string,
    params: { reason?: string; notes?: string },
    clinicianUser: UserProfile
  ): Promise<GlucoseTarget | null> {
    const existing = await this.findTargetById(targetId);
    if (!existing) return null;

    const oldValues = { ...existing };
    const nowIso = new Date().toISOString();

    // 1. Inactivate / supersede any previous active targets for the same measurement type
    await this.supersedePreviousTargets(existing.patientId, existing.measurementType, existing.id);

    const resolvedProfileId = await this.resolveProfileId(clinicianUser.id);

    // 2. Set this target to approved
    const approvedTarget: GlucoseTarget = {
      ...existing,
      approvalStatus: 'approved',
      clinicianApprovalStatus: 'clinician_approved',
      approvedBy: resolvedProfileId || clinicianUser.id,
      approvedByName: clinicianUser.fullName,
      approvedAt: nowIso,
      clinicianNotes: params.notes || existing.clinicianNotes,
      isActive: true,
      updatedAt: nowIso
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer
          .from('health_glucose_targets')
          .upsert(this.mapToDb(approvedTarget));
      } catch (err) {
        console.warn('Error approving target in Supabase:', err);
      }
    }

    const idx = store.targets.findIndex((t) => t.id === existing.id || t.id === targetId);
    if (idx >= 0) {
      store.targets[idx] = approvedTarget;
    } else {
      store.targets.unshift(approvedTarget);
    }

    await this.recordAuditLog({
      targetId: existing.id,
      patientId: existing.patientId,
      action: 'approved',
      oldValues,
      newValues: approvedTarget,
      changedBy: clinicianUser.id,
      changedByName: clinicianUser.fullName,
      reason: params.reason || 'Clinician approval granted'
    });

    return approvedTarget;
  }

  /**
   * Reject a target
   */
  public static async rejectTarget(
    targetId: string,
    params: { reason?: string; notes?: string },
    clinicianUser: UserProfile
  ): Promise<GlucoseTarget | null> {
    const existing = await this.findTargetById(targetId);
    if (!existing) return null;

    const oldValues = { ...existing };
    const nowIso = new Date().toISOString();

    const rejectedTarget: GlucoseTarget = {
      ...existing,
      approvalStatus: 'rejected',
      clinicianApprovalStatus: 'unconfirmed',
      clinicianNotes: params.notes || params.reason || 'Rejected by clinician',
      isActive: false,
      updatedAt: nowIso
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer
          .from('health_glucose_targets')
          .upsert(this.mapToDb(rejectedTarget));
      } catch (err) {
        console.warn('Error rejecting target in Supabase:', err);
      }
    }

    const idx = store.targets.findIndex((t) => t.id === existing.id || t.id === targetId);
    if (idx >= 0) {
      store.targets[idx] = rejectedTarget;
    } else {
      store.targets.unshift(rejectedTarget);
    }

    await this.recordAuditLog({
      targetId,
      patientId: existing.patientId,
      action: 'rejected',
      oldValues,
      newValues: rejectedTarget,
      changedBy: clinicianUser.id,
      changedByName: clinicianUser.fullName,
      reason: params.reason || 'Target rejected by clinician'
    });

    return rejectedTarget;
  }

  /**
   * Fetch target audit logs for patient
   */
  public static async getAuditLogs(patientId = store.PATIENT_ID): Promise<GlucoseTargetAuditLog[]> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('health_glucose_target_audit_logs')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            targetId: d.target_id,
            patientId: d.patient_id,
            action: d.action,
            oldValues: d.old_values,
            newValues: d.new_values,
            changedBy: d.changed_by,
            changedByName: d.changed_by_name,
            reason: d.reason,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching audit logs from Supabase:', err);
      }
    }

    return store.targetAuditLogs.filter((l) => l.patientId === patientId);
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private static async supersedePreviousTargets(
    patientId: string,
    measurementType: MeasurementType,
    excludeTargetId: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer
          .from('health_glucose_targets')
          .update({ is_active: false, approval_status: 'expired', updated_at: new Date().toISOString() })
          .eq('patient_id', patientId)
          .eq('measurement_type', measurementType)
          .neq('id', excludeTargetId);
      } catch (err) {
        console.warn('Error superseding previous targets in Supabase:', err);
      }
    }

    store.targets.forEach((t) => {
      if (t.patientId === patientId && t.measurementType === measurementType && t.id !== excludeTargetId) {
        t.isActive = false;
        t.approvalStatus = 'expired';
      }
    });
  }

  private static async recordAuditLog(
    logData: Omit<GlucoseTargetAuditLog, 'id' | 'createdAt'>
  ): Promise<void> {
    const entry: GlucoseTargetAuditLog = {
      ...logData,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `audit-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseServer) {
      try {
        const resolvedChangedBy = await this.resolveProfileId(entry.changedBy);
        await supabaseServer.from('health_glucose_target_audit_logs').insert({
          id: entry.id,
          target_id: entry.targetId,
          patient_id: entry.patientId,
          action: entry.action,
          old_values: entry.oldValues,
          new_values: entry.newValues,
          changed_by: resolvedChangedBy,
          changed_by_name: entry.changedByName,
          reason: entry.reason,
          created_at: entry.createdAt
        });
      } catch (err) {
        console.warn('Error inserting audit log in Supabase:', err);
      }
    }

    store.targetAuditLogs.unshift(entry);
  }

  private static mapFromDb(d: any): GlucoseTarget {
    const min = d.min_value !== null && d.min_value !== undefined ? Number(d.min_value) : undefined;
    const max = d.max_value !== null && d.max_value !== undefined ? Number(d.max_value) : undefined;
    const targetMin = min ?? (d.target_min ? Number(d.target_min) : 80);
    const targetMax = max ?? (d.target_max ? Number(d.target_max) : 130);

    return {
      id: d.id,
      patientId: d.patient_id,
      measurementType: d.measurement_type,
      minValue: min,
      maxValue: max,
      targetMin,
      targetMax,
      lowAlertThreshold: d.low_alert_threshold ? Number(d.low_alert_threshold) : 70,
      highAlertThreshold: d.high_alert_threshold ? Number(d.high_alert_threshold) : 180,
      unit: d.unit || 'mg/dL',
      source: d.source || 'clinician_configured',
      approvalStatus: d.approval_status || (d.clinician_approval_status === 'clinician_approved' ? 'approved' : 'pending'),
      effectiveFrom: d.effective_from || d.effective_date,
      effectiveUntil: d.effective_until || undefined,
      effectiveDate: d.effective_date || d.effective_from || new Date().toISOString(),
      notes: d.notes || d.clinician_notes,
      guidelineSource: d.guideline_source || 'ADA Standards of Care',
      guidelineVersion: d.guideline_version || '2026',
      createdBy: d.created_by,
      createdByName: d.created_by_name,
      approvedBy: d.approved_by,
      approvedByName: d.approved_by_name,
      approvedAt: d.approved_at,
      configuredBy: d.configured_by,
      configuredByName: d.configured_by_name,
      clinicianApprovalStatus: d.clinician_approval_status || (d.approval_status === 'approved' ? 'clinician_approved' : 'unconfirmed'),
      clinicianNotes: d.clinician_notes || d.notes,
      isActive: Boolean(d.is_active),
      createdAt: d.created_at,
      updatedAt: d.updated_at
    };
  }

  private static mapToDb(t: GlucoseTarget): Record<string, any> {
    return {
      id: t.id,
      patient_id: t.patientId,
      measurement_type: t.measurementType,
      min_value: t.minValue ?? null,
      max_value: t.maxValue ?? null,
      target_min: t.targetMin,
      target_max: t.targetMax,
      low_alert_threshold: t.lowAlertThreshold ?? 70,
      high_alert_threshold: t.highAlertThreshold ?? 180,
      unit: t.unit || 'mg/dL',
      source: t.source || 'clinician_configured',
      approval_status: t.approvalStatus || 'pending',
      effective_from: t.effectiveFrom || t.effectiveDate,
      effective_until: t.effectiveUntil || null,
      effective_date: t.effectiveDate || t.effectiveFrom,
      notes: t.notes || null,
      guideline_source: t.guidelineSource || 'ADA Standards of Care',
      guideline_version: t.guidelineVersion || '2026',
      created_by: t.createdBy || null,
      approved_by: t.approvedBy || null,
      approved_at: t.approvedAt || null,
      clinician_approval_status: t.clinicianApprovalStatus || 'unconfirmed',
      clinician_notes: t.clinicianNotes || t.notes || null,
      is_active: t.isActive
    };
  }
}
