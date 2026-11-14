// ============================================================================
// MedlinePlus Connect Service (Server-side Only)
// Official Documentation: https://medlineplus.gov/connect/overview.html
// Supported Code Systems: RxNorm (Medications), ICD-10 (Diagnoses), LOINC (Lab Tests)
// ============================================================================

import { HealthKnowledgeArticle } from '@/types';
import { stripHtml } from './medlinePlusService';

export const CODE_SYSTEM_OIDS = {
  RXNORM: '2.16.840.1.113883.6.88', // Medications
  ICD10CM: '2.16.840.1.113883.6.90', // Diagnoses
  LOINC: '2.16.840.1.113883.6.1' // Laboratory Tests
};

// Common diabetes medications mapped to RxNorm codes
export const DIABETES_RXNORM_MAP: Record<string, { code: string; name: string; nameKm: string }> = {
  metformin: { code: '860975', name: 'Metformin HCl', nameKm: 'ថ្នាំមេតហ្វ័រមីន (Metformin)' },
  gliclazide: { code: '4715', name: 'Gliclazide', nameKm: 'ថ្នាំគ្លីក្លាស៊ីត (Gliclazide)' },
  glipizide: { code: '4821', name: 'Glipizide', nameKm: 'ថ្នាំគ្លីពីស៊ីត (Glipizide)' },
  sitagliptin: { code: '593411', name: 'Sitagliptin (Januvia)', nameKm: 'ថ្នាំស៊ីតាក្លីបទីន (Sitagliptin)' },
  empagliflozin: { code: '1545653', name: 'Empagliflozin (Jardiance)', nameKm: 'ថ្នាំអែមប៉ាក្លីហ្វ្លូស៊ីន (Empagliflozin)' },
  insulin: { code: '847207', name: 'Human Insulin', nameKm: 'អាំងស៊ុយលីន (Insulin)' }
};

// Common clinical codes for diabetes tests and diagnoses
export const DIABETES_CLINICAL_CODES = {
  HBA1C: { code: '4548-4', system: CODE_SYSTEM_OIDS.LOINC, title: 'Hemoglobin A1c (HbA1c) Test', titleKm: 'តេស្តអេម៉ូក្លូប៊ីន A1c (HbA1c)' },
  FASTING_GLUCOSE: { code: '1558-6', system: CODE_SYSTEM_OIDS.LOINC, title: 'Fasting Blood Glucose Test', titleKm: 'តេស្តជាតិស្ករពេលព្រឹកមិនទាន់ពិសាអាហារ' },
  TYPE_2_DIABETES: { code: 'E11.9', system: CODE_SYSTEM_OIDS.ICD10CM, title: 'Type 2 Diabetes Mellitus', titleKm: 'ជំងឺទឹកនោមផ្អែមប្រភេទទី ២' },
  HYPOGLYCEMIA: { code: 'E16.2', system: CODE_SYSTEM_OIDS.ICD10CM, title: 'Hypoglycemia (Low Blood Sugar)', titleKm: 'ជាតិស្ករធ្លាក់ចុះទាប (Hypoglycemia)' },
  HYPERGLYCEMIA: { code: 'R73.9', system: CODE_SYSTEM_OIDS.ICD10CM, title: 'Hyperglycemia (High Blood Sugar)', titleKm: 'ជាតិស្ករឡើងខ្ពស់ (Hyperglycemia)' }
};

interface CacheEntry {
  timestamp: number;
  data: HealthKnowledgeArticle[];
}

const connectCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Queries MedlinePlus Connect by Code System and Code
 */
export async function queryMedlinePlusConnect(
  code: string,
  systemOid: string = CODE_SYSTEM_OIDS.RXNORM
): Promise<HealthKnowledgeArticle[]> {
  const cacheKey = `${systemOid}_${code}`;

  const cached = connectCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=${encodeURIComponent(
    systemOid
  )}&mainSearchCriteria.v.c=${encodeURIComponent(code)}&knowledgeResponseType=application/json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FamilyDiabetesCare/1.0 (Health Education Module)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`MedlinePlus Connect returned ${response.status} for code ${code}`);
      return [];
    }

    const json = await response.json();
    const entries = json?.feed?.entry;

    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    const articles: HealthKnowledgeArticle[] = entries.map((entry: any, index: number) => {
      const title = entry.title?._value || 'Medication Education';
      const link = entry.link?.find((l: any) => l.rel === 'alternate')?.href || 'https://medlineplus.gov';
      const rawSummary = entry.summary?._value || '';
      const cleanSummary = stripHtml(rawSummary);

      return {
        id: `mpc-${code}-${index}`,
        category: 'medications',
        title,
        titleKm: '',
        summary: cleanSummary.slice(0, 300) + (cleanSummary.length > 300 ? '...' : ''),
        summaryKm: '',
        contentHtml: rawSummary,
        sourceName: 'U.S. National Library of Medicine (MedlinePlus Connect)',
        sourceUrl: link,
        lastReviewed: entry.updated?._value?.split('T')[0] || new Date().toISOString().split('T')[0],
        clinicalCode: code,
        tags: ['MedlinePlus Connect', 'RxNorm', 'Drug Information'],
        isCurated: false
      };
    });

    connectCache.set(cacheKey, {
      timestamp: Date.now(),
      data: articles
    });

    return articles;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Error querying MedlinePlus Connect:', err.message || err);
    return [];
  }
}

/**
 * Lookup diabetes medication educational info by search name or RxNorm code
 */
export async function lookupMedicationEducation(searchQuery: string): Promise<HealthKnowledgeArticle[]> {
  const query = searchQuery.trim().toLowerCase();

  // 1. Check if query matches our known diabetes medication mappings
  let matchedCode: string | null = null;
  for (const [key, val] of Object.entries(DIABETES_RXNORM_MAP)) {
    if (query.includes(key) || key.includes(query) || val.name.toLowerCase().includes(query)) {
      matchedCode = val.code;
      break;
    }
  }

  // If a code was matched, query MedlinePlus Connect
  if (matchedCode) {
    const results = await queryMedlinePlusConnect(matchedCode, CODE_SYSTEM_OIDS.RXNORM);
    if (results.length > 0) return results;
  }

  // 2. If directly passed a numeric code, query with that code
  if (/^\d+$/.test(query)) {
    const results = await queryMedlinePlusConnect(query, CODE_SYSTEM_OIDS.RXNORM);
    if (results.length > 0) return results;
  }

  // 3. Fallback: Default to Metformin (the standard first-line oral diabetes medication)
  return await queryMedlinePlusConnect(DIABETES_RXNORM_MAP.metformin.code, CODE_SYSTEM_OIDS.RXNORM);
}

