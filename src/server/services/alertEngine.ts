// ============================================================================
// Safe Alert Engine (ម៉ាស៊ីនវិភាគដំណឹងសុវត្ថិភាពវេជ្ជសាស្ត្រ)
// Deterministic, Non-diagnostic Server-side Safety Logic
// ============================================================================

import {
  GlucoseRecord,
  GlucoseTarget,
  TargetStatus,
  AlertCategory,
  AlertType,
  NotificationAlert
} from '@/types';

export interface AlertEvaluationInput {
  valueMgDl: number;
  measurementType: GlucoseRecord['measurementType'];
  symptoms?: string[];
  patientTarget?: GlucoseTarget;
  recentRecords?: GlucoseRecord[];
}

export interface AlertEvaluationResult {
  category: AlertCategory;
  alertType: AlertType;
  targetStatus: TargetStatus;
  triggerAlert: boolean;
  titleEn: string;
  titleKm: string;
  messageEn: string;
  messageKm: string;
  guidanceEn: string;
  guidanceKm: string;
  requiresImmediateEmergency: boolean;
}

const SEVERE_SYMPTOM_KEYS = [
  'unconscious',
  'unconsciousness',
  'seizure',
  'inability_to_swallow',
  'cannot_swallow',
  'severe_confusion'
];

export class SafeAlertEngine {
  /**
   * Deterministically evaluate a glucose reading with safe, non-diagnostic guidelines.
   */
  public static evaluateReading(input: AlertEvaluationInput): AlertEvaluationResult {
    const { valueMgDl, measurementType, symptoms = [], patientTarget, recentRecords = [] } = input;

    // Check for severe symptoms first (triggers critical guidance regardless of glucose value)
    const hasSevereSymptoms = symptoms.some((s) =>
      SEVERE_SYMPTOM_KEYS.some((key) => s.toLowerCase().includes(key))
    );

    if (hasSevereSymptoms) {
      return {
        category: 'critical',
        alertType: 'severe_symptoms',
        targetStatus: valueMgDl < 54 ? 'critical_low' : valueMgDl < 70 ? 'low' : 'high',
        triggerAlert: true,
        requiresImmediateEmergency: true,
        titleEn: '🚨 Critical Emergency: Severe Symptoms Reported',
        titleKm: '🚨 អាសន្នធ្ងន់ធ្ងរ៖ រោគសញ្ញាគ្រោះថ្នាក់',
        messageEn: `Severe symptoms reported with glucose reading of ${valueMgDl} mg/dL.`,
        messageKm: `មានរោគសញ្ញាធ្ងន់ធ្ងរត្រូវបានរាយការណ៍ រួមជាមួយកម្រិតជាតិស្ករ ${valueMgDl} mg/dL។`,
        guidanceEn:
          'EMERGENCY INSTRUCTION: Call emergency medical services (119 or local hospital) IMMEDIATELY. If the patient is unconscious or unable to swallow, DO NOT give any food, liquids, or oral medications. Position patient on their side to maintain an open airway.',
        guidanceKm:
          'ការណែនាំបន្ទាន់៖ សូមទូរស័ព្ទទៅសង្គ្រោះបន្ទាន់ (119 ឬមន្ទីរពេទ្យ) ជាបន្ទាន់! ប្រសិនបើអ្នកជំងឺបាត់បង់ស្មារតី ឬមិនអាចលេបបាន សូមកុំបញ្ចុកអាហារ ទឹក ឬថ្នាំតាមមាត់ជាដាច់ខាត។ ផ្អៀងខ្លួនអ្នកជំងឺទៅម្ខាងដើម្បីងាយដកដង្ហើម។'
      };
    }

    // 1. Critical Low Glucose (< 54 mg/dL)
    if (valueMgDl < 54) {
      return {
        category: 'critical',
        alertType: 'critical_low',
        targetStatus: 'critical_low',
        triggerAlert: true,
        requiresImmediateEmergency: true,
        titleEn: '🚨 Critical Low Blood Sugar (< 54 mg/dL)',
        titleKm: '🚨 ជាតិស្ករធ្លាក់ចុះទាបកម្រិតគ្រោះថ្នាក់ (< 54 mg/dL)',
        messageEn: `Mom's blood sugar is critically low at ${valueMgDl} mg/dL (${measurementType}).`,
        messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់គឺធ្លាក់ចុះទាបខ្លាំង ${valueMgDl} mg/dL (${measurementType})។`,
        guidanceEn:
          'ACTION REQUIRED: If conscious and able to swallow, apply the educational 15-15 rule: provide 15 grams of rapid fast-acting sugar (e.g. 1/2 cup of fruit juice or 3-4 sugar candies), wait 15 minutes, and re-test. If unconscious or unable to swallow, DO NOT give anything by mouth — call emergency services immediately.',
        guidanceKm:
          'វិធានការបន្ទាន់៖ ប្រសិនបើនៅដឹងខ្លួន និងអាចលេបបាន សូមអនុវត្តគោលការណ៍ ១៥-១៥៖ ឱ្យពិសារជាតិស្ករស្រូបលឿន ១៥ ក្រាម (ដូចជាទឹកផ្លែឈើកន្លះកែវ ឬស្ករគ្រាប់ ៣-៤ គ្រាប់) រួចរង់ចាំ ១៥ នាទី និងវាស់ម្ដងទៀត។ ប្រសិនបើសន្លប់ ឬលេបមិនរួច សូមកុំបញ្ចុកអ្វីទាំងអស់ ហើយទូរស័ព្ទទៅពេទ្យជាបន្ទាន់។'
      };
    }

    // 2. Attention Low Glucose (54 - 69 mg/dL)
    if (valueMgDl < 70) {
      return {
        category: 'attention',
        alertType: 'attention_low',
        targetStatus: 'low',
        triggerAlert: true,
        requiresImmediateEmergency: false,
        titleEn: '⚠️ Blood Sugar Attention: Low (< 70 mg/dL)',
        titleKm: '⚠️ ជាតិស្ករធ្លាក់ចុះទាប (< 70 mg/dL)',
        messageEn: `Mom's blood sugar is ${valueMgDl} mg/dL, which is below the safe threshold of 70 mg/dL.`,
        messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់គឺ ${valueMgDl} mg/dL ដែលទាបជាងកម្រិតសុវត្ថិភាព ៧០ mg/dL។`,
        guidanceEn:
          'Recommended Action: If conscious, have 15 grams of simple carbohydrates (e.g. 1/2 glass of sweet juice). Rest and re-check blood glucose in 15 minutes. Notify caregiver and contact clinician if symptoms persist. Do not skip scheduled meals.',
        guidanceKm:
          'ការណែនាំ៖ ប្រសិនបើដឹងខ្លួនធម្មតា សូមពិសារកាបូអ៊ីដ្រាតសាមញ្ញ ១៥ ក្រាម (ដូចជាទឹកផ្អែមកន្លះកែវ)។ សម្រាក និងវាស់ជាតិស្ករឡើងវិញក្រោយ ១៥ នាទី។ ជូនដំណឹងដល់កូនចៅ និងទាក់ទងគ្រូពេទ្យប្រសិនមិនធូរស្រាល។ កុំអត់បាយ។'
      };
    }

    // Determine configured target thresholds
    // Use patient target if available; otherwise use standard educational reference:
    // Fasting/pre-meal: 80 - 130 mg/dL; post-meal: < 180 mg/dL; bedtime: 100 - 140 mg/dL
    const isPostMeal = measurementType === '1h_after_meal' || measurementType === '2h_after_meal';
    const defaultMin = isPostMeal ? 90 : 80;
    const defaultMax = isPostMeal ? 180 : 130;

    const targetMin = patientTarget?.targetMin ?? defaultMin;
    const targetMax = patientTarget?.targetMax ?? defaultMax;

    // 3. Repeated High Readings Check
    // e.g. check if 2 or more recent readings of the same measurement type exceeded target
    const recentSameType = recentRecords
      .filter((r) => r.measurementType === measurementType)
      .slice(0, 3);

    const consecutiveHighCount = recentSameType.filter((r) => r.valueMgDl > targetMax).length;

    if (valueMgDl > targetMax && consecutiveHighCount >= 2) {
      return {
        category: 'attention',
        alertType: 'repeated_high',
        targetStatus: 'high',
        triggerAlert: true,
        requiresImmediateEmergency: false,
        titleEn: '⚠️ Pattern Attention: Repeated High Readings',
        titleKm: '⚠️ ការយកចិត្តទុកដាក់៖ ជាតិស្ករឡើងខ្ពស់ផ្ទួនៗ',
        messageEn: `Mom's reading of ${valueMgDl} mg/dL is above the personal target (${targetMin}–${targetMax} mg/dL) for consecutive measurements.`,
        messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់ ${valueMgDl} mg/dL លើសពីគោលដៅកំណត់ (${targetMin}–${targetMax} mg/dL) ចំនួនច្រើនដងផ្ទួនៗ។`,
        guidanceEn:
          'Medical Follow-up Guidance: Record detailed meal and activity logs. Ensure regular hydration with plain water. Do NOT change prescribed medication doses or take extra medication without consulting Dr. Chanthy Keo or your attending clinician.',
        guidanceKm:
          'ការណែនាំវេជ្ជសាស្ត្រ៖ សូមកត់ត្រាអាហារ និងសកម្មភាពឱ្យបានលម្អិត។ ពិសារទឹកស្អាតឱ្យបានគ្រប់គ្រាន់។ សូមកុំផ្លាស់ប្តូរកម្រិតថ្នាំ ឬលេបថ្នាំលើសដោយគ្មានការពិគ្រោះជាមួយលោកវេជ្ជបណ្ឌិតឡើយ។'
      };
    }

    // 4. Single Reading Above Target Max
    if (valueMgDl > targetMax) {
      const isUnconfirmed = patientTarget?.clinicianApprovalStatus === 'unconfirmed';
      const targetLabel = isUnconfirmed ? '(Unconfirmed Reference)' : '(Personal Target)';

      return {
        category: 'attention',
        alertType: 'target_exceeded',
        targetStatus: 'high',
        triggerAlert: true,
        requiresImmediateEmergency: false,
        titleEn: `⚠️ Blood Sugar Attention: Above Target`,
        titleKm: `⚠️ ការយកចិត្តទុកដាក់៖ លើសពីគោលដៅកំណត់`,
        messageEn: `Mom's reading: ${valueMgDl} mg/dL\nMeasurement: ${measurementType.replace('_', ' ')}\nStatus: Above target range (${targetMin}–${targetMax} mg/dL ${targetLabel}).`,
        messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់៖ ${valueMgDl} mg/dL\nពេលវាស់៖ ${measurementType}\nស្ថានភាព៖ លើសពីកម្រិតគោលដៅ (${targetMin}–${targetMax} mg/dL)។`,
        guidanceEn:
          'Review the reading and continue the prescribed care plan. Stay hydrated and monitor the next scheduled reading. Never take extra medication to force blood glucose down without clinician instruction.',
        guidanceKm:
          'សូមពិនិត្យមើលការវាស់នេះ និងបន្តអនុវត្តផែនការថែទាំដែលបានណែនាំ។ ពិសារទឹកឱ្យបានគ្រប់គ្រាន់ និងរង់ចាំវាស់ពេលបន្ទាប់។ សូមកុំលេបថ្នាំបន្ថែមដើម្បីបន្ថយជាតិស្ករដោយគ្មានវេជ្ជបញ្ជា។'
      };
    }

    // 5. Reading Below Configured Min (70 - targetMin)
    if (valueMgDl < targetMin) {
      return {
        category: 'attention',
        alertType: 'target_exceeded',
        targetStatus: 'low',
        triggerAlert: true,
        requiresImmediateEmergency: false,
        titleEn: '⚠️ Blood Sugar Attention: Slightly Below Target',
        titleKm: '⚠️ ការយកចិត្តទុកដាក់៖ ទាបជាងកម្រិតគោលដៅបន្តិច',
        messageEn: `Mom's reading of ${valueMgDl} mg/dL is slightly below the target minimum (${targetMin} mg/dL).`,
        messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់ ${valueMgDl} mg/dL គឺទាបជាងកម្រិតគោលដៅអប្បបរមា (${targetMin} mg/dL) បន្តិច។`,
        guidanceEn:
          'Ensure regular meals and monitor for symptoms like shakiness or sweating. Re-test if symptoms develop.',
        guidanceKm:
          'សូមប្រាកដថាពិសារអាហារទៀងទាត់ និងសង្កេតរោគសញ្ញាដូចជាញ័រដៃ ឬបែកញើស។ វាស់ឡើងវិញប្រសិនបើមានរោគសញ្ញា។'
      };
    }

    // 6. Normal Target Range
    return {
      category: 'info',
      alertType: 'daily_summary',
      targetStatus: 'normal',
      triggerAlert: false,
      requiresImmediateEmergency: false,
      titleEn: '✅ Blood Sugar Within Target',
      titleKm: '✅ ជាតិស្ករស្ថិតក្នុងកម្រិតគោលដៅល្អ',
      messageEn: `Mom's reading of ${valueMgDl} mg/dL is within the target range (${targetMin}–${targetMax} mg/dL).`,
      messageKm: `កម្រិតជាតិស្កររបស់ម៉ាក់ ${valueMgDl} mg/dL គឺស្ថិតក្នុងកម្រិតគោលដៅល្អ (${targetMin}–${targetMax} mg/dL)។`,
      guidanceEn: 'Great job maintaining the routine! Continue the prescribed care plan and balanced meals.',
      guidanceKm: 'ការថែទាំបានល្អណាស់! សូមបន្តអនុវត្តផែនការថែទាំ និងបរិភោគអាហារមានតុល្យភាពជាធម្មតា។'
    };
  }

  /**
   * Safe deduplication: Suppress duplicate NON-CRITICAL alerts if an identical alert was sent
   * within the window (e.g. 60 minutes).
   * CRITICAL ALERTS ARE NEVER SUPPRESSED.
   */
  public static shouldDeduplicate(
    newAlert: AlertEvaluationResult,
    recentAlerts: NotificationAlert[],
    windowMinutes = 60
  ): boolean {
    // Rule: Never suppress critical alerts
    if (newAlert.category === 'critical') {
      return false;
    }

    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const duplicateFound = recentAlerts.some((existing) => {
      if (existing.createdAt < cutoff) return false;
      return existing.alertType === newAlert.alertType && existing.category === newAlert.category;
    });

    return duplicateFound;
  }
}

