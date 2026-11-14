// ============================================================================
// openFDA API Client (Server-side Only)
// Documentation: https://open.fda.gov/apis/drug/
// Base URL: https://api.fda.gov/drug/
// ============================================================================

import {
  MedicationClinicalLabel,
  MedicationSafetyInfo,
  OpenFDAAdverseEventReport
} from '@/types/medication-database';

const OPENFDA_BASE = 'https://api.fda.gov/drug';
const REQUEST_TIMEOUT_MS = 8000;

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const labelCache = new Map<string, CacheEntry<MedicationClinicalLabel | null>>();
const safetyCache = new Map<string, CacheEntry<MedicationSafetyInfo | null>>();

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export class OpenFDAClient {
  private static async fetchJson<T>(url: string): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FamilyDiabetesCare/1.0 (Public Medication Database)'
        }
      });
      clearTimeout(timer);

      if (!response.ok) {
        if (response.status !== 404) {
          console.warn(`[openFDA] HTTP ${response.status} from ${url}`);
        }
        return null;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[openFDA] Request failed: ${url}`, err.message);
      return null;
    }
  }

  /**
   * Search official FDA drug label by generic/brand name or RxCUI
   */
  public static async getDrugLabel(
    query: { drugName?: string; rxcui?: string }
  ): Promise<MedicationClinicalLabel | null> {
    const key = query.rxcui || query.drugName?.toLowerCase() || '';
    if (!key) return null;

    const cached = labelCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    let searchParam = '';
    if (query.rxcui) {
      searchParam = `openfda.rxcui:"${encodeURIComponent(query.rxcui)}"`;
    } else if (query.drugName) {
      const cleanName = query.drugName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      searchParam = `openfda.generic_name:"${encodeURIComponent(
        cleanName
      )}"+openfda.brand_name:"${encodeURIComponent(cleanName)}"`;
    }

    const endpoint = `${OPENFDA_BASE}/label.json?search=${searchParam}&limit=1`;
    const json: any = await this.fetchJson(endpoint);

    const result = json?.results?.[0];
    if (!result) {
      labelCache.set(key, { timestamp: Date.now(), data: null });
      return null;
    }

    const cleanField = (fieldArray: string[] | undefined): string | undefined => {
      if (!Array.isArray(fieldArray) || fieldArray.length === 0) return undefined;
      return fieldArray.join('\n\n').trim();
    };

    const label: MedicationClinicalLabel = {
      setId: result.set_id || result.id,
      drugName: query.drugName || result.openfda?.generic_name?.[0] || 'Medication Label',
      genericName: result.openfda?.generic_name?.[0],
      brandName: result.openfda?.brand_name?.[0],
      indicationsAndUsage: cleanField(result.indications_and_usage),
      dosageAndAdministration: cleanField(result.dosage_and_administration),
      contraindications: cleanField(result.contraindications),
      warningsAndPrecautions: cleanField(result.warnings_and_cautions || result.warnings),
      boxedWarning: cleanField(result.boxed_warning),
      adverseReactions: cleanField(result.adverse_reactions),
      storageAndHandling: cleanField(result.storage_and_handling || result.how_supplied),
      sourceName: 'openFDA',
      sourceUrl: 'https://open.fda.gov/apis/drug/label/',
      disclaimer:
        'Official FDA labeling information provided for educational purposes. Prescriptions must follow the attending physician instructions.'
    };

    labelCache.set(key, { timestamp: Date.now(), data: label });
    return label;
  }

  /**
   * Get adverse event reporting summaries and safety warnings
   */
  public static async getSafetyInfo(
    drugName: string,
    rxcui: string
  ): Promise<MedicationSafetyInfo | null> {
    const key = `${rxcui}_${drugName.toLowerCase()}`;
    const cached = safetyCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const cleanName = drugName.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ')[0];

    const [labelData, eventData]: [any, any] = await Promise.all([
      this.getDrugLabel({ rxcui, drugName }),
      this.fetchJson(
        `${OPENFDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(
          cleanName
        )}"&limit=5`
      )
    ]);

    const warnings: string[] = [];
    if (labelData?.warningsAndPrecautions) {
      // Extract first 3 high-level points
      const lines = labelData.warningsAndPrecautions.split('\n').filter((l: string) => l.trim().length > 10);
      warnings.push(...lines.slice(0, 3));
    }

    const contraindications: string[] = [];
    if (labelData?.contraindications) {
      const lines = labelData.contraindications.split('\n').filter((l: string) => l.trim().length > 10);
      contraindications.push(...lines.slice(0, 3));
    }

    const recentReactions: string[] = [];
    if (Array.isArray(eventData?.results)) {
      for (const ev of eventData.results) {
        const reactions = ev?.patient?.reaction;
        if (Array.isArray(reactions)) {
          for (const r of reactions) {
            const pt = r.reactionmeddrapt;
            if (pt && !recentReactions.includes(pt)) {
              recentReactions.push(pt);
            }
          }
        }
      }
    }

    const safety: MedicationSafetyInfo = {
      rxcui,
      drugName,
      boxedWarning: labelData?.boxedWarning,
      warnings,
      contraindications,
      commonAdverseReactions: [
        'Gastrointestinal discomfort (nausea, diarrhea, stomach ache)',
        'Mild dizziness or headache',
        'Hypoglycemia risk when combined with sulfonylureas or insulin'
      ],
      recentEventReactions: recentReactions.slice(0, 8),
      totalReportedEvents: eventData?.meta?.results?.total,
      sourceAttribution: 'U.S. Food and Drug Administration (openFDA)',
      safetyDisclaimer:
        'Notice: Adverse event reports represent spontaneous submissions to FDA and do NOT prove medical causation. Never alter prescribed dosage without clinical consultation.'
    };

    safetyCache.set(key, { timestamp: Date.now(), data: safety });
    return safety;
  }
}

